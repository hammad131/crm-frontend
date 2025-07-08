// lib/cloudinary.js
import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset"; // replace with your actual preset
const CLOUDINARY_CLOUD_NAME = "dnfxaju5y"; // replace with your Cloudinary cloud name

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );

  return response.data.secure_url;
};
