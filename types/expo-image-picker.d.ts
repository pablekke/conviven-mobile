declare module "expo-image-picker" {
  export const MediaTypeOptions: {
    readonly All: "All";
    readonly Images: "Images";
    readonly Videos: "Videos";
  };

  export interface ImagePickerAsset {
    uri: string;
    fileName?: string;
    mimeType?: string;
    width?: number;
    height?: number;
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets?: ImagePickerAsset[];
  }

  export interface ImagePickerOptions {
    mediaTypes?: typeof MediaTypeOptions[keyof typeof MediaTypeOptions];
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export function requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>;

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
}
