//     const uploadImageToCloudinary = async () => {
//     if (!imageFile) return null;

//     // Cloudinary configuration - replace with your actual values
//     const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME; // Get from Cloudinary dashboard
//     const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET; // Create in Cloudinary settings

//     const data = new FormData();
//     data.append("file", imageFile);
//     data.append("upload_preset", UPLOAD_PRESET); // Required
//     data.append("folder", "profile_images"); // Optional: organize images
    
//     // Optional: Add image transformations
//     data.append("transformation", "w_500,h_500,c_fill,q_auto");

//     try {
//         console.log("Uploading image to Cloudinary...");
        
//         const res = await axios.post(
//             `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
//             data,
//             {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//                 onUploadProgress: (progressEvent) => {
//                     const percentCompleted = Math.round(
//                         (progressEvent.loaded * 100) / progressEvent.total
//                     );
//                     console.log(`Upload progress: ${percentCompleted}%`);
//                 },
//             }
//         );

//         console.log("Cloudinary upload successful:", res.data.secure_url);
//         return res.data.secure_url;
        
//     } catch (err) {
//         console.error("Image upload failed:", err);
//         console.error("Error details:", err.response?.data);
//         setError("Failed to upload image. Please try again.");
//         return null;
//     }
// };