export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text?: string;
}

export interface WordPressArticlePayload {
  title: string;
  content: string;
  date?: string;
  status: 'publish' | 'draft';
  tags?: number[];
  featured_media?: number;
}

export interface WordPressArticle {
  id: number;
  date: string;
  title: { rendered: string };
  featured_media?: number;
  featuredImageUrl?: string;
  tags?: number[];
  content: {
    rendered: string;
    safeRendered?: any;
  };
  excerpt: {
    rendered: string;
    safeRendered?: any;
    protected: boolean;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id?: number;
      source_url: string;
      alt_text?: string;
      media_details?: {
        sizes?: {
          large?: { source_url: string };
          medium?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
    'wp:term'?: Array<Array<WordPressTag>>;
  };
}
