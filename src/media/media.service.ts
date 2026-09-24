import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { UploadedMedia } from './media.types';
import sharp from 'sharp';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MediaService {
  constructor(private readonly storageService: StorageService) {}

  private get isCloudinaryEnabled() {
    return process.env.USE_CLOUDINARY === 'true';
  }

  private configureCloudinary() {
    if (!this.isCloudinaryEnabled) return;
    
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      throw new InternalServerErrorException('Cloudinary is not configured');
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: process.env.CLOUDINARY_SECURE !== 'false',
    });
  }

  async uploadImage(file: any, folder: string): Promise<UploadedMedia> {
    const webpBuffer = await sharp(file.buffer)
      .webp({ quality: 80 })
      .toBuffer();

    if (this.isCloudinaryEnabled) {
      this.configureCloudinary();

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            overwrite: false,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Failed to upload image'));
              return;
            }

            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes,
              format: result.format,
              width: result.width,
              height: result.height,
            });
          },
        );

        Readable.from(webpBuffer).pipe(uploadStream);
      });
    } else {
      const fileName = file.originalname 
        ? file.originalname.replace(/\.[^/.]+$/, '.webp') 
        : 'image.webp';
        
      const uploaded = await this.storageService.uploadFile({
        fileName,
        fileBuffer: webpBuffer,
        contentType: 'image/webp',
        prefix: folder ? `${folder}/` : '',
        allowedTypes: ['webp'],
      });

      return {
        url: uploaded.fileUrl,
        public_id: uploaded.fileKey,
        bytes: webpBuffer.length,
        format: 'webp',
        width: 0,
        height: 0,
      };
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (this.isCloudinaryEnabled) {
      this.configureCloudinary();
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
    } else {
      try {
        await this.storageService.deleteFile(publicId);
      } catch (e) {}
    }
  }

  async uploadDocument(file: any, folder: string): Promise<UploadedMedia> {
    this.configureCloudinary();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Failed to upload document'));
            return;
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
