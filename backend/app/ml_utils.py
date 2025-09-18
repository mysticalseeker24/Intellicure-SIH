# backend/app/ml_utils.py
import os
import numpy as np
from sentence_transformers import SentenceTransformer
import logging
logger = logging.getLogger("ml_utils")

class EmbeddingService:
    """
    Wraps SentenceTransformer model if present at model_dir.
    If model_dir doesn't exist or cannot be loaded, provides a deterministic dummy embedder.
    """
    def __init__(self, model_dir: str = "./models/gemma_finetuned", dim: int = 512):
        self.model_dir = model_dir
        self.dim = dim
        self.model = None
        self.model_loaded = False
        self._load_model_if_present()

    def _load_model_if_present(self):
        if os.path.exists(self.model_dir) and os.path.isdir(self.model_dir):
            try:
                logger.info(f"Loading model from {self.model_dir}")
                self.model = SentenceTransformer(self.model_dir)
                # update dim
                self.dim = self.model.get_sentence_embedding_dimension()
                self.model_loaded = True
                logger.info(f"Loaded model dim={self.dim}")
            except Exception as e:
                logger.exception("Failed to load model; using dummy embeddings")
                self.model = None
                self.model_loaded = False
        else:
            logger.info(f"No model found at {self.model_dir}; using dummy embeddings")

    def embed(self, texts):
        """
        texts: List[str] -> np.ndarray (N, dim)
        """
        if self.model_loaded:
            emb = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
            # normalize
            norms = np.linalg.norm(emb, axis=1, keepdims=True)
            norms[norms==0] = 1.0
            emb = emb / norms
            return emb
        else:
            # deterministic dummy: hash-based pseudo-random but stable per text
            embs = []
            for t in texts:
                h = abs(hash(t)) % (10**8)
                rng = np.random.RandomState(seed=h)
                v = rng.standard_normal(self.dim).astype('float32')
                v = v / (np.linalg.norm(v) + 1e-12)
                embs.append(v)
            return np.vstack(embs)
