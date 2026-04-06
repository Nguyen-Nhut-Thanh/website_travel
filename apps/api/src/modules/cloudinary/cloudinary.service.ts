import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import type { Request } from 'express';

type CloudinaryStorageParams = {
  folder: string;
  format: (req: Request, file: Express.Multer.File) => Promise<string>;
  public_id: (req: Request, file: Express.Multer.File) => string;
};

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  getStorage(folder: string) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `travel_v2/${folder}`,
        format: async () => 'jpg',
        public_id: (_req, file) =>
          `${Date.now()}-${file.originalname.split('.')[0]}`,
      } as CloudinaryStorageParams,
    });
  }
}
