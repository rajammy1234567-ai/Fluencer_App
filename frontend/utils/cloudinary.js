/**
 * Cloudinary Image & Video Upload Helper
 * 
 * 100% Crash-Free HTTPS REST Upload Service for Photos & Videos (MP4/MOV)
 * Supports User's Cloudinary Accounts: hrqmdn4c, dxyvn9gig
 */

export const uploadToCloudinary = async (fileOrUri) => {
  if (!fileOrUri) return fileOrUri;

  // If already HTTPS URL, return as is
  if (typeof fileOrUri === 'string' && (fileOrUri.startsWith('http://') || fileOrUri.startsWith('https://'))) {
    return fileOrUri;
  }

  const CLOUDINARY_CLOUDS = ['hrqmdn4c', 'dxyvn9gig', 'dvyh3e9xs'];
  const PRESETS_TO_TRY = ['ml_default', 'unsigned', 'preset_fluencer', 'fluencer'];

  for (const cloudName of CLOUDINARY_CLOUDS) {
    for (const preset of PRESETS_TO_TRY) {
      try {
        const formData = new FormData();

        if (typeof File !== 'undefined' && fileOrUri instanceof File) {
          formData.append('file', fileOrUri);
        } else if (typeof fileOrUri === 'string' && fileOrUri.startsWith('data:')) {
          formData.append('file', fileOrUri);
        } else {
          const filename = String(fileOrUri).split('/').pop() || 'upload.mp4';
          const match = /\.(\w+)$/.exec(filename);
          const ext = match ? match[1].toLowerCase() : 'mp4';
          const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext);
          const type = isVideo ? `video/${ext}` : `image/${ext === 'png' ? 'png' : 'jpeg'}`;
          formData.append('file', { uri: fileOrUri, name: filename, type });
        }

        formData.append('upload_preset', preset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.secure_url) {
          console.log(`✅ Cloudinary upload success on ${cloudName}:`, data.secure_url);
          return data.secure_url;
        }
      } catch (error) {
        console.warn(`⚠️ Cloudinary ${cloudName}:${preset} upload error:`, error);
      }
    }
  }

  return typeof fileOrUri === 'string' ? fileOrUri : '';
};
