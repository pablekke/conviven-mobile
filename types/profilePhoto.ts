export interface ProfilePhoto {
  id: string;
  userId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadPhotoResponse {
  id: string;
  userId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}
