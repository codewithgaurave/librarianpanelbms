import React, { useEffect, useState } from 'react';
import {
  FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaCheck,
  FaClock, FaToggleOn, FaToggleOff, FaTable, FaTh,
  FaCoins, FaChair, FaEye,
  FaInfoCircle,
  FaMinus,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import timeSlotAPI from '../apis/timeSlotAPI';
import seatAPI from '../apis/seatAPI';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const ManageTimeSlots = () => {
  const { theme, themeColors } = useTheme();
  const userData = useSelector((state) => state.auth.user);
  const user = userData?.user;
  const token = userData?.token;
  const libraryId = userData?.library?._id;

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

  const tableHeaderStyles = {
    backgroundColor: theme === 'light' ? '#f9fafb' : '#111827',
    color: theme === 'light' ? '#6b7280' : '#9ca3af',
  };

  const tableRowStyles = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
    borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
    hoverBackgroundColor: theme === 'light' ? '#f9fafb' : '#111827',
  };

  // State management
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    price: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'asc' });

  // Seat management state
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [currentTimeSlotId, setCurrentTimeSlotId] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [currentViewSlot, setCurrentViewSlot] = useState(null);

  // Fetch time slots
  useEffect(() => {
    if (token) {
      fetchTimeSlots();
    } else {
      toast.error('Authentication required');
    }
  }, [activeOnly, token]);

  // Fetch all seats when seat modal opens
  useEffect(() => {
    if (showSeatModal && token && libraryId) {
      fetchAllSeats();
    }
  }, [showSeatModal, token, libraryId]);

  // Filter and sort time slots
  useEffect(() => {
    let filtered = [...timeSlots];

    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.endTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.price.toString().includes(searchTerm)
      );
    }

    if (activeOnly) {
      filtered = filtered.filter(slot => slot.isActive);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSlots(filtered);
  }, [searchTerm, timeSlots, activeOnly, sortConfig]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const res = await timeSlotAPI.getAllTimeSlotsByLibrary(libraryId, token);
      setTimeSlots(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch time slots');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSeats = async () => {
    try {
      setLoadingSeats(true);
      const res = await seatAPI.getSeatsByLibrary(libraryId, token);
      setSeats(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch seats');
      console.error('Fetch seats error:', err);
    } finally {
      setLoadingSeats(false);
    }
  };

  const validateTimeSlot = () => {
    const errors = {};
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!formData.startTime) errors.startTime = 'Start time is required';
    else if (!timeRegex.test(formData.startTime)) errors.startTime = 'Invalid time format (HH:MM)';

    if (!formData.endTime) errors.endTime = 'End time is required';
    else if (!timeRegex.test(formData.endTime)) errors.endTime = 'Invalid time format (HH:MM)';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.timeComparison = 'End time must be after start time';
    }

    if (!formData.price) errors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Event Handlers
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateTimeSlot() || !token) return;

    try {
      if (editMode) {
        await timeSlotAPI.updateTimeSlot(currentId, formData, token);
        toast.success('Time slot updated successfully');
      } else {
        await timeSlotAPI.createTimeSlot(formData, token);
        toast.success('Time slot created successfully');
      }
      fetchTimeSlots();
      resetForm();
      setShowModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Operation failed';
      toast.error(`Error: ${errorMsg}`);
      console.error('Submit error:', err);
    }
  };

  const handleEdit = slot => {
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      isActive: slot.isActive
    });
    setEditMode(true);
    setCurrentId(slot._id);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!token) return;

    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await timeSlotAPI.deleteTimeSlot(id, token);
        toast.success('Time slot deleted successfully');
        fetchTimeSlots();
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Delete failed';
        toast.error(`Error: ${errorMsg}`);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    if (!token) return;

    try {
      await timeSlotAPI.toggleTimeSlotStatus(id, token);
      toast.success(`Time slot ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchTimeSlots();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Status update failed';
      toast.error(`Error: ${errorMsg}`);
    }
  };

  // Seat management handlers
  // Track assigned seats for the current slot
  const [currentSlotAssignedSeats, setCurrentSlotAssignedSeats] = useState([]);
  const handleManageSeats = (timeSlotId, currentSeats = []) => {
    setCurrentTimeSlotId(timeSlotId);
    const assignedSeatIds = currentSeats.map(seat => seat._id || seat);
    setSelectedSeats(assignedSeatIds);
    setCurrentSlotAssignedSeats(assignedSeatIds);
    setShowSeatModal(true);
  };

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  // Accept seatIds as second argument
  const handleSeatSubmit = async (action, seatIds) => {
    if (!currentTimeSlotId || !token) return;
    try {
      if (action === 'add') {
        await timeSlotAPI.addSeatsToTimeSlot(currentTimeSlotId, seatIds, token);
        toast.success('Seats added to time slot successfully');
      } else if (action === 'remove') {
        await timeSlotAPI.removeSeatsFromTimeSlot(currentTimeSlotId, seatIds, token);
        toast.success('Seats removed from time slot successfully');
      }
      fetchTimeSlots();
      setShowSeatModal(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Seat operation failed';
      toast.error(`Error: ${errorMsg}`);
      console.error('Seat operation error:', err);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetForm = () => {
    setFormData({ startTime: '', endTime: '', price: '', isActive: true });
    setFormErrors({});
    setEditMode(false);
    setCurrentId(null);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleViewDetails = (slot) => {
    setCurrentViewSlot(slot);
    setViewDetailsModal(true);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={containerStyles}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: themeColors.text }}>
            Time Slots Management
          </h1>
          <p style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            Manage available booking time slots
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={buttonSecondaryStyles}
          >
            {viewMode === 'grid' ? <FaTable /> : <FaTh />}
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-6 py-2 rounded-lg flex items-center gap-2 shadow-md"
            style={buttonPrimaryStyles}
          >
            <FaPlus /> Add New Slot
          </motion.button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-md border border-gray-200 rounded-lg">
          <div className="absolute left-3 top-3.5" style={{ color: theme === 'light' ? '#9ca3af' : '#6b7280' }}>
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search slots by time or price..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-3 rounded-lg focus:ring-2 text-sm"
            style={{
              ...inputStyles,
              focusRingColor: themeColors.primary
            }}
          />
        </div>
        <label className="inline-flex items-center cursor-pointer self-center">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={() => setActiveOnly(!activeOnly)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 peer-focus:outline-none rounded-full peer"
            style={{
              backgroundColor: activeOnly ? themeColors.primary : (theme === 'light' ? '#e5e7eb' : '#4b5563')
            }}>
            <div className="absolute top-[2px] start-[2px] bg-white border rounded-full h-5 w-5 transition-all"
              style={{
                transform: activeOnly ? 'translateX(1.25rem)' : 'translateX(0)',
                borderColor: theme === 'light' ? '#d1d5db' : '#4b5563'
              }}>
            </div>
          </div>
          <span className="ms-3 text-sm font-medium" style={{ color: themeColors.text }}>
            Active Only
          </span>
        </label>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 rounded-full"
            style={{
              borderColor: themeColors.primary,
              borderTopColor: 'transparent'
            }}
          ></motion.div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSlots.length > 0 ? (
filteredSlots.map(slot => (
  <motion.div
    key={slot._id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border`}
    style={{
      backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
      borderColor: slot.isActive 
        ? (theme === 'light' ? '#10b981' : '#059669')
        : (theme === 'light' ? '#ef4444' : '#dc2626')
    }}
  >
    {/* Status Indicator Bar */}
    <div 
      className="absolute top-0 left-0 right-0 h-1"
      style={{
        backgroundColor: slot.isActive ? themeColors.accent : '#ef4444'
      }}
    />
    
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-lg"
            style={{
              backgroundColor: slot.isActive 
                ? (theme === 'light' ? themeColors.softCream || '#f8eabc' : themeColors.hover.background)
                : (theme === 'light' ? '#fee2e2' : '#451a1a'),
              color: slot.isActive ? themeColors.primary : '#ef4444'
            }}
          >
            <FaClock className="text-sm" />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: themeColors.text }}>
            Time Slot
          </h3>
        </div>
        
        <div 
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: slot.isActive 
              ? (theme === 'light' ? '#ecfdf5' : '#022c22')
              : (theme === 'light' ? '#fef2f2' : '#2d1b1b'),
            color: slot.isActive 
              ? (theme === 'light' ? '#059669' : '#10b981')
              : (theme === 'light' ? '#dc2626' : '#f87171'),
            borderColor: slot.isActive 
              ? (theme === 'light' ? '#a7f3d0' : '#047857')
              : (theme === 'light' ? '#fecaca' : '#991b1b')
          }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: slot.isActive 
                ? (theme === 'light' ? '#10b981' : '#34d399')
                : (theme === 'light' ? '#ef4444' : '#f87171')
            }}
          />
          {slot.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Time Display */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div 
          className="text-center p-2 rounded-lg"
          style={{
            backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background
          }}
        >
          <p 
            className="text-xs font-medium"
            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
          >
            Start
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: themeColors.text }}>
            {slot.startTime}
          </p>
        </div>
        <div 
          className="text-center p-2 rounded-lg"
          style={{
            backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background
          }}
        >
          <p 
            className="text-xs font-medium"
            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
          >
            End
          </p>
          <p className="font-bold text-sm mt-0.5" style={{ color: themeColors.text }}>
            {slot.endTime}
          </p>
        </div>
      </div>

      {/* Price & Seats Row */}
      <div 
        className="flex items-center justify-between mb-4 p-2 rounded-lg"
        style={{
          backgroundColor: theme === 'light' 
            ? 'rgba(248, 234, 188, 0.3)' // softCream with opacity
            : 'rgba(44, 48, 52, 0.5)'
        }}
      >
        <div className="flex items-center gap-2">
          <img 
            src='/img/bms_coin.jpg' 
            alt='bms_coin' 
            className="w-5 h-5 rounded-full ring-2 shadow-sm" 
            style={{ ringColor: themeColors.accent }}
          />
          <span className="font-bold text-sm" style={{ color: themeColors.primary }}>
            {slot.price}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-sm" style={{ color: themeColors.text }}>
          <FaChair className="text-xs opacity-70" />
          <span className="font-medium">{slot.seats?.length || 0}</span>
          <span className="text-xs opacity-70">seats</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        {/* Toggle Status Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleStatus(slot._id, slot.isActive)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
          style={{
            backgroundColor: slot.isActive
              ? (theme === 'light' ? '#fef3c7' : '#451a03')
              : (theme === 'light' ? '#ecfdf5' : '#022c22'),
            color: slot.isActive
              ? (theme === 'light' ? '#92400e' : '#fbbf24')
              : (theme === 'light' ? '#059669' : '#34d399'),
            borderColor: slot.isActive
              ? (theme === 'light' ? '#fde68a' : '#78350f')
              : (theme === 'light' ? '#a7f3d0' : '#047857')
          }}
        >
          {slot.isActive ? (
            <>
              <FaToggleOff className="text-sm" />
              Deactivate
            </>
          ) : (
            <>
              <FaToggleOn className="text-sm" />
              Activate
            </>
          )}
        </motion.button>

        {/* Action Icons */}
        <div className="flex items-center gap-0.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManageSeats(slot._id, slot.seats)}
            className="p-2 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
            style={{ 
              color: themeColors.primary,
              ':hover': {
                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? themeColors.hover.background : themeColors.hover.background;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Manage Seats"
          >
            <FaChair className="text-sm" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleViewDetails(slot)}
            className="p-2 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
            style={{ color: themeColors.accent }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? themeColors.hover.background : themeColors.hover.background;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="View Details"
          >
            <FaEye className="text-sm" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEdit(slot)}
            className="p-2 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
            style={{ color: themeColors.primary }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? themeColors.hover.background : themeColors.hover.background;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Edit"
          >
            <FaEdit className="text-sm" />
          </motion.button>
          
          {/* <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(slot._id)}
            className="p-2 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? '#fee2e2' : '#451a1a';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Delete"
          >
            <FaTrash className="text-sm" />
          </motion.button> */}
        </div>
      </div>
    </div>
  </motion.div>
))
          ) : (
            <div className="col-span-full text-center py-10" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
              No time slots found {searchTerm && `matching "${searchTerm}"`}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: tableRowStyles.borderColor }}>
          <table className="min-w-full divide-y" style={{ borderColor: tableRowStyles.borderColor }}>
            <thead style={tableHeaderStyles}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('startTime')}
                >
                  <div className="flex items-center gap-1">
                    Start Time {getSortIndicator('startTime')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('endTime')}
                >
                  <div className="flex items-center gap-1">
                    End Time {getSortIndicator('endTime')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Price (<img src='/img/bms_coin.jpg' alt='bms_coin' className="w-6 h-6 rounded-full" />) {getSortIndicator('price')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: tableRowStyles.borderColor }}>
              {filteredSlots.length > 0 ? (
                filteredSlots.map(slot => (
                  <motion.tr
                    key={slot._id}
                    style={{
                      backgroundColor: tableRowStyles.backgroundColor,
                      borderColor: tableRowStyles.borderColor
                    }}
                    className="hover:bg-opacity-90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: themeColors.text }}>
                      <div className="flex items-center gap-2">
                        <FaClock style={{ color: themeColors.primary }} />
                        {slot.startTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                      <div className="flex items-center gap-2">
                        <FaClock style={{ color: themeColors.primary }} />
                        {slot.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center justify-start gap-2" style={{ color: themeColors.text }}>
                      <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-8 h-8 rounded-full" />{slot.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                      <button
                        onClick={() => handleManageSeats(slot._id, slot.seats)}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: theme === 'light' ? '#f0f9ff' : '#1e3a8a',
                          color: theme === 'light' ? '#0369a1' : '#93c5fd'
                        }}
                      >
                        <FaChair /> {slot.seats?.length || 0} seats
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(slot._id, slot.isActive)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewDetails(slot)}
                          style={{ color: themeColors.secondary || '#3b82f6' }}
                          className="hover:opacity-80"
                          title="View Details"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(slot)}
                          style={{ color: themeColors.primary }}
                          className="hover:opacity-80"
                          title="Edit"
                        >
                          <FaEdit />
                        </motion.button>
                        {/* <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(slot._id)}
                          style={{ color: '#ef4444' }}
                          className="hover:opacity-80"
                          title="Delete"
                        >
                          <FaTrash />
                        </motion.button> */}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    No time slots found {searchTerm && `matching "${searchTerm}"`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

{/* Add/Edit Time Slot Modal */}
<AnimatePresence>
  {showModal && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
        }}
      >
        {/* Header with gradient */}
        <div 
          className="flex justify-between items-center p-4 border-b relative"
          style={{ 
            borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
            background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.accent}15)`
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                color: themeColors.primary
              }}
            >
              {editMode ? <FaEdit className="text-lg" /> : <FaPlus className="text-lg" />}
            </div>
            <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
              {editMode ? 'Edit Time Slot' : 'Add New Time Slot'}
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowModal(false)}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ 
              color: theme === 'light' ? '#6b7280' : '#9ca3af',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <FaTimes className="text-lg" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Start Time Field */}
          <div>
            <label 
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              htmlFor="startTime" 
              style={{ color: themeColors.text }}
            >
              <FaClock className="text-xs" style={{ color: themeColors.primary }} />
              Start Time (HH:MM)
            </label>
            <div className="relative">
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-opacity-50 text-sm transition-all duration-200 ${
                  formErrors.startTime ? 'border-red-500 focus:border-red-500' : 'focus:border-opacity-0'
                }`}
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  color: themeColors.text,
                  borderColor: formErrors.startTime 
                    ? '#ef4444' 
                    : (theme === 'light' ? '#d1d5db' : '#4b5563'),
                  focusRingColor: themeColors.primary
                }}
                required
              />
            </div>
            {formErrors.startTime && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <FaExclamationCircle className="text-xs" />
                {formErrors.startTime}
              </motion.p>
            )}
          </div>

          {/* End Time Field */}
          <div>
            <label 
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              htmlFor="endTime" 
              style={{ color: themeColors.text }}
            >
              <FaClock className="text-xs" style={{ color: themeColors.primary }} />
              End Time (HH:MM)
            </label>
            <div className="relative">
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-opacity-50 text-sm transition-all duration-200 ${
                  formErrors.endTime ? 'border-red-500 focus:border-red-500' : 'focus:border-opacity-0'
                }`}
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  color: themeColors.text,
                  borderColor: formErrors.endTime 
                    ? '#ef4444' 
                    : (theme === 'light' ? '#d1d5db' : '#4b5563'),
                  focusRingColor: themeColors.primary
                }}
                required
              />
            </div>
            {formErrors.endTime && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <FaExclamationCircle className="text-xs" />
                {formErrors.endTime}
              </motion.p>
            )}
          </div>

          {/* Time Comparison Error */}
          {formErrors.timeComparison && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg flex items-center gap-2 text-sm border"
              style={{ 
                backgroundColor: theme === 'light' ? '#fef2f2' : '#451a1a',
                color: '#ef4444',
                borderColor: theme === 'light' ? '#fecaca' : '#991b1b'
              }}
            >
              <FaExclamationTriangle className="text-sm flex-shrink-0" />
              {formErrors.timeComparison}
            </motion.div>
          )}

          {/* Price Field */}
          <div>
            <label 
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              htmlFor="price" 
              style={{ color: themeColors.text }}
            >
              <img 
                src='/img/bms_coin.jpg' 
                alt='bms_coin' 
                className="w-4 h-4 rounded-full" 
              />
              Price
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                className={`w-full p-3 rounded-lg border-2 focus:ring-2 focus:ring-opacity-50 text-sm transition-all duration-200 ${
                  formErrors.price ? 'border-red-500 focus:border-red-500' : 'focus:border-opacity-0'
                }`}
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : '#374151',
                  color: themeColors.text,
                  borderColor: formErrors.price 
                    ? '#ef4444' 
                    : (theme === 'light' ? '#d1d5db' : '#4b5563'),
                  focusRingColor: themeColors.primary
                }}
                required
              />
            </div>
            {formErrors.price && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <FaExclamationCircle className="text-xs" />
                {formErrors.price}
              </motion.p>
            )}
          </div>

          {/* Active Status Toggle (Edit Mode Only) */}
          {editMode && (
            <div 
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                borderColor: theme === 'light' ? '#e5e7eb' : '#374151'
              }}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only"
                  />
                  <div 
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                      formData.isActive ? 'justify-end' : 'justify-start'
                    } flex`}
                    style={{
                      backgroundColor: formData.isActive ? themeColors.primary : (theme === 'light' ? '#d1d5db' : '#4b5563')
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      // style={{
                      //   transform: formData.isActive ? 'translateX()' : 'translateX()'
                      // }}
                    />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-sm" style={{ color: themeColors.text }}>
                    Active Slot
                  </span>
                  <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    {formData.isActive ? 'Slot is currently active' : 'Slot is currently inactive'}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
            <motion.button
              type="button"
              onClick={() => setShowModal(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center gap-2"
              style={{
                backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
                color: theme === 'light' ? '#374151' : '#f3f4f6',
                border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme === 'light' ? '#e5e7eb' : '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
              }}
            >
              <FaTimes className="text-sm" />
              Cancel
            </motion.button>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
              style={{
                backgroundColor: themeColors.primary,
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme === 'light' ? '#e6850a' : '#f59e0b';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = themeColors.primary;
              }}
            >
              {editMode ? (
                <>
                  <FaCheck className="text-sm" />
                  Update Slot
                </>
              ) : (
                <>
                  <FaPlus className="text-sm" />
                  Create Slot
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


{/* Seat Management Modal */}
<AnimatePresence>
  {showSeatModal && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
          border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
        }}
      >
        {/* Header with gradient */}
        <div 
          className="flex justify-between items-center p-4 border-b relative"
          style={{ 
            borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
            background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.accent}15)`
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                color: themeColors.primary
              }}
            >
              <FaChair className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
                Manage Seats
              </h2>
              <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                Assign seats to this time slot
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSeatModal(false)}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ 
              color: theme === 'light' ? '#6b7280' : '#9ca3af',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <FaTimes className="text-lg" />
          </motion.button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {loadingSeats ? (
            <div className="flex flex-col justify-center items-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 rounded-full mb-4"
                style={{
                  borderColor: `${themeColors.primary}30`,
                  borderTopColor: themeColors.primary
                }}
              />
              <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                Loading seats...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selection Counter */}
              <div 
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{
                  backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                  borderColor: theme === 'light' ? '#e5e7eb' : '#374151'
                }}
              >
                <div className="flex items-center gap-2">
                  <FaChair style={{ color: themeColors.primary }} />
                  <span className="font-medium text-sm" style={{ color: themeColors.text }}>
                    Available Seats
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: theme === 'light' ? themeColors.primary + '20' : themeColors.primary + '30',
                      color: themeColors.primary
                    }}
                  >
                    {selectedSeats.length} selected
                  </span>
                  <span className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    of {seats.length} total
                  </span>
                </div>
              </div>

              {/* Seats Grid */}
              {seats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {seats.map(seat => (
                    seat.seatFor === "daily-booking" && (
                    <motion.div
                      key={seat._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative cursor-pointer transition-all duration-200 rounded-lg border-2 overflow-hidden"
                      style={{
                        borderColor: selectedSeats.includes(seat._id)
                          ? themeColors.primary
                          : (theme === 'light' ? '#e5e7eb' : '#374151'),
                        backgroundColor: selectedSeats.includes(seat._id)
                          ? (theme === 'light' ? themeColors.primary + '10' : themeColors.primary + '20')
                          : (theme === 'light' ? '#ffffff' : '#1f2937'),
                      }}
                      onClick={() => toggleSeatSelection(seat._id)}
                    >
                      {/* Selection indicator bar */}
                      {selectedSeats.includes(seat._id) && (
                        <div 
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: themeColors.primary }}
                        />
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                backgroundColor: selectedSeats.includes(seat._id)
                                  ? themeColors.primary
                                  : (theme === 'light' ? themeColors.hover.background : themeColors.hover.background),
                                color: selectedSeats.includes(seat._id)
                                  ? '#ffffff'
                                  : themeColors.primary
                              }}
                            >
                              <FaChair className="text-sm" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: themeColors.text }}>
                                {seat.seatNumber}
                              </p>
                              <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                {seat.seatName}
                              </p>
                            </div>
                          </div>
                          
                          {/* Custom Checkbox */}
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedSeats.includes(seat._id)}
                              onChange={() => toggleSeatSelection(seat._id)}
                              className="sr-only"
                            />
                            <div 
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedSeats.includes(seat._id) ? 'scale-110' : ''
                              }`}
                              style={{
                                borderColor: selectedSeats.includes(seat._id) 
                                  ? themeColors.primary 
                                  : (theme === 'light' ? '#d1d5db' : '#4b5563'),
                                backgroundColor: selectedSeats.includes(seat._id) 
                                  ? themeColors.primary 
                                  : 'transparent'
                              }}
                            >
                              {selectedSeats.includes(seat._id) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <FaCheck className="text-xs text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    )
                  ))}
                </div>
              ) : (
                <div 
                  className="text-center py-12 rounded-lg border-2 border-dashed"
                  style={{ 
                    borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                    backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
                  }}
                >
                  <FaChair 
                    className="text-4xl mb-3 mx-auto"
                    style={{ color: theme === 'light' ? '#d1d5db' : '#4b5563' }}
                  />
                  <p className="font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    No seats available
                  </p>
                  <p className="text-sm mt-1" style={{ color: theme === 'light' ? '#9ca3af' : '#6b7280' }}>
                    Add seats to your library to manage them here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div 
          className="flex justify-between items-center p-4 border-t bg-opacity-50"
          style={{ 
            borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
            backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
          }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
            <FaInfoCircle className="text-xs" />
            Click seats to select/deselect them
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Remove: Only remove seats that were previously assigned and are now deselected
                const toRemove = currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id));
                handleSeatSubmit('remove', toRemove);
              }}
              className="px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 border"
              style={{
                backgroundColor: (currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length === 0)
                  ? (theme === 'light' ? '#f3f4f6' : '#374151')
                  : (theme === 'light' ? '#fee2e2' : '#451a1a'),
                color: (currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length === 0)
                  ? (theme === 'light' ? '#9ca3af' : '#6b7280')
                  : '#ef4444',
                borderColor: (currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length === 0)
                  ? (theme === 'light' ? '#d1d5db' : '#4b5563')
                  : '#ef4444',
                opacity: (currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length === 0) ? 0.5 : 1,
                cursor: (currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length === 0) ? 'not-allowed' : 'pointer'
              }}
              disabled={currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length === 0}
            >
              <FaMinus className="text-sm" />
              Remove ({currentSlotAssignedSeats.filter(id => !selectedSeats.includes(id)).length})
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Save Changes: Only add seats that are selected but not already assigned
                const toAdd = selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id));
                handleSeatSubmit('add', toAdd);
              }}
              className="px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all duration-200"
              style={{
                backgroundColor: (selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length === 0) ? '#9ca3af' : themeColors.primary,
                color: '#ffffff',
                opacity: (selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length === 0) ? 0.5 : 1,
                cursor: (selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length === 0) ? 'not-allowed' : 'pointer'
              }}
              disabled={selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length === 0}
              onMouseEnter={(e) => {
                if (selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length > 0) {
                  e.target.style.backgroundColor = theme === 'light' ? '#e6850a' : '#f59e0b';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length > 0) {
                  e.target.style.backgroundColor = themeColors.primary;
                }
              }}
            >
              <FaCheck className="text-sm" />
              Save Changes ({selectedSeats.filter(id => !currentSlotAssignedSeats.includes(id)).length})
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetailsModal && currentViewSlot && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={cardStyles}
            >
              <div className="flex justify-between items-center border-b p-4" style={{ borderColor: tableRowStyles.borderColor }}>
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
                  Time Slot Details
                </h2>
                <button
                  onClick={() => setViewDetailsModal(false)}
                  style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                  className="hover:opacity-80"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Start Time</p>
                    <p className="font-medium flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaClock /> {currentViewSlot.startTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>End Time</p>
                    <p className="font-medium flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaClock /> {currentViewSlot.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Price</p>
                    <p className="font-medium flex items-center gap-2" style={{ color: themeColors.text }}>
                      <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 rounded-full" /> {currentViewSlot.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status</p>
                    <p className={`font-medium ${currentViewSlot.isActive ? 'text-green-500' : 'text-red-500'}`}>
                      {currentViewSlot.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-bold mb-2" style={{ color: themeColors.text }}>
                    Assigned Seats ({currentViewSlot.seats?.length || 0})
                  </p>
                  {currentViewSlot.seats?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {currentViewSlot.seats.map(seat => (
                        <div
                          key={seat._id}
                          className="p-2 rounded border flex items-center gap-2"
                          style={{
                            borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
                            backgroundColor: theme === 'light' ? '#f9fafb' : '#111827'
                          }}
                        >
                          <FaChair className="text-sm" />
                          <span style={{ color: themeColors.text }}>{seat.seatNumber} - {seat.seatName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                      No seats assigned to this time slot
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    onClick={() => setViewDetailsModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-lg transition-colors"
                    style={buttonSecondaryStyles}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ManageTimeSlots;