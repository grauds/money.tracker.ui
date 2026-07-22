export interface WordPressArticle {
  id: number;
  date: string;
  title: { rendered: string };
  featuredImageUrl?: string;
  content: {
    rendered: string;
    safeRendered?: any; // Used to hold sanitized DomSanitizer data
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
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
  };
}
