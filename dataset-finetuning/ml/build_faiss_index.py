#!/usr/bin/env python3
"""
Build FAISS HNSW index for ICD corpus.

Usage:
  export FINETUNED_MODEL_DIR="./models/gemma_finetuned"
  python ml/build_faiss_index.py --icd_csv data/icd_corpus.csv --out_index data/faiss_icd_hnsw.idx --out_meta data/icd_meta.npy

- Expects `icd_corpus.csv` with columns: icd_code,icd_term,icd_description
- Produces:
    * FAISS index file (binary)
    * metadata numpy array (structured) mapping index id -> icd_code,icd_term,icd_description
    * icd_embeddings.npy (optional) saved alongside
"""
import os
import argparse
from pathlib import Path
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("build_faiss_index")

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--icd_csv", required=True, help="CSV with columns icd_code,icd_term,icd_description")
    p.add_argument("--model_dir", default=os.environ.get("FINETUNED_MODEL_DIR","./models/gemma_finetuned"))
    p.add_argument("--out_index", default="data/faiss_icd_hnsw.idx")
    p.add_argument("--out_meta", default="data/icd_meta.npy")
    p.add_argument("--out_embeddings", default="data/icd_embeddings.npy")
    p.add_argument("--batch_size", type=int, default=64)
    p.add_argument("--m", type=int, default=32, help="HNSW M parameter")
    p.add_argument("--ef_construction", type=int, default=200)
    return p.parse_args()

def load_icd_corpus(path):
    df = pd.read_csv(path, encoding='utf-8')
    # Check for either naming convention
    if 'icd11_code' in df.columns:
        # Rename to expected format
        df = df.rename(columns={
            'icd11_code': 'icd_code',
            'icd11_term': 'icd_term', 
            'icd11_description': 'icd_description'
        })
    
    # Ensure columns exist
    for c in ['icd_code','icd_term','icd_description']:
        if c not in df.columns:
            raise ValueError(f"Expected column {c} in {path}")
    
    # Use embed_text if already exists, otherwise build it
    if 'embed_text' not in df.columns:
        df['embed_text'] = (df['icd_term'].fillna('') + " | " + df['icd_description'].fillna('') + " | " + df['icd_code'].fillna('')).str.strip()
    return df

def main():
    args = parse_args()
    logger.info(f"Args: {args}")

    df = load_icd_corpus(args.icd_csv)
    texts = df['embed_text'].tolist()
    n = len(texts)
    logger.info(f"Loaded {n} ICD rows")

    logger.info(f"Loading model from {args.model_dir}")
    model = SentenceTransformer(args.model_dir)

    # encode in batches
    embeddings = []
    for i in range(0, n, args.batch_size):
        batch = texts[i:i+args.batch_size]
        emb = model.encode(batch, convert_to_numpy=True, show_progress_bar=False, batch_size=args.batch_size)
        embeddings.append(emb)
        logger.info(f"Encoded {i+len(batch)}/{n}")
    embeddings = np.vstack(embeddings).astype('float32')

    # Normalize to use inner-product as cosine
    faiss.normalize_L2(embeddings)

    d = embeddings.shape[1]
    logger.info(f"Embedding dim: {d}")

    # Build HNSW index
    logger.info(f"Building HNSW index (M={args.m}, efConstruction={args.ef_construction})")
    index = faiss.IndexHNSWFlat(d, args.m)
    index.hnsw.efConstruction = args.ef_construction
    index.add(embeddings)
    logger.info(f"Added {index.ntotal} vectors to index")

    # Save index and metadata
    out_idx = args.out_index
    faiss.write_index(index, out_idx)
    logger.info(f"Wrote FAISS index to {out_idx}")

    # Save metadata as structured numpy array for fast lookup
    dtype = np.dtype([('icd_code', 'U64'), ('icd_term', 'U256'), ('icd_description', 'U512')])
    meta = np.empty(n, dtype=dtype)
    meta['icd_code'] = df['icd_code'].astype(str).values
    meta['icd_term'] = df['icd_term'].astype(str).values
    meta['icd_description'] = df['icd_description'].astype(str).values
    np.save(args.out_meta, meta)
    logger.info(f"Wrote metadata to {args.out_meta}")

    # Save raw embeddings (optional)
    np.save(args.out_embeddings, embeddings)
    logger.info(f"Wrote embeddings to {args.out_embeddings}")

    logger.info("Done. You can load the index with faiss.read_index and meta with numpy.load.")

if __name__ == "__main__":
    main()
