import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage so files reside in RAM before uploading to Cloudinary
const storage = multer.memoryStorage();

// Helper to upload a buffer to Cloudinary and return the result
function uploadToCloudinary(buffer, publicId, folder, resource_type = 'image') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type,
        timeout: 60000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// Factory to create a middleware for a specific field
function cloudinaryUploader(fieldName, folder, resource_type = 'image') {
  const upload = multer({ storage }).single(fieldName);
  return (req, res, next) => {
    upload(req, res, async err => {
      if (err) return next(err);
      if (!req.file) return next(); // No file uploaded – let the route handle the error
      try {
        const timestamp = Date.now();
        const uniqueId = `${fieldName}-${timestamp}`;
        const result = await uploadToCloudinary(
          req.file.buffer,
          uniqueId,
          folder,
          resource_type
        );
        // Attach the Cloudinary secure URL to the request for later use
        req.fileUrl = result.secure_url;
        next();
      } catch (e) {
        next(e);
      }
    });
  };
}

// Export specific upload handlers used in the routes
export const uploadProfileImage = cloudinaryUploader('profile_image', 'profiles');
export const uploadCampaignImage = cloudinaryUploader('campaign_image', 'campaigns');
export const uploadChatFile = cloudinaryUploader('chat_file', 'chats', 'auto'); // "auto" allows any file type

// Multiple image upload (e.g., portfolio pictures)
export const uploadMultipleImages = (req, res, next) => {
  const upload = multer({ storage }).array('images', 5);
  upload(req, res, async err => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) return next();
    try {
      const urls = [];
      for (const file of req.files) {
        const timestamp = Date.now();
        const uniqueId = `${file.fieldname}-${timestamp}`;
        const result = await uploadToCloudinary(file.buffer, uniqueId, 'images');
        urls.push(result.secure_url);
      }
      req.fileUrls = urls;
      next();
    } catch (e) {
      next(e);
    }
  });
};

export default multer({ storage });
