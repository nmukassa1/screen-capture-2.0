export interface FormDataType {
  image?: string;
  siteUrl?: string;
  siteName?: string;
  tagIds?: number[];
  userId?: string;
}

export interface ScreenshotResponse {
  success: boolean;
  image?: string;
  siteUrl?: string;
  siteName?: string;
}

export interface Tag {
  id: number;
  name: string;
  userId: string;
}
