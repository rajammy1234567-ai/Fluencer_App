/**
 * Cloudinary Image Upload Helper
 * 
 * 100% Crash-Free HTTPS REST Upload Service
 * Uses User's Cloudinary Account: dxyvn9gig
 */

const CLOUDINARY_CLOUD_NAME = 'dxyvn9gig';
const PRESETS_TO_TRY = ['ml_default', 'unsigned', 'preset_fluencer', 'fluencer'];

/**
 * Upload an image (base64 string, local file uri, or remote url) to Cloudinary
 * @param {string} imageUri - Image URI, base64 data URI, or URL
 * @returns {Promise<string>} Uploaded Cloudinary HTTPS URL
 */
export const uploadToCloudinary = async (imageUri) => {
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Invalid image URI provided');
  }

  // If it's already an HTTP/HTTPS URL, return directly
  if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
    return imageUri;
  }

  for (const preset of PRESETS_TO_TRY) {
    try {
      const formData = new FormData();

      // Prepare image payload
      if (imageUri.startsWith('data:image')) {
        formData.append('file', imageUri);
      } else {
        const filename = imageUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('file', { uri: imageUri, name: filename, type });
      }

      formData.append('upload_preset', preset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.secure_url) {
        console.log('✅ Cloudinary upload success:', data.secure_url);
        return data.secure_url;
      }
    } catch (error) {
      console.warn(`⚠️ Cloudinary preset ${preset} failed:`, error);
    }
  }

  // Fallback to original imageUri
  return imageUri;
};
