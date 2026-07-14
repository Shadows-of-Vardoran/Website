export interface MediaItem {
  title?: string;
  src: string;
  type: 'image' | 'video';
  alt: string;
  caption?: string;
  author?: string;
  poster?: string;
  width?: number;
  height?: number;
}
