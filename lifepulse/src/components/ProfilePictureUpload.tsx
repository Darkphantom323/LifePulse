'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Trash2, User } from 'lucide-react';
import { useUploadProfilePicture, useDeleteProfilePicture } from '@/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropModal from './ImageCropModal';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userInitials?: string;
  onUploadStart?: () => void;
  onUploadComplete?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onDeleteComplete?: () => void;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  userInitials,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onDeleteComplete
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadProfilePicture();
  const deleteMutation = useDeleteProfilePicture();

  const validateFile = (file: File): string | null => {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image';
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    // Clear any existing uploaded image state to show fresh upload
    setUploadedImageUrl(null);
    setPreviewUrl(null);

    // Create preview and show crop modal
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImageUrl(imageUrl);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  }, [onUploadError]);

  const handleCropComplete = useCallback((croppedBlob: Blob) => {
    setShowCropModal(false);
    setSelectedImageUrl(null);

    // Create a File object from the cropped blob
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });

    // Create preview from cropped blob
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreviewUrl(previewUrl);

    // Upload cropped file
    onUploadStart?.();
    uploadMutation.mutate(croppedFile, {
      onSuccess: (response) => {
        console.log('Upload successful, response:', response);
        // Clear preview and set uploaded image URL
        setPreviewUrl(null);
        URL.revokeObjectURL(previewUrl); // Clean up preview URL
        
        // Get the new image URL from response
        const imageUrl = response.profilePictureUrl || response.data?.profilePictureUrl;
        console.log('New image URL:', imageUrl);
        
        // Store the uploaded image URL temporarily for immediate display
        setUploadedImageUrl(imageUrl);
        
        // Notify parent component
        onUploadComplete?.(imageUrl);
      },
      onError: (error) => {
        console.error('Upload failed:', error);
        onUploadError?.(error.message);
        setPreviewUrl(null);
        URL.revokeObjectURL(previewUrl); // Clean up preview URL
      }
    });
  }, [uploadMutation, onUploadStart, onUploadComplete, onUploadError]);

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setSelectedImageUrl(null);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setShowDeleteConfirm(false);
      setUploadedImageUrl(null);
      onDeleteComplete?.();
    } catch (error: any) {
      onUploadError?.(error.message);
    }
  };

  // Display the uploaded image (if any), or the current image, or preview
  const displayImageUrl = uploadedImageUrl || previewUrl || currentImageUrl;
  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isLoading = isUploading || isDeleting;

  return (
    <div className="relative">
      {/* Profile Picture Display */}
      <div
        className={`relative w-24 h-24 rounded-full overflow-hidden shadow-lg transition-all duration-200 ${
          isDragging ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Profile upload image failed to load:', displayImageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {userInitials ? (
              <span className="text-white text-2xl font-bold">
                {userInitials}
              </span>
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500 bg-opacity-80 flex items-center justify-center"
            >
              <Upload className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="absolute -bottom-2 -right-2 flex gap-1">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload new picture"
        >
          <Camera className="h-4 w-4 text-gray-600" />
        </button>

        {/* Delete Button */}
        {(displayImageUrl || currentImageUrl) && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className="p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete picture"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Profile Picture</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      {selectedImageUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={selectedImageUrl}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
} 