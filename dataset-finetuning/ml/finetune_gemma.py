#!/usr/bin/env python3
"""
Finetune EmbeddingGemma for NAMASTE -> ICD semantic mapping.

Usage:
    # ensure HF token in env:
    export HUGGINGFACE_HUB_TOKEN="hf_xxx"
    export FINETUNED_MODEL_DIR="./models/gemma_finetuned"
    python ml/finetune_gemma.py --train data/namaste_finetune_train.tsv --val data/namaste_finetune_val.tsv

Description:
- Expects TSVs with two columns: namaste_text<TAB>icd_text (header row allowed).
- Uses sentence-transformers; default base model is taken from EMBEDDING_MODEL env var or google/embeddinggemma-300m.
- Trains with MultipleNegativesRankingLoss (good for many positives).
- Saves finetuned model to FINETUNED_MODEL_DIR.

Notes:
- Best run on a GPU machine. If running on CPU, reduce batch size.
- Tune cmd-line args: --epochs, --batch_size, --lr
"""
import os
import argparse
from pathlib import Path
import pandas as pd
from sentence_transformers import SentenceTransformer, InputExample, losses, models
from torch.utils.data import DataLoader
import math
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("finetune_gemma")

def read_pairs_tsv(path):
    df = pd.read_csv(path, sep='\t', encoding='utf-8', engine='python')
    # try common column names
    if list(df.columns)[:2] != ['namaste_text','icd_text']:
        # attempt to find sensible columns
        cols = [c for c in df.columns]
        namaste_col = next((c for c in cols if 'namaste' in c.lower() and 'text' in c.lower()), cols[0])
        icd_col = next((c for c in cols if 'icd' in c.lower() and 'text' in c.lower()), cols[1] if len(cols)>1 else cols[0])
        df = df[[namaste_col, icd_col]]
        df.columns = ['namaste_text','icd_text']
    # drop empty rows
    df = df.dropna(subset=['namaste_text','icd_text'])
    df = df.astype(str)
    return df

def build_examples(df, max_examples=None):
    rows = df.to_dict(orient='records')
    if max_examples:
        rows = rows[:max_examples]
    examples = [InputExample(texts=[r['namaste_text'], r['icd_text']]) for r in rows]
    return examples

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--train", required=True, help="Train TSV: namaste_text\\ticd_text")
    p.add_argument("--val", required=True, help="Val TSV")
    p.add_argument("--base_model", default=os.environ.get("EMBEDDING_MODEL","google/embeddinggemma-300m"),
                   help="Base embedding model (Hugging Face id or local path)")
    p.add_argument("--out", default=os.environ.get("FINETUNED_MODEL_DIR","./models/gemma_finetuned"))
    p.add_argument("--epochs", type=int, default=3)
    p.add_argument("--batch_size", type=int, default=32)
    p.add_argument("--lr", type=float, default=2e-5)
    p.add_argument("--warmup_steps", type=int, default=1000)
    p.add_argument("--max_examples", type=int, default=None, help="If set, subsample dataset for quick runs")
    p.add_argument("--use_amp", action="store_true", help="Use mixed precision (if GPU + torch supports)")
    return p.parse_args()

def main():
    args = parse_args()
    logger.info(f"Args: {args}")

    train_df = read_pairs_tsv(args.train)
    val_df = read_pairs_tsv(args.val)

    logger.info(f"Train pairs: {len(train_df)}, Val pairs: {len(val_df)}")

    train_examples = build_examples(train_df, max_examples=args.max_examples)
    val_examples = build_examples(val_df, max_examples=args.max_examples)

    # load model
    logger.info(f"Loading base model: {args.base_model}")
    model = SentenceTransformer(args.base_model)

    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=args.batch_size)
    train_loss = losses.MultipleNegativesRankingLoss(model)

    # compute warmup and steps
    total_steps = math.ceil(len(train_examples) / args.batch_size) * args.epochs
    warmup_steps = min(args.warmup_steps, int(0.1 * total_steps)) if args.warmup_steps else int(0.1 * total_steps)
    logger.info(f"Total steps: {total_steps}, warmup_steps: {warmup_steps}")

    logger.info("Starting training...")
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=args.epochs,
        warmup_steps=warmup_steps,
        optimizer_params={'lr': args.lr},
        output_path=args.out,
        use_amp=args.use_amp,
        show_progress_bar=True
    )

    logger.info(f"Training done. Model saved to {args.out}")

if __name__ == "__main__":
    main()
