"""Machine Translation module for Pre-Service phase."""

import logging
from typing import List, Dict, Tuple
from transformers import MarianMTModel, MarianTokenizer
import torch


class TranslationEngine:
    """Machine translation engine for Malay to English translation."""
    
    def __init__(self, model_name: str = "Helsinki-NLP/opus-mt-ms-en", device: str = None):
        """
        Initialize the translation engine.
        
        Args:
            model_name: HuggingFace model name
            device: Device to run on ('cpu', 'cuda', or None for auto-detect)
        """
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Loading translation model: {model_name}")
        
        # Determine device
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
        
        # Load model and tokenizer
        try:
            self.tokenizer = MarianTokenizer.from_pretrained(model_name)
            self.model = MarianMTModel.from_pretrained(model_name).to(self.device)
            self.logger.info(f"Model loaded successfully on {self.device}")
        except Exception as e:
            self.logger.error(f"Error loading model: {e}")
            raise
    
    def translate(
        self, 
        text: str, 
        max_length: int = 512,
        num_beams: int = 4
    ) -> Dict[str, any]:
        """
        Translate Malay text to English.
        
        Args:
            text: Malay text to translate
            max_length: Maximum length of translation
            num_beams: Number of beams for beam search
            
        Returns:
            Dictionary with translation and metadata
        """
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=max_length
            ).to(self.device)
            
            # Generate translation
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    num_beams=num_beams,
                    early_stopping=True
                )
            
            # Decode translation
            translation = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Calculate confidence (simplified - using output scores if available)
            confidence = 0.85  # Placeholder - real implementation would use model scores
            
            return {
                'translation': translation,
                'confidence': confidence,
                'source': text,
                'model': self.model.name_or_path if hasattr(self.model, 'name_or_path') else 'unknown'
            }
            
        except Exception as e:
            self.logger.error(f"Translation error: {e}")
            raise
    
    def translate_batch(
        self,
        texts: List[str],
        max_length: int = 512,
        batch_size: int = 8
    ) -> List[Dict[str, any]]:
        """
        Translate multiple texts in batches.
        
        Args:
            texts: List of Malay texts to translate
            max_length: Maximum length of translations
            batch_size: Batch size for processing
            
        Returns:
            List of translation dictionaries
        """
        results = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Tokenize batch
            inputs = self.tokenizer(
                batch,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=max_length
            ).to(self.device)
            
            # Generate translations
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    num_beams=4,
                    early_stopping=True
                )
            
            # Decode translations
            for j, output in enumerate(outputs):
                translation = self.tokenizer.decode(output, skip_special_tokens=True)
                results.append({
                    'translation': translation,
                    'confidence': 0.85,  # Placeholder
                    'source': batch[j],
                    'model': self.model.name_or_path if hasattr(self.model, 'name_or_path') else 'unknown'
                })
        
        return results
    
    def get_model_info(self) -> Dict[str, str]:
        """Get information about the loaded model."""
        return {
            'model_name': self.model.name_or_path if hasattr(self.model, 'name_or_path') else 'unknown',
            'device': self.device,
            'source_lang': 'ms',
            'target_lang': 'en'
        }
