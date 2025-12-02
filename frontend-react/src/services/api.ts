import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types matching backend models exactly
export interface Sermon {
  sermon_id: number;
  title: string;
  speaker?: string;
  date_uploaded?: string;
  status: 'draft' | 'uploaded_raw' | 'segmented' | 'translated' | 'vetted';
  raw_text?: string;
}

export interface Segment {
  segment_id: number;
  sermon_id?: number;
  segment_order: number;
  malay_text: string;
  english_text?: string;
  confidence?: number | null;
  vetted: boolean;  // Backend uses 'vetted' not 'is_vetted'
  created_at?: string;
}

export interface DashboardStats {
  total_sermons: number;
  pending_review: number;
  vetted_ready: number;
  total_segments: number;
  vetted_segments: number;
}

export interface UploadResponse {
  sermon_id: number;
  inserted_segments: number;
  status: string;
  source_ext: string;
}

export interface TranslationResult {
  ok: boolean;
  count: number;
  provider: string;
  model_name?: string;
  only_empty?: boolean;
}

// Sermon API
export const sermonApi = {
  // List all sermons
  list: async (): Promise<Sermon[]> => {
    const response = await api.get(ENDPOINTS.SERMON_LIST);
    return response.data;
  },

  // Upload a new sermon
  upload: async (formData: FormData): Promise<UploadResponse> => {
    const response = await api.post(ENDPOINTS.SERMON_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get segments for a sermon
  getSegments: async (sermonId: number): Promise<Segment[]> => {
    const response = await api.get(ENDPOINTS.SERMON_SEGMENTS(sermonId));
    return response.data;
  },

  // Segment a sermon (from raw_text)
  segmentNow: async (sermonId: number, strategy: string = 'auto'): Promise<{ ok: boolean; count: number }> => {
    const response = await api.post(`${ENDPOINTS.SERMON_SEGMENT_NOW(sermonId)}?strategy=${strategy}`);
    return response.data;
  },

  // Translate sermon segments
  translate: async (
    sermonId: number,
    provider: string = 'gemini',
    onlyEmpty: boolean = false,
    modelName?: string
  ): Promise<TranslationResult> => {
    const response = await api.post(ENDPOINTS.SERMON_TRANSLATE(sermonId), {
      provider,
      only_empty: onlyEmpty,
      model_name: modelName,
    });
    return response.data;
  },

  // Update a segment (matching backend PATCH endpoint: /sermon/segment/{segment_id})
  updateSegment: async (
    segmentId: number,
    updates: Partial<{
      malay_text: string;
      english_text: string;
      vetted: boolean;
      retranslate: boolean;
    }>
  ): Promise<{
    ok: boolean;
    segment_id: number;
    malay_text: string;
    english_text: string;
    confidence: number | null;
    vetted: boolean;
    retranslated: boolean;
  }> => {
    const response = await api.patch(ENDPOINTS.SEGMENT_PATCH(segmentId), updates);
    return response.data;
  },

  // Delete a sermon
  delete: async (sermonId: number): Promise<{ ok: boolean; deleted_sermon_id: number }> => {
    const response = await api.delete(ENDPOINTS.SERMON_DELETE(sermonId));
    return response.data;
  },

  // Export sermon
  export: async (sermonId: number, format: 'csv' | 'txt' | 'pdf'): Promise<Blob> => {
    const response = await api.get(ENDPOINTS.SERMON_EXPORT(sermonId, format), {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Translation API
export const translationApi = {
  translate: async (text: string, provider: string = 'gemini'): Promise<{ text: string; confidence?: number }> => {
    const response = await api.post(ENDPOINTS.TRANSLATE, { text, provider });
    return response.data;
  },
};

export default api;

// Helper function to compute dashboard stats from sermons and segments
export async function getDashboardStats(): Promise<DashboardStats> {
  const sermons = await sermonApi.list();
  let totalSegments = 0;
  let vettedSegments = 0;
  
  // Get segment counts for each sermon
  for (const sermon of sermons) {
    try {
      const segments = await sermonApi.getSegments(sermon.sermon_id);
      totalSegments += segments.length;
      vettedSegments += segments.filter(s => s.vetted).length;
    } catch {
      // Sermon might not have segments yet
    }
  }

  const vettedReady = sermons.filter(s => s.status === 'vetted').length;
  const pendingReview = sermons.filter(s => 
    s.status === 'translated' || s.status === 'segmented'
  ).length;

  return {
    total_sermons: sermons.length,
    pending_review: pendingReview,
    vetted_ready: vettedReady,
    total_segments: totalSegments,
    vetted_segments: vettedSegments,
  };
}
