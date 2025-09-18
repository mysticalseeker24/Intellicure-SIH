# backend/app/faiss_utils.py
import os
import numpy as np
import pandas as pd
import faiss
import logging
from difflib import get_close_matches

logger = logging.getLogger("faiss_utils")

class FaissService:
    def __init__(self, index_path="./data/faiss_icd_hnsw.idx", meta_path="./data/icd_meta.npy", icd_csv="./data/icd_corpus.csv"):
        self.index_path = index_path
        self.meta_path = meta_path
        self.icd_csv = icd_csv
        self.index = None
        self.meta = None
        self.icd_list = []
        self.index_loaded = False
        self.n_items = 0
        self._try_load()

    def _try_load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            try:
                logger.info(f"Loading FAISS index from {self.index_path}")
                self.index = faiss.read_index(self.index_path)
                self.meta = np.load(self.meta_path, allow_pickle=True)
                self.n_items = len(self.meta)
                self.index_loaded = True
                logger.info(f"FAISS index loaded with {self.n_items} items")
            except Exception as e:
                logger.exception("Failed to load FAISS index")
                self.index_loaded = False
        else:
            # try load icd_csv as fallback corpus for fuzzy search
            self.load_icd_corpus()

    def load_icd_corpus(self):
        if os.path.exists(self.icd_csv):
            df = pd.read_csv(self.icd_csv, encoding='utf-8')
            self.icd_list = df['icd_term'].astype(str).fillna("").tolist()
            # also store meta array shape
            try:
                self.meta = np.empty(len(df), dtype=object)
                for i, row in df.iterrows():
                    self.meta[i] = (row.get('icd_code', ''), row.get('icd_term', ''), row.get('icd_description', ''))
                self.n_items = len(df)
                logger.info(f"Loaded ICD corpus CSV with {self.n_items} rows")
            except Exception:
                logger.exception("failed to build meta from icd csv")
        else:
            logger.warning("No ICD CSV found for fallback; icd_list empty")

    def search_text(self, text, k=5):
        """
        Search when index is loaded: embed externally and call this with an embedding or with FAISS index directly
        This function expects the index to be already built and to accept raw text only if model exists.
        """
        if not self.index_loaded:
            # Fallback to fuzzy search if no index
            return fallback_search_icd(text, self.icd_list, k=k)
        
        # If we have the index, we need an embedding service - this should be called from main.py with embed_service
        raise RuntimeError("search_text requires embed_service. Use search_text_with_embedding instead.")

    def search_text_with_embedding(self, text, embed_service, k=5):
        """
        Embed the text using the provided embed_service and query index.
        """
        if not self.index_loaded:
            raise RuntimeError("Index not loaded")
        vec = embed_service.embed([text]).astype('float32')
        # tune efSearch at query time if HNSW
        try:
            if hasattr(self.index, 'hnsw'):
                self.index.hnsw.efSearch = 128
        except Exception:
            pass
        D, I = self.index.search(vec, k)
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx < 0:
                continue
            meta = self.meta[idx]
            results.append({"icd_code": meta['icd_code'], "icd_term": meta['icd_term'], "icd_description": meta['icd_description'], "score": float(dist)})
        return results

def fallback_search_icd(query, corpus_list, k=5):
    """
    Very simple fallback: use difflib.get_close_matches on corpus_list
    Returns list of dicts: icd_term,score (approx)
    """
    if not corpus_list:
        return []
    matches = get_close_matches(query, corpus_list, n=k, cutoff=0.3)
    results = []
    for m in matches:
        # approximate score by similarity of sequences (simple)
        score = 0.7  # placeholder
        results.append({"icd_term": m, "score": score})
    return results
