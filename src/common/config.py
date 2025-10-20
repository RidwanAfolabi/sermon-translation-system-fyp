"""Common utilities for the sermon translation system."""

import yaml
import logging
import os
from pathlib import Path
from typing import Dict, Any


class Config:
    """Configuration management for the system."""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            # Try multiple possible locations
            possible_paths = [
                os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'config.yaml'),
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'config', 'config.yaml'),
                'config/config.yaml',
                '../config/config.yaml'
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    config_path = path
                    break
            
            if config_path is None:
                raise FileNotFoundError(f"Could not find config.yaml in any of: {possible_paths}")
        
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value using dot notation (e.g., 'pre_service.translation.model_name')."""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """Get entire configuration section."""
        return self.config.get(section, {})


def setup_logging(config: Config):
    """Set up logging for the system."""
    log_config = config.get_section('logging')
    
    # Create logs directory if it doesn't exist
    log_file = log_config.get('file', 'data/logs/system.log')
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, log_config.get('level', 'INFO')),
        format=log_config.get('format', '%(asctime)s - %(name)s - %(levelname)s - %(message)s'),
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger('sermon_system')


def ensure_directories(config: Config):
    """Ensure all required directories exist."""
    storage = config.get_section('storage')
    
    for dir_key in ['translations_dir', 'logs_dir', 'audio_dir']:
        dir_path = storage.get(dir_key)
        if dir_path:
            os.makedirs(dir_path, exist_ok=True)
