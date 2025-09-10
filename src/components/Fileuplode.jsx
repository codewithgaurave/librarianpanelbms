

import React, { useState, useRef, useEffect } from 'react';

function FileUpload({ label = "Upload File", error, preview, ...props }) {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(preview || null);
  const fileInputRef = useRef(null);
useEffect(() => {
  if (preview) {
    setFilePreview(preview);
    setFileName(''); // optional: clear old filename if preview is external
  }
}, [preview]);

  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  const handleChange = (e) => {
    
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (props.onChange) props.onChange(e);


     if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    }
  };

  const handleClick = () => fileInputRef.current.click();
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);

      const event = { target: { files: e.dataTransfer.files } };
      if (props.onChange) props.onChange(event);

      if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFileName('');
    setFilePreview(null);
    fileInputRef.current.value = '';
    if (props.onChange) props.onChange({ target: { files: [] } });
  };

  const isError = !!error;
  const hasFile = !!fileName;
  const displayPreview = filePreview;
  // console.log(filePreview);
  // console.log("Preview:", preview);
// console.log("FilePreview:", filePreview);


  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${isError ? 'text-red-500' : 'text-gray-700'}`}>
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
          isError
            ? 'border-red-300 bg-red-50'
            : isDragging
            ? 'border-primary-400 bg-primary-50'
            : isActive
            ? 'border-primary-300 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          backgroundImage: displayPreview ? `url(${displayPreview})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          // {...props}
        />

        <div
          className={`flex flex-col items-center justify-center p-6 text-center ${
            displayPreview ? 'bg-black/50 text-white' : ''
          }`}
        >
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-white/80 text-primary-500 group-hover:bg-primary-200">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="text-sm">
            {isDragging ? (
              <p className="font-medium text-primary-600">Drop file here</p>
            ) : (
              <>
                <p className="font-medium">
                  <span className="text-primary-600 underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>

          {hasFile && (
            <div className="mt-3 text-sm font-medium bg-white/80 text-gray-800 px-3 py-1 rounded">
              {fileName}
            </div>
          )}
        </div>

        {displayPreview && (
          <button
            type="button"
            onClick={removeFile}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isError && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FileUpload;
