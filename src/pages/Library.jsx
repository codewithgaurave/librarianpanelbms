import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Upload,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
  User,
  Users
} from "lucide-react";
import HeroHead from "../components/HeroHead";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import facilityAPI from "../apis/facilityAPI";
import libraryTypeAPI from "../apis/libraryTypeAPI";
import libraryAPI from "../apis/libraryAPI";

export default function LibraryRegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    libraryName: "",
    libraryType: "",
    description: "",
    logo: null,
    images: [],
    location: "",
    pinCode: "",
    contactNumber: "",
    email: "",
    password: "",
    timingFrom: "",
    timingTo: "",
    services: [],
    totalBooks: "",
    librarianName: "",
    librarianEmail: "",
    librarianMobile: "",
    userMotions: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [availableServices, setAvailableServices] = useState([]);
  const [libraryTypes, setLibraryTypes] = useState([]);

  const fetchAvailableServices = async () => {
    try {
      const { data } = await facilityAPI.getAllFacilities();
      setAvailableServices(data.data);
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  const fetchLibraryTypes = async () => {
    const { data } = await libraryTypeAPI.getAllLibraryTypes();
    try {
      setLibraryTypes(data.data);
    } catch (error) {
      toast.error("Failed to fetch library types");
    }
  };

  useEffect(() => {
    fetchAvailableServices();
    fetchLibraryTypes();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!formData.libraryName.trim()) newErrors.libraryName = "Library name is required";
    if (!formData.libraryType) newErrors.libraryType = "Library type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";


    if (!formData.pinCode) {
      newErrors.pinCode = "Pin code is required";
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Pin code must be 6 digits";
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Invalid phone number";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.timingFrom) newErrors.timingFrom = "Opening time is required";
    if (!formData.timingTo) newErrors.timingTo = "Closing time is required";
    if (formData.services.length === 0) newErrors.services = "At least one service must be selected";
    if (!formData.totalBooks) newErrors.totalBooks = "Total books is required";

    if (!formData.librarianName.trim()) newErrors.librarianName = "Librarian name is required";

    if (!formData.librarianEmail) {
      newErrors.librarianEmail = "Librarian email is required";
    } else if (!emailRegex.test(formData.librarianEmail)) {
      newErrors.librarianEmail = "Invalid email format";
    }

    if (!formData.librarianMobile) {
      newErrors.librarianMobile = "Librarian mobile is required";
    } else if (!phoneRegex.test(formData.librarianMobile)) {
      newErrors.librarianMobile = "Invalid phone number";
    }

    if (!formData.userMotions.trim()) newErrors.userMotions = "User motions is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (name === "logo") {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      } else if (name === "images") {
        setFormData((prev) => ({ ...prev, [name]: Array.from(files) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceChange = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm) {
      toast.error("Form validation is failed!")
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "logo" && key !== "images" && key !== "services") {
          formDataToSend.append(key, value);
        }
      });

      // Append files with correct field names
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      // Append multiple images
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // Append services as JSON string
      formDataToSend.append("services", JSON.stringify(formData.services));

      // Log FormData contents for debugging
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const res = await libraryAPI.registerLibrary(formDataToSend);

      if (res.data.success) {
        toast.success(res.data.message);
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Library registration failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white">
      <HeroHead text={"Library Registration"} />

      <section className="py-16">
        <div className="mx-auto sm:px-6 lg:px-8">
          <div className="bg-gray0 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Registration and no commission
              </h2>
              <p className="dark:text-gray-400">
                Please fill in all the required information about your library
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Library Name *
                  </label>
                  <input
                    type="text"
                    name="libraryName"
                    value={formData.libraryName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white dark:placeholder-gray-400 ${errors.libraryName ? "border-red-500" : ""
                      }`}
                    placeholder="Enter library name"
                  />
                  {errors.libraryName && (
                    <p className="mt-1 text-sm text-red-500">{errors.libraryName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Library Type *
                  </label>
                  <select
                    name="libraryType"
                    value={formData.libraryType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white ${errors.libraryType ? "border-red-500" : ""
                      }`}
                  >
                    <option value="">Select library type</option>
                    {libraryTypes?.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.type}
                      </option>
                    ))}
                  </select>
                  {errors.libraryType && (
                    <p className="mt-1 text-sm text-red-500">{errors.libraryType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Total Number of Books *
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="number"
                      name="totalBooks"
                      value={formData.totalBooks}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.totalBooks ? "border-red-500" : ""
                        }`}
                      placeholder="e.g., 5000"
                      min="0"
                    />
                  </div>
                  {errors.totalBooks && (
                    <p className="mt-1 text-sm text-red-500">{errors.totalBooks}</p>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    User Motions *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="text"
                      name="userMotions"
                      value={formData.userMotions}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${
                        errors.userMotions ? "border-red-500" : ""
                      }`}
                      placeholder="Describe user motions"
                    />
                  </div>
                  {errors.userMotions && (
                    <p className="mt-1 text-sm text-red-500">{errors.userMotions}</p>
                  )}
                </div> */}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                  Library Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.description ? "border-red-500" : ""
                    }`}
                  placeholder="Describe your library, its mission, and what makes it special..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Library Logo
                  </label>
                  <div className="border-2 border-dashed dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="mx-auto h-12 w-12 dark:text-gray-400 mb-4" />
                    <input
                      type="file"
                      name="logo"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <span className="text-blue-400 hover:text-blue-300">
                        Upload logo
                      </span>
                      <p className="dark:text-gray-400 text-sm mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                    {formData.logo && (
                      <p className="text-sm text-green-500 mt-2">
                        {formData.logo.name} selected
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Library Images
                  </label>
                  <div className="border-2 border-dashed dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <Upload className="mx-auto h-12 w-12 dark:text-gray-400 mb-4" />
                    <input
                      type="file"
                      name="images"
                      onChange={handleInputChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="images-upload"
                    />
                    <label htmlFor="images-upload" className="cursor-pointer">
                      <span className="text-blue-400 hover:text-blue-300">
                        Upload images
                      </span>
                      <p className="dark:text-gray-400 text-sm mt-1">
                        Multiple images allowed
                      </p>
                    </label>
                    {formData.images.length > 0 && (
                      <p className="text-sm text-green-500 mt-2">
                        {formData.images.length} image(s) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.location ? "border-red-500" : ""
                        }`}
                      placeholder="Full address"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Pin Code *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      maxLength="6"
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.pinCode ? "border-red-500" : ""
                        }`}
                      placeholder="6-digit pin code"
                    />
                  </div>
                  {errors.pinCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.pinCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.contactNumber ? "border-red-500" : ""
                        }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Email ID *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.email ? "border-red-500" : ""
                        }`}
                      placeholder="library@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

              </div>

              {/* Librarian Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Librarian Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="text"
                      name="librarianName"
                      value={formData.librarianName}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.librarianName ? "border-red-500" : ""
                        }`}
                      placeholder="Librarian full name"
                    />
                  </div>
                  {errors.librarianName && (
                    <p className="mt-1 text-sm text-red-500">{errors.librarianName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Librarian Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="email"
                      name="librarianEmail"
                      value={formData.librarianEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.librarianEmail ? "border-red-500" : ""
                        }`}
                      placeholder="librarian@example.com"
                    />
                  </div>
                  {errors.librarianEmail && (
                    <p className="mt-1 text-sm text-red-500">{errors.librarianEmail}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Librarian Mobile *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                    <input
                      type="tel"
                      name="librarianMobile"
                      value={formData.librarianMobile}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.librarianMobile ? "border-red-500" : ""
                        }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.librarianMobile && (
                    <p className="mt-1 text-sm text-red-500">{errors.librarianMobile}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-400 ${errors.password ? "border-red-500" : ""
                        }`}
                      placeholder="Create secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 dark:text-gray-400 dark:hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>
              {/* Timing */}
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-4">
                  Library Timing *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                      <input
                        type="time"
                        name="timingFrom"
                        value={formData.timingFrom}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white ${errors.timingFrom ? "border-red-500" : ""
                          }`}
                      />
                      <label className="absolute -top-2 left-4 dark:bg-gray-800 bg-white px-2 text-xs dark:text-gray-400">
                        From
                      </label>
                    </div>
                    {errors.timingFrom && (
                      <p className="mt-1 text-sm text-red-500">{errors.timingFrom}</p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 dark:text-gray-400" />
                      <input
                        type="time"
                        name="timingTo"
                        value={formData.timingTo}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white ${errors.timingTo ? "border-red-500" : ""
                          }`}
                      />
                      <label className="absolute -top-2 left-4 dark:bg-gray-800 bg-white px-2 text-xs dark:text-gray-400">
                        To
                      </label>
                    </div>
                    {errors.timingTo && (
                      <p className="mt-1 text-sm text-red-500">{errors.timingTo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-4">
                  Services Offered *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableServices?.map((service) => (
                    <label
                      key={service._id}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service._id)}
                        onChange={() => handleServiceChange(service._id)}
                        className="w-4 h-4 text-blue-600 dark:bg-gray-700 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm dark:text-gray-300">
                        {service.facility}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.services && (
                  <p className="mt-1 text-sm text-red-500">{errors.services}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {isSubmitting ? "Registering..." : "Register Library"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}