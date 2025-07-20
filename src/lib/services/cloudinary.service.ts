import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '@/lib/utils';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp';
  transformation?: Array<Record<string, unknown>>;
}

export class CloudinaryService {
  // Upload image from file buffer
  static async uploadImage(
    fileBuffer: Buffer,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const {
        folder = 'food-ordering-app',
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
        transformation = [],
      } = options;

      // Base transformation
      const baseTransformation: Record<string, unknown> = {
        quality,
        fetch_format: format,
      };

      // Add dimensions if provided
      if (width || height) {
        baseTransformation.width = width;
        baseTransformation.height = height;
        baseTransformation.crop = crop;
      }

      // Combine with custom transformations
      const transformations = [baseTransformation, ...transformation];

      const result = await new Promise<{
        public_id: string;
        url: string;
        secure_url: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
      }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            transformation: transformations,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('Upload failed - no result'));
          }
        ).end(fileBuffer);
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new AppError('Failed to upload image', 500);
    }
  }

  // Upload image from URL
  static async uploadImageFromUrl(
    imageUrl: string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const {
        folder = 'food-ordering-app',
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
        transformation = [],
      } = options;

      const baseTransformation: Record<string, unknown> = {
        quality,
        fetch_format: format,
      };

      if (width || height) {
        baseTransformation.width = width;
        baseTransformation.height = height;
        baseTransformation.crop = crop;
      }

      const transformations = [baseTransformation, ...transformation];

      const result = await cloudinary.uploader.upload(imageUrl, {
        folder,
        transformation: transformations,
        resource_type: 'image',
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary URL upload failed:', error);
      throw new AppError('Failed to upload image from URL', 500);
    }
  }

  // Delete image
  static async deleteImage(publicId: string): Promise<{ success: boolean; result?: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      return {
        success: result.result === 'ok',
        result: result.result,
      };
    } catch (error) {
      console.error('Cloudinary delete failed:', error);
      return { success: false };
    }
  }

  // Generate optimized image URL
  static generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
      quality?: 'auto' | number;
      format?: 'auto' | 'jpg' | 'png' | 'webp';
    } = {}
  ): string {
    try {
      const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
      } = options;

      const transformation: Record<string, unknown> = {
        quality,
        fetch_format: format,
      };

      if (width || height) {
        transformation.width = width;
        transformation.height = height;
        transformation.crop = crop;
      }

      return cloudinary.url(publicId, {
        transformation,
        secure: true,
      });
    } catch (error) {
      console.error('Failed to generate optimized URL:', error);
      return '';
    }
  }

  // Get image details
  static async getImageDetails(publicId: string): Promise<{
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    url: string;
    secureUrl: string;
    createdAt: string;
  } | null> {
    try {
      const result = await cloudinary.api.resource(publicId);

      return {
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        url: result.url,
        secureUrl: result.secure_url,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error('Failed to get image details:', error);
      return null;
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(
    files: Array<{ buffer: Buffer; originalName: string }>,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file.buffer, {
          ...options,
          folder: options.folder ? `${options.folder}/${file.originalName}` : undefined,
        })
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Failed to upload multiple images:', error);
      throw new AppError('Failed to upload images', 500);
    }
  }

  // Create image variants (different sizes)
  static async createImageVariants(
    publicId: string,
    variants: Array<{
      name: string;
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
    }>
  ): Promise<Record<string, string>> {
    try {
      const variantUrls: Record<string, string> = {};

      for (const variant of variants) {
        const url = this.generateOptimizedUrl(publicId, {
          width: variant.width,
          height: variant.height,
          crop: variant.crop,
          quality: 'auto',
          format: 'auto',
        });
        
        variantUrls[variant.name] = url;
      }

      return variantUrls;
    } catch (error) {
      console.error('Failed to create image variants:', error);
      throw new AppError('Failed to create image variants', 500);
    }
  }

  // Upload menu item images with predefined variants
  static async uploadMenuItemImage(
    fileBuffer: Buffer,
    menuItemId: string
  ): Promise<{
    publicId: string;
    variants: Record<string, string>;
  }> {
    try {
      // Upload original image
      const uploadResult = await this.uploadImage(fileBuffer, {
        folder: `menu-items/${menuItemId}`,
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      });

      // Create variants
      const variants = await this.createImageVariants(uploadResult.publicId, [
        { name: 'thumbnail', width: 150, height: 150, crop: 'fill' },
        { name: 'small', width: 300, height: 225, crop: 'fill' },
        { name: 'medium', width: 500, height: 375, crop: 'fill' },
        { name: 'large', width: 800, height: 600, crop: 'fill' },
      ]);

      return {
        publicId: uploadResult.publicId,
        variants,
      };
    } catch (error) {
      console.error('Failed to upload menu item image:', error);
      throw new AppError('Failed to upload menu item image', 500);
    }
  }

  // Clean up old images (useful for maintenance)
  static async cleanupOldImages(olderThanDays: number = 30): Promise<{
    deletedCount: number;
    errors: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      // List resources older than cutoff date
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'food-ordering-app/',
        max_results: 500,
      });

      let deletedCount = 0;
      let errors = 0;

      for (const resource of result.resources) {
        const createdAt = new Date(resource.created_at);
        
        if (createdAt < cutoffDate) {
          try {
            await this.deleteImage(resource.public_id);
            deletedCount++;
          } catch {
            errors++;
          }
        }
      }

      return { deletedCount, errors };
    } catch (error) {
      console.error('Failed to cleanup old images:', error);
      throw new AppError('Failed to cleanup images', 500);
    }
  }
}
