// Test file to debug Cloudinary upload issues
export const testCloudinaryConfig = () => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  
  console.log('Cloudinary Configuration:');
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);
  
  if (!cloudName) {
    console.error('❌ REACT_APP_CLOUDINARY_CLOUD_NAME is missing!');
    return false;
  }
  
  if (!uploadPreset) {
    console.error('❌ REACT_APP_CLOUDINARY_UPLOAD_PRESET is missing!');
    return false;
  }
  
  console.log('✅ Cloudinary configuration looks good!');
  return true;
};

export const testCloudinaryUpload = async (file) => {
  if (!testCloudinaryConfig()) {
    throw new Error('Cloudinary configuration is invalid');
  }
  
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  
  const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  console.log('Uploading to:', url);
  console.log('FormData contents:', Array.from(data.entries()));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: data,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
