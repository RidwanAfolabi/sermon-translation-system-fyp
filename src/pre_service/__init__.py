"""Pre-Service phase initialization."""

# Lazy imports to avoid requiring transformers dependency immediately
def __getattr__(name):
    if name == "TranslationEngine":
        from .translator import TranslationEngine
        return TranslationEngine
    elif name == "VettingSystem":
        from .vetting import VettingSystem
        return VettingSystem
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

__all__ = ['TranslationEngine', 'VettingSystem']
