import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiEdit,
  FiSave,
  FiX,
  FiPhone,
  FiMail,
  FiClock,
  FiMapPin,
  FiTrash2,
  FiUpload,
  FiBook,
  FiStar,
  FiUsers,
  FiAward,
  FiCamera,
  FiInfo,
  FiCheckCircle,
  FiUser,
  FiHome,
  FiMap
} from 'react-icons/fi';
import libraryAPI from '../apis/libraryAPI';
import facilityAPI from '../apis/facilityAPI';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import MapLocationPicker from "../components/MapLocationPicker";

const ManageProfile = () => {
  const { theme, themeColors } = useTheme();
  const userData = useSelector((state) => state.auth.user);
  const user = userData.user;
  const token = userData.token;
  const { libraryId } = useParams();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    libraryName: '',
    libraryType: { _id: '', type: '' },
    description: '',
    contactNumber: '',
    email: '',
    location: '',
    coordinates: { lat: 0, lng: 0 },
    pinCode: '',
    timingFrom: '',
    timingTo: '',
    totalBooks: 0,
    services: [],
    logo: '',
    images: [],
    hourlyFee: 0,
    monthlyFee: 0
  });
  const [availableServices, setAvailableServices] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeFullImage = () => {
    setSelectedImage(null);
  };

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await libraryAPI.getMyLibrary(token);
      const libraryData = response.data.library;
      setLibrary(libraryData);

      setFormData({
        libraryName: libraryData.libraryName,
        libraryType: libraryData.libraryType || { _id: '', type: '' },
        description: libraryData.description,
        contactNumber: libraryData.contactNumber,
        email: libraryData.email,
        location: libraryData.location,
        coordinates: libraryData.coordinates || { lat: 0, lng: 0 },
        pinCode: libraryData.pinCode || '',
        timingFrom: libraryData.timingFrom,
        timingTo: libraryData.timingTo,
        totalBooks: libraryData.totalBooks,
        services: libraryData.services || [],
        logo: libraryData.logo,
        images: libraryData.images || [],
        hourlyFee: libraryData.hourlyFee || 0,
        monthlyFee: libraryData.monthlyFee || 0
      });

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch library data');
      setLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await facilityAPI.getAllFacilities();
      setAvailableServices(response.data.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      toast.error('Failed to load available services');
    }
  };

  useEffect(() => {
    fetchLibrary();
    fetchAvailableServices();
  }, [libraryId, user?._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'libraryType') {
      setFormData(prev => ({
        ...prev,
        libraryType: {
          ...prev.libraryType,
          type: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData.address,
      coordinates: {
        lat: locationData.lat,
        lng: locationData.lng
      },
      pinCode: locationData.pinCode
    }));
  };

  const handleServicesChange = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size should be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, logo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);

      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);
      if (validFiles.length !== filesArray.length) {
        toast.error('Some images were too large (max 5MB each)');
      }

      if (validFiles.length > 0) {
        setImageFiles(prev => [...prev, ...validFiles]);

        const previews = validFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve({
              url: event.target.result,
              name: file.name
            });
            reader.readAsDataURL(file);
          });
        });

        Promise.all(previews).then(previewUrls => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...previewUrls]
          }));
        });
      }
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    const removedImage = updatedImages.splice(index, 1)[0];

    if (removedImage.name) {
      setImageFiles(prev => prev.filter((_, i) => i !== index - (formData.images.length - imageFiles.length)));
    } else {
      setImagesToDelete(prev => [...prev, removedImage]);
    }

    setFormData(prev => ({ ...prev, images: updatedImages }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append('libraryName', formData.libraryName);

      // Handle libraryType
      if (formData.libraryType._id) {
        formDataToSend.append('libraryType', formData.libraryType._id);
      } else {
        formDataToSend.append('libraryType', formData.libraryType.type);
      }

      formDataToSend.append('description', formData.description);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('coordinates', JSON.stringify(formData.coordinates));
      formDataToSend.append('pinCode', formData.pinCode);
      formDataToSend.append('timingFrom', formData.timingFrom);
      formDataToSend.append('timingTo', formData.timingTo);
      formDataToSend.append('totalBooks', formData.totalBooks);

      // Add these two lines for fees
      formDataToSend.append('hourlyFee', formData.hourlyFee || 0);
      formDataToSend.append('monthlyFee', formData.monthlyFee || 0);

      // Handle services
      formDataToSend.append('services', JSON.stringify(
        formData.services.map(s => typeof s === 'string' ? s : s._id)
      ));

      // Handle logo
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      // Handle images
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // Handle images to delete
      if (imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      const response = await libraryAPI.updateLibrary(library._id, formDataToSend, token);

      setLibrary(response.data.library);
      fetchLibrary();
      setLogoFile(null);
      setImageFiles([]);
      setImagesToDelete([]);
      setEditMode(false);
      toast.success('Library profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      libraryName: library.libraryName,
      libraryType: library.libraryType || { _id: '', type: '' },
      description: library.description,
      contactNumber: library.contactNumber,
      email: library.email,
      location: library.location,
      coordinates: library.coordinates || { lat: 0, lng: 0 },
      pinCode: library.pinCode || '',
      timingFrom: library.timingFrom,
      timingTo: library.timingTo,
      totalBooks: library.totalBooks,
      services: library.services || [],
      logo: library.logo,
      images: library.images || [],
      hourlyFee: library.hourlyFee || 0,
      monthlyFee: library.monthlyFee || 0
    });
    setLogoFile(null);
    setImageFiles([]);
    setImagesToDelete([]);
    setEditMode(false);
  };

  if (loading && !library) {
    return (
      <div
        className="flex justify-center items-center min-h-[80vh]"
        style={{ backgroundColor: themeColors.background }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4"
          style={{
            borderColor: `${themeColors.primary}30`,
            borderTopColor: themeColors.primary
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex justify-center items-center min-h-[80vh]"
        style={{ backgroundColor: themeColors.background }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <FiInfo className="text-4xl mb-4 mx-auto" style={{ color: themeColors.accent || '#ef4444' }} />
          <p style={{ color: themeColors.text }}>{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-2 min-h-screen"
      style={{ backgroundColor: themeColors.background }}
    >
      {/* Hero Section with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden mb-6 p-8"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.accent || themeColors.primary}25)`,
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
        }}
      >
        <div className="relative z-10 flex justify-between items-center flex-wrap gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: themeColors.text }}
            >
              {formData?.libraryName}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span
                className="px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                  color: themeColors.primary
                }}
              >
                <FiAward className="inline mr-1" />
                {formData?.libraryType?.type}
              </span>
              <span
                className="px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: theme === 'light' ? '#10b98120' : '#10b98130',
                  color: '#10b981'
                }}
              >
                <FiUsers className="inline mr-1" />
                Active Library
              </span>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!editMode ? (
              <motion.button
                key="edit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 font-medium shadow transition-all duration-200"
                style={{
                  backgroundColor: themeColors.primary,
                  color: '#ffffff'
                }}
                onClick={() => setEditMode(true)}
              >
                <FiEdit className="text-lg" />
                Edit Profile
              </motion.button>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-3 max-sm:flex-col"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 font-medium shadow transition-all duration-200"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: '#ffffff'
                  }}
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent"
                    />
                  ) : (
                    <FiSave className="text-lg" />
                  )}
                  Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 font-medium border-2 transition-all duration-200"
                  style={{
                    borderColor: themeColors.primary,
                    color: themeColors.primary,
                    backgroundColor: 'transparent'
                  }}
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <FiX className="text-lg" />
                  Cancel
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <FiBook className="w-full h-full" style={{ color: themeColors.accent || themeColors.primary }} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Logo and Contact */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Logo Section */}
          <div
            className="p-6 shadow"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img
                    src={
                      formData.logo?.startsWith('data:')
                        ? formData.logo
                        : `${import.meta.env.VITE_BASE_API}/uploads/${formData.logo}`
                    }
                    alt={`${formData.libraryName} logo`}
                    className="w-32 h-32 object-cover shadow border-4"
                    style={{
                      borderColor: themeColors.primary + '30'
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.primary}40)`
                    }}
                  />
                </motion.div>

                {editMode && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 p-3 shadow cursor-pointer"
                    style={{ backgroundColor: themeColors.accent || themeColors.primary }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <label className="cursor-pointer">
                      <FiCamera className="text-lg text-white" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleLogoChange}
                        accept="image/*"
                      />
                    </label>
                  </motion.div>
                )}
              </div>

              <h3 className="text-lg font-bold mt-4" style={{ color: themeColors.text }}>
                Library Logo
              </h3>

              {editMode && logoFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-2 text-sm flex items-center gap-2"
                  style={{
                    backgroundColor: theme === 'light' ? '#f0fdf4' : '#14532d',
                    color: '#16a34a'
                  }}
                >
                  <FiCheckCircle />
                  New logo selected
                  <button
                    onClick={() => {
                      setLogoFile(null);
                      setFormData(prev => ({ ...prev, logo: library.logo }));
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Librarian Information */}
          {library?.librarian && (
            <div
              className="p-6 shadow"
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2"
                  style={{
                    backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                    color: themeColors.accent || themeColors.primary
                  }}
                >
                  <FiUser className="text-lg" />
                </div>
                <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                  Librarian Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiUser
                    className="text-lg flex-shrink-0"
                    style={{ color: themeColors.accent || themeColors.primary }}
                  />
                  <p className="text-sm" style={{ color: themeColors.text }}>
                    {library.librarian.name}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FiMail
                    className="text-lg flex-shrink-0"
                    style={{ color: themeColors.accent || themeColors.primary }}
                  />
                  <p className="text-sm" style={{ color: themeColors.text }}>
                    {library.librarian.email}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <FiPhone
                    className="text-lg flex-shrink-0"
                    style={{ color: themeColors.accent || themeColors.primary }}
                  />
                  <p className="text-sm" style={{ color: themeColors.text }}>
                    {library.librarian.mobile}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Library Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div
              className="p-6 shadow"
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3"
                  style={{
                    backgroundColor: theme === 'light' ? '#dbeafe' : '#1e3a8a',
                    color: '#3b82f6'
                  }}
                >
                  <FiBook className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                    Total Books
                  </h3>
                  <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    Library collection
                  </p>
                </div>
              </div>

              {editMode ? (
                <input
                  name="totalBooks"
                  type="number"
                  value={formData.totalBooks || 0}
                  onChange={handleInputChange}
                  className="w-full border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                    color: themeColors.text,
                    '--tw-ring-color': themeColors.primary + '50'
                  }}
                />
              ) : (
                <p className="text-2xl font-bold" style={{ color: themeColors.accent || themeColors.primary }}>
                  {formData.totalBooks?.toLocaleString() || 0}
                </p>
              )}
            </div>

            <div
              className="p-6 shadow"
              style={{
                backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3"
                  style={{
                    backgroundColor: theme === 'light' ? '#f3e8ff' : '#581c87',
                    color: '#8b5cf6'
                  }}
                >
                  <FiAward className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                    Library Type
                  </h3>
                  <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    Category
                  </p>
                </div>
              </div>

              {editMode ? (
                <input
                  name="libraryType"
                  value={formData.libraryType?.type || ''}
                  onChange={handleInputChange}
                  className="w-full border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                    color: themeColors.text,
                    '--tw-ring-color': themeColors.primary + '50'
                  }}
                  placeholder="e.g., Public, Academic, Special"
                />
              ) : (
                <p className="text-2xl font-bold" style={{ color: themeColors.accent || themeColors.primary }}>
                  {formData.libraryType?.type || 'Not specified'}
                </p>
              )}
            </div>

            <div
              className="p-6 shadow"
              style={{
                backgroundColor: theme === "light" ? "#ffffff" : "#1f2937",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-1"
                  style={{
                    backgroundColor: theme === "light" ? "#f3e8ff" : "#581c87",
                    color: "#8b5cf6"
                  }}
                >
                  <img
                    src="../../public/img/bms_coin.jpg"
                    alt="BMS Coin"
                    className="h-10 w-10 object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                    Booking Rates <span className="text-red-600">*</span>
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: theme === "light" ? "#6b7280" : "#9ca3af" }}
                  >
                    Set your rates.{" "}
                  </p>
                </div>
              </div>

              {editMode ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Hourly Fee Input */}
                  <div>
                    <label
                      className="block text-sm mb-1"
                      style={{ color: theme === "light" ? "#6b7280" : "#9ca3af" }}
                    >
                      Hourly Rate
                    </label>
                    <div className="flex items-center">
                      <img
                        src="../../public/img/bms_coin.jpg"
                        alt="coin"
                        className="h-5 w-5 mr-2"
                      />
                      <input
                        type="number"
                        name="hourlyFee"
                        value={formData.hourlyFee || ""}
                        onChange={handleInputChange}
                        className="w-full border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                        style={{
                          backgroundColor: themeColors.background,
                          borderColor: theme === "light" ? "#e5e7eb" : "#374151",
                          color: themeColors.text,
                          "--tw-ring-color": themeColors.primary + "50"
                        }}
                        placeholder="e.g., 99"
                      />
                    </div>
                  </div>

                  {/* Monthly Fee Input */}
                  <div>
                    <label
                      className="block text-sm mb-1"
                      style={{ color: theme === "light" ? "#6b7280" : "#9ca3af" }}
                    >
                      Monthly Rate <span className="text-red-600">*</span>
                    </label>
                    <div className="flex items-center">
                      <img
                        src="../../public/img/bms_coin.jpg"
                        alt="coin"
                        className="h-5 w-5 mr-2"
                      />
                      <input
                        type="number"
                        name="monthlyFee"
                        value={formData.monthlyFee || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                        style={{
                          backgroundColor: themeColors.background,
                          borderColor: theme === "light" ? "#e5e7eb" : "#374151",
                          color: themeColors.text,
                          "--tw-ring-color": themeColors.primary + "50"
                        }}
                        placeholder="e.g., 2000"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Hourly Fee Display */}
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: theme === "light" ? "#6b7280" : "#9ca3af" }}
                      >
                        Hourly Rate
                      </p>
                      <div className="text-xl font-bold flex items-center" style={{ color: themeColors.accent || themeColors.primary }}>
                        <img
                          src="../../public/img/bms_coin.jpg"
                          alt="coin"
                          className="h-5 w-5 mr-1"
                        />
                        {formData.hourlyFee || "Not specified"}
                      </div>
                    </div>

                    {/* Monthly Fee Display */}
                    <div>
                      <p
                        className="text-sm"
                        style={{ color: theme === "light" ? "#6b7280" : "#9ca3af" }}
                      >
                        Monthly Rate <span className="text-red-600">*</span>
                      </p>
                      <div className="text-xl font-bold flex items-center" style={{ color: themeColors.accent || themeColors.primary }}>
                        <img
                          src="../../public/img/bms_coin.jpg"
                          alt="coin"
                          className="h-5 w-5 mr-1"
                        />
                        {formData.monthlyFee || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className='mt-5 text-xs'>
                Set your hourly and monthly booking rates.{" "}
                <span className="text-red-600 font-medium">
                  Monthly rate is required to start monthly booking in your library.
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Description Section */}
          <div
            className="p-6 shadow"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2"
                style={{
                  backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                  color: themeColors.accent || themeColors.primary
                }}
              >
                <FiInfo className="text-lg" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                About Library
              </h3>
            </div>

            {editMode ? (
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full border-2 px-4 py-3 text-sm transition-all duration-200 focus:ring-2 resize-none"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                  color: themeColors.text,
                  '--tw-ring-color': themeColors.primary + '50',
                  minHeight: '120px'
                }}
                placeholder="Tell us about your library..."
              />
            ) : (
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: themeColors.text }}
              >
                {formData.description || 'No description provided yet.'}
              </p>
            )}
          </div>

          {/* Location Section */}
          <div
            className="p-6 shadow"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2"
                style={{
                  backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                  color: themeColors.accent || themeColors.primary
                }}
              >
                <FiMapPin className="text-lg" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                Library Location
              </h3>
            </div>

            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                      Address
                    </label>
                    <input
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="w-full border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                        color: themeColors.text,
                        '--tw-ring-color': themeColors.primary + '50'
                      }}
                      placeholder="Enter library address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                      Pin Code
                    </label>
                    <input
                      name="pinCode"
                      value={formData.pinCode || ''}
                      onChange={handleInputChange}
                      className="w-full border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                        color: themeColors.text,
                        '--tw-ring-color': themeColors.primary + '50'
                      }}
                      placeholder="Enter pin code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                    Select Location on Map
                  </label>
                  <div className="border-2 overflow-hidden p-2"
                    style={{
                      borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                    }}
                  >
                    <MapLocationPicker
                      onLocationSelect={handleLocationSelect}
                      initialPosition={[
                        formData.coordinates?.lat || 26.8467,
                        formData.coordinates?.lng || 80.9462
                      ]}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FiMapPin
                    className="text-lg flex-shrink-0 mt-1"
                    style={{ color: themeColors.accent || themeColors.primary }}
                  />
                  <div>
                    <p className="text-sm" style={{ color: themeColors.text }}>
                      {formData.location || 'No address provided'}
                    </p>
                    {formData.pinCode && (
                      <p className="text-xs mt-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                        Pin Code: {formData.pinCode}
                      </p>
                    )}
                  </div>
                </div>

                {formData.coordinates?.lat && formData.coordinates?.lng && (
                  <div className="h-64 overflow-hidden border"
                    style={{
                      borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                    }}
                  >
                    <MapLocationPicker
                      initialPosition={[formData.coordinates.lat, formData.coordinates.lng]}
                      interactive={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div
            className="p-6 shadow"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2"
                style={{
                  backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                  color: themeColors.accent || themeColors.primary
                }}
              >
                <FiPhone className="text-lg" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                Contact Information
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { icon: FiPhone, name: 'contactNumber', placeholder: 'Contact Number', value: formData.contactNumber },
                { icon: FiMail, name: 'email', placeholder: 'Email Address', value: formData.email }
              ].map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <field.icon
                    className="text-lg flex-shrink-0"
                    style={{ color: themeColors.accent || themeColors.primary }}
                  />
                  {editMode ? (
                    <input
                      name={field.name}
                      value={field.value || ''}
                      onChange={handleInputChange}
                      className="flex-1 border-2 px-3 py-2 text-sm transition-all duration-200 focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                        color: themeColors.text,
                        '--tw-ring-color': themeColors.primary + '50'
                      }}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <p
                      className="flex-1 text-sm"
                      style={{ color: themeColors.text }}
                    >
                      {field.value || 'Not provided'}
                    </p>
                  )}
                </motion.div>
              ))}

              {/* Opening Hours */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <FiClock
                  className="text-lg flex-shrink-0"
                  style={{ color: themeColors.accent || themeColors.primary }}
                />
                {editMode ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      name="timingFrom"
                      value={formData.timingFrom || ''}
                      onChange={handleInputChange}
                      placeholder="Opening"
                      className="border-2 px-3 py-2 w-[20px] text-sm flex-1 transition-all duration-200 focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                        color: themeColors.text,
                        '--tw-ring-color': themeColors.primary + '50'
                      }}
                    />
                    <span style={{ color: themeColors.text }}>_</span>
                    <input
                      name="timingTo"
                      value={formData.timingTo || ''}
                      onChange={handleInputChange}
                      placeholder="Closing"
                      className="border-2 px-3 py-2 w-[25px] text-sm flex-1 transition-all duration-200 focus:ring-2"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                        color: themeColors.text,
                        '--tw-ring-color': themeColors.primary + '50'
                      }}
                    />
                  </div>
                ) : (
                  <p
                    className="flex-1 text-sm"
                    style={{ color: themeColors.text }}
                  >
                    {formData.timingFrom && formData.timingTo
                      ? `${formData.timingFrom} - ${formData.timingTo}`
                      : 'Not provided'
                    }
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Services Section */}
          <div
            className="p-6 shadow"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2"
                style={{
                  backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                  color: themeColors.accent || themeColors.primary
                }}
              >
                <FiStar className="text-lg" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                Available Services
              </h3>
            </div>

            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableServices.map((service, index) => (
                  <motion.label
                    key={service._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 border-2 cursor-pointer transition-all duration-200 hover:shadow"
                    style={{
                      borderColor: formData.services.some(s =>
                        (typeof s === 'string' ? s : s._id) === service._id
                      ) ? themeColors.primary : (theme === 'light' ? '#e5e7eb' : '#374151'),
                      backgroundColor: formData.services.some(s =>
                        (typeof s === 'string' ? s : s._id) === service._id
                      ) ? (theme === 'light' ? themeColors.primary + '10' : themeColors.primary + '20') : 'transparent'
                    }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.services.some(s =>
                          (typeof s === 'string' ? s : s._id) === service._id
                        )}
                        onChange={() => handleServicesChange(service._id)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 border-2 flex items-center justify-center transition-all duration-200"
                        style={{
                          borderColor: formData.services.some(s =>
                            (typeof s === 'string' ? s : s._id) === service._id
                          ) ? themeColors.primary : (theme === 'light' ? '#d1d5db' : '#4b5563'),
                          backgroundColor: formData.services.some(s =>
                            (typeof s === 'string' ? s : s._id) === service._id
                          ) ? themeColors.primary : 'transparent'
                        }}
                      >
                        {formData.services.some(s =>
                          (typeof s === 'string' ? s : s._id) === service._id
                        ) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <FiCheckCircle className="text-xs text-white" />
                            </motion.div>
                          )}
                      </div>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {service.facility}
                    </span>
                  </motion.label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {formData.services?.length > 0 ? (
                  formData.services.map((service, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm"
                      style={{
                        backgroundColor: theme === 'light' ? '#dbeafe' : '#1e40af',
                        color: theme === 'light' ? '#1e40af' : '#dbeafe'
                      }}
                    >
                      <FiStar className="text-xs" />
                      {typeof service === 'string' ?
                        availableServices.find(s => s._id === service)?.facility || service
                        : service.facility}
                    </motion.span>
                  ))
                ) : (
                  <div
                    className="text-center py-8 border-2 border-dashed w-full"
                    style={{
                      borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                      backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
                    }}
                  >
                    <FiStar
                      className="text-4xl mb-3 mx-auto"
                      style={{ color: theme === 'light' ? '#d1d5db' : '#4b5563' }}
                    />
                    <p
                      className="font-medium"
                      style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                    >
                      No services listed
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: theme === 'light' ? '#9ca3af' : '#6b7280' }}
                    >
                      Add services to showcase your library offerings
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gallery Section */}
          <div
            className="p-6 shadow"
            style={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-2"
                  style={{
                    backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                    color: themeColors.accent || themeColors.primary
                  }}
                >
                  <FiCamera className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>
                    Library Gallery
                  </h3>
                  <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    Showcase your library spaces
                  </p>
                </div>
              </div>

              {editMode && (
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer font-medium shadow-sm transition-all duration-200"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: '#ffffff'
                  }}
                >
                  <FiUpload className="text-sm" />
                  Add Images
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleImagesChange}
                    accept="image/*"
                  />
                </motion.label>
              )}
            </div>

            {formData.images?.length > 0 || (editMode && imageFiles.length > 0) ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {formData.images?.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group overflow-hidden cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={`${import.meta.env.VITE_BASE_API}/uploads/${image}`}
                        alt={`Library image ${index + 1}`}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 group-hover:bg-opacity-30 transition-all duration-300" />

                      {editMode && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow"
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                      )}

                      {editMode && image.name && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                          <p className="text-white text-xs truncate font-medium">
                            {image.name}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Full Image View Modal */}
                <AnimatePresence>
                  {selectedImage && (
                    <motion.div
                      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={closeFullImage}
                    >
                      <motion.div
                        className="relative max-w-4xl w-full max-h-screen"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="absolute -top-10 right-0 text-white p-2 hover:text-gray-300 transition-colors"
                          onClick={closeFullImage}
                        >
                          <FiX size={24} />
                        </button>

                        <img
                          src={`${import.meta.env.VITE_BASE_API}/uploads/${selectedImage}`}
                          alt="Full view"
                          className="w-full h-auto max-h-[80vh] object-contain"
                        />

                        {editMode && selectedImage.name && (
                          <div className="mt-2 text-center text-white">
                            <p className="text-sm font-medium">
                              {selectedImage.name}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div
                className="text-center py-16 border-2 border-dashed"
                style={{
                  borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                  backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <FiCamera
                    className="text-6xl mb-4"
                    style={{ color: theme === 'light' ? '#d1d5db' : '#4b5563' }}
                  />
                  <h4
                    className="text-lg font-semibold mb-2"
                    style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                  >
                    No images in gallery
                  </h4>
                  <p
                    className="text-sm mb-4"
                    style={{ color: theme === 'light' ? '#9ca3af' : '#6b7280' }}
                  >
                    Add photos to showcase your library's atmosphere and facilities
                  </p>
                  {editMode && (
                    <motion.label
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 cursor-pointer font-medium shadow transition-all duration-200"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: '#ffffff'
                      }}
                    >
                      <FiUpload className="text-lg" />
                      Upload Images
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleImagesChange}
                        accept="image/*"
                      />
                    </motion.label>
                  )}
                </motion.div>
              </div>
            )}

            {editMode && imageFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4"
                style={{
                  backgroundColor: theme === 'light' ? '#f0fdf4' : '#14532d',
                  border: `1px solid ${theme === 'light' ? '#bbf7d0' : '#166534'}`
                }}
              >
                <div className="flex items-center gap-2 text-sm" style={{ color: '#16a34a' }}>
                  <FiCheckCircle />
                  <span className="font-medium">
                    {imageFiles.length} new image{imageFiles.length > 1 ? 's' : ''} ready to upload
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: '#16a34a' }}>
                  Images will be saved when you click "Save Changes"
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ManageProfile;