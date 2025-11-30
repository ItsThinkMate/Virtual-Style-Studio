
export enum PhotoType {
  FRONT = 'FRONT',
  SIDE = 'SIDE',
  BACK = 'BACK'
}

export interface PersonPhoto {
  id: string;
  url: string;
  type: PhotoType;
  file?: File;
}

export interface ClothingItem {
  id: string;
  url: string;
  name: string;
  category: 'top' | 'bottom' | 'shoes' | 'accessory' | 'full-body';
  isUrl: boolean;
  productUrl?: string; // Link to the product purchase page
}

export interface PlacedItem {
  id: string;
  clothingId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  processedUrl?: string; // For items with background removed
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
