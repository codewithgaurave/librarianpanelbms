import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FiPlus,
    FiSearch,
    FiFilter,
    FiEdit3,
    FiTrash2,
    FiToggleLeft,
    FiToggleRight,
    FiUsers,
    FiCheckCircle,
    FiXCircle,
    FiGrid,
    FiList,
    FiDownload,
    FiUpload,
    FiEye,
    FiCalendar,
    FiClock
} from 'react-icons/fi';
import seatAPI from '../apis/seatAPI';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ManageSeats = () => {
    const { theme, themeColors } = useTheme();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.user);
    const user = userData.user;
    const token = userData.token;
    const libraryId = userData?.library?._id;
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSeatFor, setFilterSeatFor] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingSeat, setEditingSeat] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [seatsPerPage] = useState(12);
    const [seatForm, setSeatForm] = useState({
        seatNumber: '',
        seatName: '',
        isActive: true,
        seatFor: 'daily-booking'
    });
    const [bulkSeats, setBulkSeats] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        dailyBooking: 0,
        monthlyBooking: 0
    });

    const seatForOptions = [
        { value: 'daily-booking', label: 'Daily Booking', icon: FiClock },
        { value: 'monthly-booking', label: 'Monthly Booking', icon: FiCalendar }
    ];

    useEffect(() => {
        fetchSeats();
    }, [libraryId]);

    useEffect(() => {
        calculateStats();
    }, [seats]);

    const fetchSeats = async () => {
        try {
            setLoading(true);
            const response = await seatAPI.getSeatsByLibrary(libraryId, token);
            setSeats(response.data);
        } catch (error) {
            console.error('Error fetching seats:', error);
            toast.error('Failed to fetch seats');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const total = seats.length;
        const active = seats.filter(seat => seat.isActive).length;
        const inactive = total - active;
        const dailyBooking = seats.filter(seat => seat.seatFor === 'daily-booking').length;
        const monthlyBooking = seats.filter(seat => seat.seatFor === 'monthly-booking').length;

        setStats({ total, active, inactive, dailyBooking, monthlyBooking });
    };

    const handleAddSeat = async () => {
        if (!seatForm.seatNumber.trim()) {
            toast.error('Seat number is required');
            return;
        }

        try {
            setIsSubmitting(true);
            const seatData = {
                library: libraryId,
                ...seatForm
            };

            const response = await seatAPI.createSeat(seatData, token);
            setSeats([...seats, response.data]);
            setSeatForm({ seatNumber: '', seatName: '', isActive: true, seatFor: 'daily-booking' });
            setShowAddModal(false);
            toast.success('Seat added successfully!');
            fetchSeats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add seat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkAdd = async () => {
        if (!bulkSeats.trim()) {
            toast.error('Please enter seat data');
            return;
        }

        try {
            setIsSubmitting(true);
            const lines = bulkSeats.trim().split('\n');
            const seatsArray = [];

            for (let line of lines) {
                const parts = line.trim().split(',');
                if (parts.length >= 1) {
                    seatsArray.push({
                        seatNumber: parts[0].trim(),
                        seatName: parts[1]?.trim() || parts[0].trim(),
                        seatFor: parts[2]?.trim() || 'daily-booking',
                        isActive: true
                    });
                }
            }

            if (seatsArray.length === 0) {
                toast.error('No valid seat data found');
                return;
            }

            const response = await seatAPI.bulkCreateSeats({
                library: libraryId,
                seats: seatsArray
            }, token);

            setSeats([...seats, ...response.data]);
            setBulkSeats('');
            setShowBulkModal(false);
            toast.success(`${response.data.length} seats added successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add seats');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSeat = async () => {
        if (!editingSeat || !seatForm.seatNumber.trim()) {
            toast.error('Seat number is required');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await seatAPI.updateSeat(editingSeat._id, seatForm, token);
            setSeats(seats.map(seat =>
                seat._id === editingSeat._id ? response.data : seat
            ));
            setEditingSeat(null);
            setSeatForm({ seatNumber: '', seatName: '', isActive: true, seatFor: 'daily-booking' });
            toast.success('Seat updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update seat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (seatId) => {
        try {
            const response = await seatAPI.toggleSeatStatus(seatId, token);
            setSeats(seats.map(seat =>
                seat._id === seatId ? response.data : seat
            ));
            toast.success('Seat status updated successfully!');
        } catch (error) {
            toast.error('Failed to update seat status');
        }
    };

    const handleDeleteSeat = async (seatId) => {
        if (!window.confirm('Are you sure you want to delete this seat?')) {
            return;
        }
        try {
            await seatAPI.deleteSeat(seatId, token);
            setSeats(seats.filter(seat => seat._id !== seatId));
            toast.success('Seat deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete seat');
        }
    };

    const openEditModal = (seat) => {
        setEditingSeat(seat);
        setSeatForm({
            seatNumber: seat.seatNumber,
            seatName: seat.seatName,
            isActive: seat.isActive,
            seatFor: seat.seatFor || 'daily-booking'
        });
    };

    const closeEditModal = () => {
        setEditingSeat(null);
        setSeatForm({ seatNumber: '', seatName: '', isActive: true, seatFor: 'daily-booking' });
    };

    const getSeatForLabel = (seatFor) => {
        const option = seatForOptions.find(opt => opt.value === seatFor);
        return option ? option.label : 'Daily Booking';
    };

    const getSeatForIcon = (seatFor) => {
        const option = seatForOptions.find(opt => opt.value === seatFor);
        return option ? option.icon : FiClock;
    };

    const filteredSeats = seats.filter(seat => {
        const matchesSearch =
            seat.seatNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
            seat.seatName?.toLowerCase().includes(searchTerm?.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && seat.isActive) ||
            (filterStatus === 'inactive' && !seat.isActive);

        const matchesSeatFor =
            filterSeatFor === 'all' ||
            seat.seatFor === filterSeatFor;

        return matchesSearch && matchesFilter && matchesSeatFor;
    });

    const indexOfLastSeat = currentPage * seatsPerPage;
    const indexOfFirstSeat = indexOfLastSeat - seatsPerPage;
    const currentSeats = filteredSeats.slice(indexOfFirstSeat, indexOfLastSeat);
    const totalPages = Math.ceil(filteredSeats.length / seatsPerPage);

    if (loading) {
        return (
            <div
                className="flex justify-center items-center min-h-[80vh]"
                style={{ backgroundColor: themeColors.background }}
            >
                <div
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                    style={{ borderColor: themeColors.primary }}
                ></div>
            </div>
        );
    }

    return (
        <div
            className="p-4 md:p-6 space-y-6"
            style={{ backgroundColor: themeColors.background }}
        >
            {/* Header */}
            <div
                className="rounded-lg shadow-md p-6"
                style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                }}
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 style={{ color: themeColors.text }} className="text-2xl font-bold">Manage Seats</h1>
                        <p style={{ color: themeColors.text }} className="mt-1">Organize and manage library seating arrangements</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                            style={{
                                backgroundColor: themeColors.primary,
                                color: themeColors.lightText || '#ffffff'
                            }}
                        >
                            <FiPlus className="mr-2" />
                            Add Seat
                        </button>

                        {/* <button
                            onClick={() => setShowBulkModal(true)}
                            className="flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                            style={{
                                backgroundColor: theme === 'light' ? '#10b981' : '#059669',
                                color: '#ffffff'
                            }}
                        >
                            <FiUpload className="mr-2" />
                            Bulk Add
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                    className="p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                            : 'linear-gradient(to right, #1e40af, #1e3a8a)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Total Seats</h3>
                            <p className="text-2xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <FiUsers className="text-3xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #10b981, #059669)'
                            : 'linear-gradient(to right, #065f46, #064e3b)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Active Seats</h3>
                            <p className="text-2xl font-bold mt-1">{stats.active}</p>
                        </div>
                        <FiCheckCircle className="text-3xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #ef4444, #dc2626)'
                            : 'linear-gradient(to right, #991b1b, #7f1d1d)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Inactive Seats</h3>
                            <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
                        </div>
                        <FiXCircle className="text-3xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #f59e0b, #d97706)'
                            : 'linear-gradient(to right, #92400e, #78350f)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Daily Booking</h3>
                            <p className="text-2xl font-bold mt-1">{stats.dailyBooking}</p>
                        </div>
                        <FiClock className="text-3xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #8b5cf6, #7c3aed)'
                            : 'linear-gradient(to right, #5b21b6, #4c1d95)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold">Monthly Booking</h3>
                            <p className="text-2xl font-bold mt-1">{stats.monthlyBooking}</p>
                        </div>
                        <FiCalendar className="text-3xl opacity-80" />
                    </div>
                </div>
            </div>

            <div
                className="
    rounded-lg shadow-md p-6 w-full
    max-w-full sm:max-w-2xl md:max-w-full
  "
                style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                }}
            >
                <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
                    {/* 🔍 Search Box */}
                    <div className="relative flex-1 w-full md:w-1/2 min-h-[48px]">
                        <FiSearch
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: themeColors.text }}
                        />
                        <input
                            type="text"
                            placeholder="Search seats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:border-transparent h-full"
                            style={{
                                backgroundColor: themeColors.background,
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                color: themeColors.text,
                            }}
                        />
                    </div>

                    {/* 🎛 Filters */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-1/2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent flex-1 min-h-[44px]"
                            style={{
                                backgroundColor: themeColors.background,
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                color: themeColors.text,
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>

                        <select
                            value={filterSeatFor}
                            onChange={(e) => setFilterSeatFor(e.target.value)}
                            className="px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent flex-1 min-h-[44px]"
                            style={{
                                backgroundColor: themeColors.background,
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                color: themeColors.text,
                            }}
                        >
                            <option value="all">All Booking Types</option>
                            <option value="daily-booking">Daily Booking</option>
                            <option value="monthly-booking">Monthly Booking</option>
                        </select>

                        {/* 🔲 View Mode Buttons */}
                        <div
                            className="flex rounded-lg overflow-hidden flex-1 min-h-[44px] justify-center"
                            style={{
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                            }}
                        >
                            <button
                                onClick={() => setViewMode("grid")}
                                className="p-2 transition-colors w-1/2"
                                style={
                                    viewMode === "grid"
                                        ? { backgroundColor: themeColors.primary, color: themeColors.lightText }
                                        : { backgroundColor: themeColors.background, color: themeColors.text }
                                }
                            >
                                <FiGrid />
                            </button>

                            <button
                                onClick={() => setViewMode("list")}
                                className="p-2 transition-colors w-1/2"
                                style={
                                    viewMode === "list"
                                        ? { backgroundColor: themeColors.primary, color: themeColors.lightText || "#ffffff" }
                                        : { backgroundColor: themeColors.background, color: themeColors.text }
                                }
                            >
                                <FiList />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seats Display */}
            <div
                className="rounded-lg shadow-md p-6"
                style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                }}
            >
                {currentSeats.length === 0 ? (
                    <div className="text-center py-12">
                        <FiUsers
                            className="mx-auto text-6xl mb-4"
                            style={{ color: theme === 'light' ? '#d1d5db' : '#4b5563' }}
                        />
                        <h3 style={{ color: themeColors.text }} className="text-xl font-semibold mb-2">No Seats Found</h3>
                        <p style={{ color: themeColors.text }}>Add your first seat to get started</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {currentSeats.map((seat) => {
                                    const SeatForIcon = getSeatForIcon(seat.seatFor);
                                    return (
                                        <div
                                            key={seat._id}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${seat.isActive
                                                ? 'border-green-200 bg-green-50 shadow-green-100'
                                                : 'border-red-200 bg-red-50 shadow-red-100'
                                                } shadow-md hover:shadow-lg`}
                                            style={{
                                                backgroundColor: theme === 'light' ?
                                                    (seat.isActive ? '#f0fdf4' : '#fef2f2') :
                                                    (seat.isActive ? '#1a2e05' : '#2c0505')
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-2 ${seat.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    <span style={{ color: themeColors.text }} className="font-semibold">#{seat.seatNumber}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {seat?.seatFor === "monthly-booking" ? (

                                                        <button
                                                            onClick={() => navigate(`/dashboard/view-seat/${seat._id}/monthly-booking-type`)}
                                                            className="p-1 transition-colors hover:opacity-80"
                                                            style={{ color: themeColors.primary }}
                                                            title="View details"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                    ) : (

                                                        <button
                                                            onClick={() => navigate(`/dashboard/view-seat/${seat._id}`)}
                                                            className="p-1 transition-colors hover:opacity-80"
                                                            style={{ color: themeColors.primary }}
                                                            title="View details"
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEditModal(seat)}
                                                        className="p-1 transition-colors hover:opacity-80"
                                                        style={{ color: themeColors.primary }}
                                                        title="Edit seat"
                                                    >
                                                        <FiEdit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(seat._id)}
                                                        className="p-1 transition-colors hover:opacity-80"
                                                        style={{ color: seat.isActive ? themeColors.accent : themeColors.primary }}
                                                        title={seat.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {seat.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleDeleteSeat(seat._id)}
                                                        className="p-1 transition-colors hover:opacity-80"
                                                        style={{ color: themeColors.primary }}
                                                        title="Delete seat"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button> */}
                                                </div>
                                            </div>

                                            <div className="flex flex-col [@media(min-width:380px)]:flex-row items-start justify-between gap-4 w-full">
                                                <div>
                                                    <p style={{ color: themeColors.text }} className="font-medium text-sm">Seat Name</p>
                                                    <p style={{ color: themeColors.text }} className="text-sm">{seat.seatName}</p>
                                                </div>

                                                <div>
                                                    <p style={{ color: themeColors.text }} className="font-medium text-sm">Status</p>
                                                    <p className={`text-sm ${seat.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {seat.isActive ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p style={{ color: themeColors.text }} className="font-medium text-sm">Booking Type</p>
                                                    <div className="flex items-center mt-1">
                                                        <SeatForIcon
                                                            size={14}
                                                            className={`mr-1 ${seat.seatFor === 'daily-booking' ? 'text-orange-500' : 'text-purple-500'}`}
                                                        />
                                                        <span className={`text-sm ${seat.seatFor === 'daily-booking' ? 'text-orange-600' : 'text-purple-600'}`}>
                                                            {getSeatForLabel(seat.seatFor)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}` }}>
                                            <th style={{ color: themeColors.text }} className="text-left py-3 px-4 font-semibold">Seat Number</th>
                                            <th style={{ color: themeColors.text }} className="text-left py-3 px-4 font-semibold">Seat Name</th>
                                            <th style={{ color: themeColors.text }} className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th style={{ color: themeColors.text }} className="text-left py-3 px-4 font-semibold">Booking Type</th>
                                            <th style={{ color: themeColors.text }} className="text-left py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentSeats.map((seat) => {
                                            const SeatForIcon = getSeatForIcon(seat.seatFor);
                                            return (
                                                <tr
                                                    key={seat._id}
                                                    className="hover:bg-opacity-50 transition-colors"
                                                    style={{
                                                        borderBottom: `1px solid ${theme === 'light' ? '#f3f4f6' : '#374151'}`,
                                                        backgroundColor: themeColors.background
                                                    }}
                                                >
                                                    <td style={{ color: themeColors.text }} className="py-3 px-4 font-medium">#{seat.seatNumber}</td>
                                                    <td style={{ color: themeColors.text }} className="py-3 px-4">{seat.seatName}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${seat.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            <div className={`w-2 h-2 rounded-full mr-1 ${seat.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                            {seat.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center">
                                                            <SeatForIcon
                                                                size={16}
                                                                className={`mr-2 ${seat.seatFor === 'daily-booking' ? 'text-orange-500' : 'text-purple-500'}`}
                                                            />
                                                            <span className={`text-sm ${seat.seatFor === 'daily-booking' ? 'text-orange-600' : 'text-purple-600'}`}>
                                                                {getSeatForLabel(seat.seatFor)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => navigate(`/dashboard/view-seat/${seat._id}`)}
                                                                className="transition-colors"
                                                                style={{ color: themeColors.primary }}
                                                                title="View"
                                                            >
                                                                <FiEye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => openEditModal(seat)}
                                                                className="transition-colors"
                                                                style={{ color: themeColors.primary }}
                                                                title="Edit"
                                                            >
                                                                <FiEdit3 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(seat._id)}
                                                                className="transition-colors"
                                                                style={{ color: seat.isActive ? themeColors.accent : themeColors.primary }}
                                                                title={seat.isActive ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {seat.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                                                            </button>
                                                            {/* <button
                                                                onClick={() => handleDeleteSeat(seat._id)}
                                                                className="transition-colors"
                                                                style={{ color: themeColors.primary }}
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button> */}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className="px-3 py-1 rounded transition-colors"
                                        style={currentPage === index + 1
                                            ? {
                                                backgroundColor: themeColors.primary,
                                                color: themeColors.lightText || '#ffffff'
                                            }
                                            : {
                                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                                color: themeColors.text
                                            }
                                        }
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    style={{
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Seat Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="rounded-lg p-6 w-full max-w-md transform transition-all duration-200 scale-100"
                        style={{ backgroundColor: themeColors.background }}
                    >
                        <h2 style={{ color: themeColors.text }} className="text-xl font-bold mb-4">Add New Seat</h2>

                        <div className="space-y-4">
                            <div>
                                <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                    Seat Number *
                                </label>
                                <input
                                    type="text"
                                    value={seatForm.seatNumber}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, seatNumber: e.target.value }))}
                                    className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                    placeholder="e.g., A1, 001"
                                />
                            </div>

                            <div>
                                <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                    Seat Name
                                </label>
                                <input
                                    type="text"
                                    value={seatForm.seatName}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, seatName: e.target.value }))}
                                    className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                    placeholder="Descriptive name"
                                />
                            </div>

                            <div>
                                <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                    Booking Type *
                                </label>
                                <select
                                    value={seatForm.seatFor}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, seatFor: e.target.value }))}
                                    className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                >
                                    {seatForOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={seatForm.isActive}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 rounded"
                                    style={{
                                        color: themeColors.primary,
                                        backgroundColor: themeColors.background
                                    }}
                                />
                                <label htmlFor="isActive" style={{ color: themeColors.text }} className="ml-2 text-sm">
                                    Active seat
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleAddSeat}
                                disabled={isSubmitting}
                                className="flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: themeColors.primary,
                                    color: themeColors.lightText || '#ffffff'
                                }}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Seat'}
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                                style={{
                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                    color: themeColors.text
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Add Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="rounded-lg p-6 w-full max-w-lg transform transition-all duration-200 scale-100"
                        style={{ backgroundColor: themeColors.background }}
                    >
                        <h2 style={{ color: themeColors.text }} className="text-xl font-bold mb-4">Bulk Add Seats</h2>

                        <div className="mb-4">
                            <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                Seat Data (Format: SeatNumber,SeatName,BookingType)
                            </label>
                            <textarea
                                value={bulkSeats}
                                onChange={(e) => setBulkSeats(e.target.value)}
                                className="w-full h-40 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                style={{
                                    backgroundColor: themeColors.background,
                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                    color: themeColors.text
                                }}
                                placeholder={`A1,Window Seat,daily-booking\nA2,Aisle Seat,monthly-booking\nA3,Corner Seat,daily-booking`}
                            />
                            <p style={{ color: themeColors.text }} className="text-xs mt-1">
                                One seat per line. Format: SeatNumber,SeatName,BookingType
                                <br />
                                BookingType options: daily-booking, monthly-booking (default: daily-booking)
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkAdd}
                                disabled={isSubmitting}
                                className="flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: theme === 'light' ? '#10b981' : '#059669',
                                    color: '#ffffff'
                                }}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Seats'}
                            </button>
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                                style={{
                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                    color: themeColors.text
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Seat Modal */}
            {editingSeat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="rounded-lg p-6 w-full max-w-md transform transition-all duration-200 scale-100"
                        style={{ backgroundColor: themeColors.background }}
                    >
                        <h2 style={{ color: themeColors.text }} className="text-xl font-bold mb-4">Edit Seat</h2>

                        <div className="space-y-4">
                            <div>
                                <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                    Seat Number *
                                </label>
                                <input
                                    type="text"
                                    value={seatForm.seatNumber}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, seatNumber: e.target.value }))}
                                    className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                    Seat Name
                                </label>
                                <input
                                    type="text"
                                    value={seatForm.seatName}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, seatName: e.target.value }))}
                                    className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ color: themeColors.text }} className="block text-sm font-medium mb-1">
                                    Booking Type *
                                </label>
                                <select
                                    value={seatForm.seatFor}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, seatFor: e.target.value }))}
                                    className="w-full rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                    style={{
                                        backgroundColor: themeColors.background,
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                >
                                    {seatForOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="editIsActive"
                                    checked={seatForm.isActive}
                                    onChange={(e) => setSeatForm(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 rounded"
                                    style={{
                                        color: themeColors.primary,
                                        backgroundColor: themeColors.background
                                    }}
                                />
                                <label htmlFor="editIsActive" style={{ color: themeColors.text }} className="ml-2 text-sm">
                                    Active seat
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleUpdateSeat}
                                disabled={isSubmitting}
                                className="flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: themeColors.primary,
                                    color: themeColors.lightText || '#ffffff'
                                }}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Seat'}
                            </button>
                            <button
                                onClick={closeEditModal}
                                className="flex-1 py-2 px-4 rounded-lg transition-colors"
                                style={{
                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                    color: themeColors.text
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSeats;