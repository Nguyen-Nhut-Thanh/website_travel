import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

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
      cloudinary: cloudinary,
      params: {
        folder: `travel_v2/${folder}`,
        format: async (req, file) => 'jpg', // quy định định dạng
        public_id: (req, file) =>
          `${Date.now()}-${file.originalname.split('.')[0]}`,
      } as any,
    });
  }
}
