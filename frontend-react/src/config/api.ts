// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// API Endpoints - matching backend routes exactly
export const ENDPOINTS = {
  // Sermon endpoints (from sermon_routes.py with /sermon prefix)
  SERMON_LIST: '/sermon/list',
  SERMON_UPLOAD: '/sermon/upload',
  SERMON_SEGMENTS: (id: number) => `/sermon/${id}/segments`,
  SERMON_SEGMENT_NOW: (id: number) => `/sermon/${id}/segment-now`,
  SERMON_TRANSLATE: (id: number) => `/sermon/${id}/translate`,
  SERMON_DELETE: (id: number) => `/sermon/${id}`,
  SERMON_EXPORT: (id: number, format: string) => `/sermon/${id}/export?format=${format}`,
  SEGMENT_PATCH: (segmentId: number) => `/sermon/segment/${segmentId}`,
  
  // Live endpoints (from live_routes.py with /live prefix)
  LIVE_STREAM: (sermonId: number) => `/live/stream?sermon_id=${sermonId}`,
  
  // Translation endpoints (from translation_routes.py)
  TRANSLATE: '/translate',
  
  // Analytics endpoints (from analytics_routes.py with /analytics prefix)
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_OVERVIEW: '/analytics/overview',
  ANALYTICS_PERFORMANCE: '/analytics/performance',
  ANALYTICS_USAGE: '/analytics/usage',
  ANALYTICS_ACTIVITY: '/analytics/activity',
  ANALYTICS_RETRAINING: '/analytics/retraining-data',
  ANALYTICS_LIVE_SESSIONS: '/analytics/live-sessions',
  
  // Add new endpoints
  SERMON_STATS: '/sermon/dashboard/stats',
  SERMON_DETAIL: (id: number) => `/sermon/${id}`,
};

// WebSocket URLs
export const WS_ENDPOINTS = {
  LIVE_STREAM: (sermonId: number) => `${WS_BASE_URL}/live/stream?sermon_id=${sermonId}`,
};
