import React from 'react';
import ImageUpload from './ImageUpload';

interface GalleryUploadProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  maxImages?: number;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({ images = [], onChange, maxImages = 6 }) => {
  
  // Handle adding a new image
  const handleAddImage = (url: string) => {
    if (images.length < maxImages) {
      // Append new URL to the list
      onChange([...images, url]);
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  // Handle updating a specific slot (replacing an image)
  const handleUpdateImage = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Render Existing Slots */}
        {images.map((img, index) => (
          <div key={index} className="relative group">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Image {index + 1}</label>
            <div className="h-32 w-full">
               <ImageUpload 
                 currentImage={img} 
                 onUpload={(url) => handleUpdateImage(index, url)} 
               />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600 z-10"
              title="Remove Image"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Render "Add New" Slot if under limit */}
        {images.length < maxImages && (
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-1 block">Add New ({images.length + 1}/{maxImages})</label>
            <div className="h-32 w-full">
              {/* 🔴 THE FIX: key={images.length} forces a reset after every upload */}
              <ImageUpload 
                key={images.length} 
                onUpload={handleAddImage} 
              />
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">
        Upload up to {maxImages} images.
      </p>
    </div>
  );
};

export default GalleryUpload;