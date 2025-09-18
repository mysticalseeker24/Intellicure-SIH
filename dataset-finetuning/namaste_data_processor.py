#!/usr/bin/env python3
"""
NAMASTE Dataset Processor for EmbeddingGemma Fine-tuning

This script processes the NAMASTE ↔ ICD-11 dataset to create embedding-ready
training files with proper multilingual handling and stratified splits.

Usage:
    python namaste_data_processor.py

Output files (in /mnt/data/ or local data/ directory):
    - namaste_all_pairs.tsv: All positive pairs
    - namaste_finetune_train.tsv: Training set (~70%)
    - namaste_finetune_val.tsv: Validation set (~15%) 
    - namaste_finetune_test.tsv: Test set (~15%)
    - namaste_holdout_eval.tsv: Holdout evaluation (200 pairs)
    - dataset_summary.txt: Processing statistics
"""

import pandas as pd
import numpy as np
from pathlib import Path
import os
from sklearn.model_selection import train_test_split
from typing import Tuple, Dict, Any
import warnings
warnings.filterwarnings('ignore')

# Configuration
INPUT_FILE = "namaste_icd11_mock_dataset for finetuning.xlsx"
OUTPUT_DIR = "data"  # Local output directory (change to /mnt/data if needed)
HOLDOUT_SIZE = 200
RANDOM_STATE = 42

# Expected columns
EXPECTED_COLUMNS = [
    'namaste_code', 'namaste_term', 'namaste_original_script', 
    'namaste_transliteration', 'namaste_english', 'namaste_description', 
    'synonyms', 'icd11_code', 'icd11_term', 'icd11_description',
    'mapping_equivalence', 'mapping_confidence', 'source', 'status'
]

def create_output_directory():
    """Create output directory if it doesn't exist."""
    output_path = Path(OUTPUT_DIR)
    output_path.mkdir(exist_ok=True)
    print(f"✅ Output directory: {output_path.absolute()}")
    return output_path

def load_dataset(file_path: str) -> pd.DataFrame:
    """Load the NAMASTE dataset with proper encoding handling."""
    print(f"📂 Loading dataset from: {file_path}")
    
    try:
        # Try Excel first (better for multilingual content)
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        else:
            # Fallback to CSV with UTF-8 encoding
            df = pd.read_csv(file_path, encoding='utf-8')
        
        print(f"✅ Dataset loaded successfully")
        print(f"   Shape: {df.shape}")
        print(f"   Columns: {list(df.columns)}")
        
        # Verify expected columns
        missing_cols = set(EXPECTED_COLUMNS) - set(df.columns)
        if missing_cols:
            print(f"⚠️  Missing columns: {missing_cols}")
        
        return df
    
    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        raise

def clean_text(text: str) -> str:
    """Clean and normalize text for embedding."""
    if pd.isna(text) or text is None:
        return ""
    
    # Convert to string and strip whitespace
    text = str(text).strip()
    
    # Remove excessive whitespace
    text = " ".join(text.split())
    
    return text

def create_embedding_text(row: pd.Series, side: str) -> str:
    """Create combined embedding text for NAMASTE or ICD side."""
    
    if side == "namaste":
        # NAMASTE side: term | original_script | transliteration | english | description | synonyms
        components = [
            clean_text(row.get('namaste_term', '')),
            clean_text(row.get('namaste_original_script', '')),
            clean_text(row.get('namaste_transliteration', '')),
            clean_text(row.get('namaste_english', '')),
            clean_text(row.get('namaste_description', '')),
            clean_text(row.get('synonyms', ''))
        ]
        
    elif side == "icd":
        # ICD side: term | description
        components = [
            clean_text(row.get('icd11_term', '')),
            clean_text(row.get('icd11_description', ''))
        ]
    
    else:
        raise ValueError(f"Invalid side: {side}. Must be 'namaste' or 'icd'")
    
    # Filter out empty components and join with separator
    non_empty_components = [comp for comp in components if comp]
    return " | ".join(non_empty_components)

def process_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Process the dataset to create embedding-ready format."""
    print("\n🔄 Processing dataset...")
    
    # Create a copy to avoid modifying original
    processed_df = df.copy()
    
    # Create embedding text columns
    print("   Creating embedding texts...")
    processed_df['namaste_text'] = processed_df.apply(
        lambda row: create_embedding_text(row, 'namaste'), axis=1
    )
    processed_df['icd_text'] = processed_df.apply(
        lambda row: create_embedding_text(row, 'icd'), axis=1
    )
    
    # Filter out rows with empty embedding text
    initial_count = len(processed_df)
    processed_df = processed_df[
        (processed_df['namaste_text'].str.len() > 0) & 
        (processed_df['icd_text'].str.len() > 0)
    ]
    final_count = len(processed_df)
    
    print(f"   Filtered out {initial_count - final_count} rows with empty embedding text")
    print(f"   Final dataset size: {final_count} pairs")
    
    # Fill missing values for consistency
    processed_df['mapping_confidence'] = processed_df['mapping_confidence'].fillna(0.5)
    processed_df['mapping_equivalence'] = processed_df['mapping_equivalence'].fillna('related')
    
    return processed_df

def create_stratified_splits(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Create stratified train/val/test splits and holdout set."""
    print("\n📊 Creating stratified splits...")
    
    # Create stratification key combining equivalence and confidence quantiles
    df = df.copy()
    
    # Create confidence quantiles for stratification
    df['confidence_quantile'] = pd.qcut(
        df['mapping_confidence'], 
        q=4, 
        labels=['low', 'medium_low', 'medium_high', 'high']
    )
    
    # Combine equivalence and confidence for stratification
    df['strat_key'] = df['mapping_equivalence'].astype(str) + '_' + df['confidence_quantile'].astype(str)
    
    # First, extract holdout set (stratified sampling)
    try:
        holdout_df, remaining_df = train_test_split(
            df,
            test_size=len(df) - HOLDOUT_SIZE,
            stratify=df['strat_key'],
            random_state=RANDOM_STATE
        )
        print(f"   Holdout set: {len(holdout_df)} samples")
    except ValueError:
        # If stratification fails, use random sampling
        print("   Warning: Stratification failed for holdout, using random sampling")
        holdout_df = df.sample(n=HOLDOUT_SIZE, random_state=RANDOM_STATE)
        remaining_df = df.drop(holdout_df.index)
    
    # Split remaining data into train/val/test (70/15/15)
    train_size = 0.7
    val_size = 0.15
    test_size = 0.15
    
    try:
        # Train/temp split
        train_df, temp_df = train_test_split(
            remaining_df,
            test_size=(val_size + test_size),
            stratify=remaining_df['strat_key'],
            random_state=RANDOM_STATE
        )
        
        # Val/test split
        val_df, test_df = train_test_split(
            temp_df,
            test_size=test_size/(val_size + test_size),
            stratify=temp_df['strat_key'],
            random_state=RANDOM_STATE
        )
        
    except ValueError:
        # If stratification fails, use random splits
        print("   Warning: Stratification failed for main splits, using random sampling")
        train_df, temp_df = train_test_split(
            remaining_df, test_size=(val_size + test_size), random_state=RANDOM_STATE
        )
        val_df, test_df = train_test_split(
            temp_df, test_size=test_size/(val_size + test_size), random_state=RANDOM_STATE
        )
    
    print(f"   Train set: {len(train_df)} samples ({len(train_df)/len(df)*100:.1f}%)")
    print(f"   Validation set: {len(val_df)} samples ({len(val_df)/len(df)*100:.1f}%)")
    print(f"   Test set: {len(test_df)} samples ({len(test_df)/len(df)*100:.1f}%)")
    
    # Remove temporary columns
    for split_df in [train_df, val_df, test_df, holdout_df]:
        split_df.drop(['confidence_quantile', 'strat_key'], axis=1, inplace=True, errors='ignore')
    
    return train_df, val_df, test_df, holdout_df

def save_processed_files(train_df: pd.DataFrame, val_df: pd.DataFrame, 
                        test_df: pd.DataFrame, holdout_df: pd.DataFrame,
                        all_df: pd.DataFrame, output_path: Path):
    """Save all processed files."""
    print("\n💾 Saving processed files...")
    
    # Save all splits as TSV (better for multilingual content)
    files_to_save = [
        (train_df, "namaste_finetune_train.tsv"),
        (val_df, "namaste_finetune_val.tsv"),
        (test_df, "namaste_finetune_test.tsv"),
        (holdout_df, "namaste_holdout_eval.tsv"),
        (all_df, "namaste_all_pairs.tsv")
    ]
    
    for df, filename in files_to_save:
        file_path = output_path / filename
        df.to_csv(file_path, sep='\t', index=False, encoding='utf-8')
        print(f"   ✅ {filename}: {len(df)} rows ({file_path.stat().st_size / 1024:.1f} KB)")

def generate_summary(train_df: pd.DataFrame, val_df: pd.DataFrame, 
                    test_df: pd.DataFrame, holdout_df: pd.DataFrame,
                    all_df: pd.DataFrame, output_path: Path):
    """Generate dataset summary and statistics."""
    print("\n📋 Generating dataset summary...")
    
    summary_lines = [
        "NAMASTE Dataset Processing Summary",
        "=" * 50,
        f"Processing Date: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Total Pairs: {len(all_df):,}",
        "",
        "Split Distribution:",
        f"  Training:   {len(train_df):,} pairs ({len(train_df)/len(all_df)*100:.1f}%)",
        f"  Validation: {len(val_df):,} pairs ({len(val_df)/len(all_df)*100:.1f}%)",
        f"  Test:       {len(test_df):,} pairs ({len(test_df)/len(all_df)*100:.1f}%)",
        f"  Holdout:    {len(holdout_df):,} pairs ({len(holdout_df)/len(all_df)*100:.1f}%)",
        "",
        "Confidence Statistics:",
        f"  Min:    {all_df['mapping_confidence'].min():.3f}",
        f"  Max:    {all_df['mapping_confidence'].max():.3f}",
        f"  Mean:   {all_df['mapping_confidence'].mean():.3f}",
        f"  Median: {all_df['mapping_confidence'].median():.3f}",
        f"  Std:    {all_df['mapping_confidence'].std():.3f}",
        "",
        "Equivalence Distribution:",
    ]
    
    # Add equivalence distribution
    equiv_counts = all_df['mapping_equivalence'].value_counts()
    for equiv, count in equiv_counts.items():
        summary_lines.append(f"  {equiv}: {count:,} ({count/len(all_df)*100:.1f}%)")
    
    summary_lines.extend([
        "",
        "Sample NAMASTE Text:",
        f"  {all_df['namaste_text'].iloc[0][:200]}...",
        "",
        "Sample ICD Text:",
        f"  {all_df['icd_text'].iloc[0][:200]}...",
        "",
        "Embedding Text Length Statistics:",
        f"  NAMASTE - Mean: {all_df['namaste_text'].str.len().mean():.1f}, Max: {all_df['namaste_text'].str.len().max()}",
        f"  ICD     - Mean: {all_df['icd_text'].str.len().mean():.1f}, Max: {all_df['icd_text'].str.len().max()}",
        "",
        "Files Generated:",
        "  ✅ namaste_finetune_train.tsv",
        "  ✅ namaste_finetune_val.tsv", 
        "  ✅ namaste_finetune_test.tsv",
        "  ✅ namaste_holdout_eval.tsv",
        "  ✅ namaste_all_pairs.tsv",
        "  ✅ dataset_summary.txt",
        "",
        "Ready for EmbeddingGemma fine-tuning! 🚀"
    ])
    
    # Save summary
    summary_path = output_path / "dataset_summary.txt"
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(summary_lines))
    
    print(f"   ✅ Summary saved to: {summary_path}")
    
    # Print summary to console
    print("\n" + "\n".join(summary_lines[:20]))  # Print first 20 lines
    print("   ... (full summary in dataset_summary.txt)")

def main():
    """Main processing pipeline."""
    print("🚀 NAMASTE Dataset Processor Starting...")
    print(f"   Input file: {INPUT_FILE}")
    
    # Create output directory
    output_path = create_output_directory()
    
    # Load dataset
    df = load_dataset(INPUT_FILE)
    
    # Process dataset
    processed_df = process_dataset(df)
    
    # Create splits
    train_df, val_df, test_df, holdout_df = create_stratified_splits(processed_df)
    
    # Save files
    save_processed_files(train_df, val_df, test_df, holdout_df, processed_df, output_path)
    
    # Generate summary
    generate_summary(train_df, val_df, test_df, holdout_df, processed_df, output_path)
    
    print(f"\n🎉 Processing complete! Files saved in: {output_path.absolute()}")
    print("\nNext steps:")
    print("1. Review the dataset_summary.txt file")
    print("2. Verify sample outputs in the TSV files")
    print("3. Use the train/val files for EmbeddingGemma fine-tuning")
    print("4. Use the holdout set for final evaluation")

if __name__ == "__main__":
    main()
