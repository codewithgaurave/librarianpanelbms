import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaArrowLeft,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaChair,
  FaCoins,
  FaCheck,
  FaMinus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import seatAPI from '../apis/seatAPI';
import timeSlotAPI from '../apis/timeSlotAPI'; // Import the timeSlotAPI
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const ViewSingleSeat = () => {
  const { theme, themeColors } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.user);
  const token = userData?.token;
  const libraryId = userData?.library?._id;
  const [seatData, setSeatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showEditSlotModal, setShowEditSlotModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlotsToAdd, setTimeSlotsToAdd] = useState([{ startTime: '', endTime: '', price: '' }]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editSlotForm, setEditSlotForm] = useState({
    startTime: '',
    endTime: '',
    price: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Theme styles
  const containerStyles = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
  };

  const cardStyles = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
    borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
  };

  const buttonPrimaryStyles = {
    backgroundColor: themeColors.primary,
    color: '#ffffff',
    hoverBackgroundColor: themeColors.hover.background,
  };

  const buttonSecondaryStyles = {
    backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
    color: theme === 'light' ? '#374151' : '#f3f4f6',
    hoverBackgroundColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
  };

  const inputStyles = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
    color: themeColors.text,
    borderColor: theme === 'light' ? '#d1d5db' : '#4b5563',
  };

  // Fetch seat details
  const fetchSeatData = async () => {
    try {
      setLoading(true);
      const response = await seatAPI.getSeatDetails(id, token);
      setSeatData(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch seat details');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchSeatData();
    }
  }, [id, token]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Validate time slot
  const validateTimeSlot = (slot) => {
    const errors = {};
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!slot.startTime) errors.startTime = 'Start time is required';
    else if (!timeRegex.test(slot.startTime)) errors.startTime = 'Invalid time format (HH:MM)';

    if (!slot.endTime) errors.endTime = 'End time is required';
    else if (!timeRegex.test(slot.endTime)) errors.endTime = 'Invalid time format (HH:MM)';

    if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
      errors.timeComparison = 'End time must be after start time';
    }

    if (!slot.price) errors.price = 'Price is required';
    else if (isNaN(slot.price)) {
      errors.price = 'Price must be a number';
    } else if (parseFloat(slot.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    return errors;
  };

  // Handle time slot changes
  const handleSlotChange = (index, field, value) => {
    const updatedSlots = [...timeSlotsToAdd];
    updatedSlots[index][field] = value;
    setTimeSlotsToAdd(updatedSlots);
  };

  // Add new time slot field
  const handleAddNewSlotField = () => {
    setTimeSlotsToAdd([...timeSlotsToAdd, { startTime: '', endTime: '', price: '' }]);
  };

  // Remove time slot field
  const handleRemoveSlotField = (index) => {
    const updatedSlots = [...timeSlotsToAdd];
    updatedSlots.splice(index, 1);
    setTimeSlotsToAdd(updatedSlots);
  };

  // Add time slots
  const handleAddTimeSlots = async () => {
    try {
      // Validate all slots
      const errors = timeSlotsToAdd.map(slot => validateTimeSlot(slot));
      const hasErrors = errors.some(error => Object.keys(error).length > 0);
      
      if (hasErrors) {
        toast.error('Please fix validation errors before submitting');
        return;
      }

      await seatAPI.addTimeSlots(id, { libraryId, timeSlots: timeSlotsToAdd }, token);
      toast.success('Time slots added successfully');
      setShowAddSlotModal(false);
      setTimeSlotsToAdd([{ startTime: '', endTime: '', price: '' }]);
      fetchSeatData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add time slots');
    }
  };

  // Edit time slot
  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setEditSlotForm({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      isActive: slot.isActive
    });
    setFormErrors({});
    setShowEditSlotModal(true);
  };

  // Update time slot
  const handleUpdateSlot = async () => {
    const errors = validateTimeSlot(editSlotForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await timeSlotAPI.updateTimeSlot(
        editingSlot._id, 
        {
          startTime: editSlotForm.startTime,
          endTime: editSlotForm.endTime,
          price: editSlotForm.price,
          isActive: editSlotForm.isActive
        }, 
        token
      );
      toast.success('Time slot updated successfully');
      setShowEditSlotModal(false);
      fetchSeatData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update time slot');
    }
  };

  // Toggle time slot status
  const handleToggleSlotStatus = async (slotId, currentStatus) => {
    try {
      await timeSlotAPI.toggleTimeSlotStatus(slotId, token);
      toast.success(`Time slot ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchSeatData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update time slot status');
    }
  };

  // Delete time slot
  const handleDeleteTimeSlot = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await timeSlotAPI.deleteTimeSlot(slotId, token);
        toast.success('Time slot deleted successfully');
        fetchSeatData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete time slot');
      }
    }
  };

  // View bookings for a slot
  const handleViewBookings = (slot) => {
    setSelectedSlot(slot);
    setShowBookingsModal(true);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen"
        style={containerStyles}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 rounded-full"
          style={{
            borderColor: themeColors.primary,
            borderTopColor: 'transparent'
          }}
        ></motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen"
        style={containerStyles}
      >
        <p className="text-red-500">{error}</p>
      </motion.div>
    );
  }

  if (!seatData?.seat) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen"
        style={containerStyles}
      >
        <p style={{ color: themeColors.text }}>Seat not found</p>
      </motion.div>
    );
  }

  const { seat, timeSlots } = seatData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
      style={containerStyles}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 gap-2 px-4 py-2 rounded-lg"
        style={buttonSecondaryStyles}
      >
        <FaArrowLeft />
        Back to Seats
      </motion.button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.text }}>
            Seat Details: {seat.seatName} ({seat.seatNumber})
          </h1>
          <p style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            Manage time slots and bookings for this seat
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Seat Information Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-lg p-6 border"
          style={cardStyles}
        >
          <div className="flex items-center mb-4 gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                color: themeColors.primary
              }}
            >
              <FaUser />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Seat Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Seat Number:</p>
              <p className="text-lg" style={{ color: themeColors.text }}>{seat.seatNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Seat Name:</p>
              <p className="text-lg" style={{ color: themeColors.text }}>{seat.seatName}</p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status:</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                seat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {seat.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Created At:</p>
              <p className="text-sm" style={{ color: themeColors.text }}>{formatDate(seat.createdAt)}</p>
            </div>
          </div>
        </motion.div>

        {/* Time Slot Statistics Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-lg p-6 border"
          style={cardStyles}
        >
          <div className="flex items-center mb-4 gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                color: themeColors.primary
              }}
            >
              <FaClock />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Time Slot Statistics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Total Slots:</p>
              <p className="text-lg" style={{ color: themeColors.text }}>{timeSlots.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Active Slots:</p>
              <p className="text-lg" style={{ color: themeColors.text }}>
                {timeSlots.filter(slot => slot.timeSlot.isActive).length}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Total Bookings:</p>
              <p className="text-lg" style={{ color: themeColors.text }}>
                {timeSlots.reduce((sum, slot) => sum + slot.totalBookings, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{
              backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
              color: themeColors.primary
            }}
          >
            <FaClock />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: themeColors.text }}>Time Slots</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddSlotModal(true)}
          className="px-6 py-2 rounded-lg flex items-center gap-2 shadow-md"
          style={buttonPrimaryStyles}
        >
          <FaPlus /> Add Time Slots
        </motion.button>
      </div>

      {/* Time Slots Table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
        <table className="min-w-full divide-y">
          <thead style={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#111827' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Time Slot</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
            {timeSlots.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                  No time slots available
                </td>
              </tr>
            ) : (
              timeSlots.map((slotData, index) => {
                const slot = slotData.timeSlot;
                return (
                  <motion.tr 
                    key={slot._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: themeColors.text }}>
                      <div className="flex items-center gap-2">
                        <FaClock style={{ color: themeColors.primary }} />
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: themeColors.text }}>
                      <div className="flex items-center gap-2">
                        <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 rounded-full" />
                        {slot.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSlotStatus(slot._id, slot.isActive)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${slot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {slot.isActive ? (
                          <>
                            <FaToggleOn className="text-lg" /> Active
                          </>
                        ) : (
                          <>
                            <FaToggleOff className="text-lg" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: themeColors.text }}>
                      <button
                        onClick={() => handleViewBookings(slotData)}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: theme === 'light' ? '#f0f9ff' : '#1e3a8a',
                          color: theme === 'light' ? '#0369a1' : '#93c5fd'
                        }}
                      >
                        <FaCalendarAlt /> {slotData.totalBookings} bookings
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewBookings(slotData)}
                          style={{ color: themeColors.secondary || '#3b82f6' }}
                          className="hover:opacity-80"
                          title="View Bookings"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditSlot(slot)}
                          style={{ color: themeColors.primary }}
                          className="hover:opacity-80"
                          title="Edit Slot"
                        >
                          <FaEdit />
                        </motion.button>
                        {slotData.totalBookings === 0 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTimeSlot(slot._id)}
                            style={{ color: '#ef4444' }}
                            className="hover:opacity-80"
                            title="Delete Slot"
                          >
                            <FaTrash />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Time Slots Modal */}
      <AnimatePresence>
        {showAddSlotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-xl shadow-2xl w-full max-w-md"
              style={cardStyles}
            >
              <div className="flex justify-between items-center border-b p-4" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
                  Add New Time Slots
                </h2>
                <button
                  onClick={() => {
                    setShowAddSlotModal(false);
                    setTimeSlotsToAdd([{ startTime: '', endTime: '', price: '' }]);
                  }}
                  style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                  className="hover:opacity-80"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {timeSlotsToAdd.map((slot, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Start</label>
                        <input
                          type="time"
                          className="w-full p-2 rounded-lg border"
                          style={inputStyles}
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>End</label>
                        <input
                          type="time"
                          className="w-full p-2 rounded-lg border"
                          style={inputStyles}
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Price</label>
                        <input
                          type="number"
                          className="w-full p-2 rounded-lg border"
                          style={inputStyles}
                          value={slot.price}
                          onChange={(e) => handleSlotChange(index, 'price', e.target.value)}
                        />
                      </div>
                    </div>
                    {timeSlotsToAdd.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveSlotField(index)}
                        className="mt-2 text-sm flex items-center gap-1"
                        style={{ color: '#ef4444' }}
                      >
                        <FaTrash className="text-xs" /> Remove
                      </motion.button>
                    )}
                  </div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddNewSlotField}
                  className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                    color: themeColors.primary
                  }}
                >
                  <FaPlus /> Add Another Slot
                </motion.button>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddSlotModal(false);
                      setTimeSlotsToAdd([{ startTime: '', endTime: '', price: '' }]);
                    }}
                    className="px-6 py-2 rounded-lg transition-colors"
                    style={buttonSecondaryStyles}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddTimeSlots}
                    className="px-6 py-2 rounded-lg flex items-center gap-2"
                    style={buttonPrimaryStyles}
                  >
                    <FaCheck /> Add Slots
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Time Slot Modal */}
      <AnimatePresence>
        {showEditSlotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-xl shadow-2xl w-full max-w-md"
              style={cardStyles}
            >
              <div className="flex justify-between items-center border-b p-4" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
                  Edit Time Slot
                </h2>
                <button
                  onClick={() => setShowEditSlotModal(false)}
                  style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                  className="hover:opacity-80"
                >
                  <FaTimes />
                </button>
              </div>

              <form className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Start Time</label>
                  <input
                    type="time"
                    className="w-full p-2 rounded-lg border"
                    style={inputStyles}
                    value={editSlotForm.startTime}
                    onChange={(e) => setEditSlotForm({...editSlotForm, startTime: e.target.value})}
                  />
                  {formErrors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.startTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>End Time</label>
                  <input
                    type="time"
                    className="w-full p-2 rounded-lg border"
                    style={inputStyles}
                    value={editSlotForm.endTime}
                    onChange={(e) => setEditSlotForm({...editSlotForm, endTime: e.target.value})}
                  />
                  {formErrors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>
                  )}
                </div>
                {formErrors.timeComparison && (
                  <div className="p-2 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                    {formErrors.timeComparison}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Price</label>
                  <input
                    type="number"
                    className="w-full p-2 rounded-lg border"
                    style={inputStyles}
                    value={editSlotForm.price}
                    onChange={(e) => setEditSlotForm({...editSlotForm, price: e.target.value})}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#111827' }}>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editSlotForm.isActive}
                      onChange={(e) => setEditSlotForm({...editSlotForm, isActive: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                    {editSlotForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditSlotModal(false)}
                    className="px-6 py-2 rounded-lg transition-colors"
                    style={buttonSecondaryStyles}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateSlot}
                    className="px-6 py-2 rounded-lg flex items-center gap-2"
                    style={buttonPrimaryStyles}
                  >
                    <FaCheck /> Update
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Bookings Modal */}
      <AnimatePresence>
        {showBookingsModal && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              style={cardStyles}
            >
              <div className="flex justify-between items-center border-b p-4" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
                  Bookings for {selectedSlot.timeSlot.startTime} - {selectedSlot.timeSlot.endTime}
                </h2>
                <button
                  onClick={() => setShowBookingsModal(false)}
                  style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                  className="hover:opacity-80"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#111827' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Time Slot:</p>
                    <p className="flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaClock /> {selectedSlot.timeSlot.startTime} - {selectedSlot.timeSlot.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Price:</p>
                    <p className="flex items-center gap-2" style={{ color: themeColors.text }}>
                      <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 rounded-full" />
                      {selectedSlot.timeSlot.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status:</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      selectedSlot.timeSlot.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSlot.timeSlot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: themeColors.text }}>
                  <FaUser /> Bookings ({selectedSlot.bookings.length})
                </h3>

                {selectedSlot.bookings.length === 0 ? (
                  <div className="text-center py-8 rounded-lg border-2 border-dashed" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>No bookings found for this time slot</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSlot.bookings.map((booking, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
                          borderColor: theme === 'light' ? '#e5e7eb' : '#374151'
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>User:</p>
                            <p style={{ color: themeColors.text }}>{booking.user.name}</p>
                            <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>{booking.user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Booking Date:</p>
                            <p className="text-sm" style={{ color: themeColors.text }}>{formatDate(booking.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status:</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
};

export default ViewSingleSeat;