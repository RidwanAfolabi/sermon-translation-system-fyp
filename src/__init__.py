"""Package initialization."""

from .common import Config, Database

# Lazy imports for optional dependencies
def __getattr__(name):
    if name == "SermonTranslationSystem":
        from .system import SermonTranslationSystem
        return SermonTranslationSystem
    elif name == "TranslationEngine":
        from .pre_service import TranslationEngine
        return TranslationEngine
    elif name == "VettingSystem":
        from .pre_service import VettingSystem
        return VettingSystem
    elif name == "SpeechAligner":
        from .live_service import SpeechAligner
        return SpeechAligner
    elif name == "SubtitleDisplay":
        from .live_service import SubtitleDisplay
        return SubtitleDisplay
    elif name == "AnalyticsEngine":
        from .post_service import AnalyticsEngine
        return AnalyticsEngine
    elif name == "ModelRefinement":
        from .post_service import ModelRefinement
        return ModelRefinement
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

__version__ = '1.0.0'

__all__ = [
    'Config',
    'Database',
    'SermonTranslationSystem',
    'TranslationEngine',
    'VettingSystem',
    'SpeechAligner',
    'SubtitleDisplay',
    'AnalyticsEngine',
    'ModelRefinement'
]
