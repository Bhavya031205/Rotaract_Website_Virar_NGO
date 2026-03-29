import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

// 1. DEFINE BACKEND URL
const API_BASE_URL = "http://localhost:5000";

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // 2. HELPER: FIX IMAGE URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
    
    // Clean messy paths
    const fileName = imagePath.split(/[/\\]/).pop();
    if (!fileName) return null;

    return `${API_BASE_URL}/uploads/${fileName}`;
  };

  useEffect(() => {
    if (currentImage) {
      setPreview(getImageUrl(currentImage));
    } else {
      setPreview(null);
    }
  }, [currentImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.url) {
        onUpload(res.data.url); 
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // 3. NEW: REMOVE IMAGE FUNCTION
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent opening file dialog
    e.stopPropagation(); // Stop event bubbling
    setPreview(null);
    onUpload(''); // Send empty string to parent to clear DB field
  };

  return (
    <div className="w-full h-full">
      <label className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden group">
        
        {preview ? (
           <div className="absolute inset-0 w-full h-full bg-white flex items-center justify-center">
             <img 
               src={preview} 
               alt="Preview" 
               className="w-full h-full object-contain p-1" 
             />
             
             {/* HOVER OVERLAY */}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
               <p className="text-white font-bold text-sm">Click to Change</p>
               
               {/* 🔴 REMOVE BUTTON */}
               <button 
                 onClick={handleRemove}
                 className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-red-700 shadow-md transform hover:scale-105 transition"
               >
                 Remove Image
               </button>
             </div>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <p className="text-blue-600 font-bold text-sm animate-pulse">Uploading...</p>
            ) : (
              <>
                <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-1 text-xs text-gray-500"><span className="font-semibold">Click to upload</span></p>
              </>
            )}
          </div>
        )}

        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      </label>
    </div>
  );
};

export default ImageUpload;