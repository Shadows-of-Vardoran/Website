export interface MediaItem {
  src: string;
  type: 'image' | 'video';
  alt: string;
  caption?: string;
  poster?: string;
  width?: number;
  height?: number;
}
