import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, FileImage, X, Check, Loader } from 'lucide-react';

const UploadSection = ({ onImageUpload }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);  // ← loading state
  const [error, setError] = useState(null);               // ← error state

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  });

  const handleAnalyze = async () => {
    if (!uploadedFile || !preview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // preview is already a base64 data URI from FileReader
      // Send it directly to the Flask backend
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: preview })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Pass the file, preview AND the AI results up to the parent (App.jsx)
      // result = { type, score, suggestions, boxes }
      onImageUpload(uploadedFile, preview, result);

    } catch (err) {
      setError(err.message || 'Failed to analyze image. Is the backend running?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 py-20">
      <motion.div
        className="max-w-4xl w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Upload Your UI</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Drag and drop your UI screenshot or click to browse. 
            We support PNG, JPG, and WebP formats.
          </p>
        </motion.div>

        {/* Upload area */}
        {!uploadedFile ? (
          <motion.div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
              transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center
              ${isDragging 
                ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' 
                : 'border-gray-600 hover:border-purple-400 bg-dark-card/50 hover:bg-purple-500/5'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            
            {/* Upload icon with animation */}
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6"
              animate={isDragging ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, repeat: isDragging ? Infinity : 0 }}
            >
              <Upload className="w-12 h-12 text-purple-400" />
            </motion.div>

            <motion.h3
              className="text-2xl font-semibold mb-3"
              animate={{ color: isDragging ? '#a855f7' : '#ffffff' }}
            >
              {isDragActive ? 'Drop your image here' : 'Drop your UI screenshot here'}
            </motion.h3>

            <p className="text-gray-400 mb-6">
              or click to browse from your computer
            </p>

            {/* Supported formats */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>PNG</span>
              </div>
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>JPG</span>
              </div>
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>WebP</span>
              </div>
            </div>

            {/* Animated corner indicators */}
            {isDragActive && (
              <>
                <motion.div
                  className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <motion.div
                  className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <motion.div
                  className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <motion.div
                  className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              </>
            )}
          </motion.div>
        ) : (
          /* File preview */
          <motion.div
            className="glass-dark rounded-2xl p-8 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Preview image */}
              <div className="flex-1">
                <div className="relative rounded-xl overflow-hidden bg-dark-surface">
                  <img
                    src={preview}
                    alt="Uploaded UI"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* File info and actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">File Uploaded</h3>
                      <p className="text-gray-400">{uploadedFile.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">File size:</span>
                      <span>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span>{uploadedFile.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400">Ready to analyze</span>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </div>

                {/* Analyze button */}
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`
                    w-full py-4 rounded-xl font-semibold transition-all duration-300 mt-6
                    flex items-center justify-center gap-3
                    ${isAnalyzing
                      ? 'bg-purple-600/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 btn-glow hover:from-purple-700 hover:to-blue-700'
                    }
                  `}
                  whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
                  whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    'Analyze with AI'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-white/10">
            <span className="text-sm text-gray-400">
              💡 Tip: For best results, upload a clear screenshot with visible UI elements
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default UploadSection;
