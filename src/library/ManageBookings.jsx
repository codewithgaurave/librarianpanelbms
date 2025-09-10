import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiGrid,
    FiList,
    FiCalendar,
    FiUser,
    FiBookmark,
    FiRefreshCw,
    FiPrinter,
    FiDownload,
    FiInfo,
    FiEdit,
    FiTrash2,
    FiMail,
    FiPhone,
    FiHash,
    FiThumbsDown,
    FiSlash,
    FiLogIn,
    FiLogOut
} from 'react-icons/fi';
import { FaUserGraduate, FaChair, FaCoins } from 'react-icons/fa';
import bookingAPI from '../apis/bookingAPI';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ManageBookings = () => {
    const { theme, themeColors } = useTheme();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.user);
    const token = userData.token;
    const libraryId = userData?.library?._id;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);
    const [dateFilter, setDateFilter] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        completed: 0,
        rejected: 0,
        revenue: 0,
        missed: 0,
        checkedIn: 0,
        noCheckout: 0
    });

    useEffect(() => {
        fetchBookings();
    }, [token, libraryId]);

    useEffect(() => {
        calculateStats();
    }, [bookings]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const queryParams = {};
            if (dateFilter instanceof Date && !isNaN(dateFilter)) {
                queryParams.date = dateFilter?.toISOString()?.split('T')[0];
            }
            if (filterStatus !== 'all') queryParams.status = filterStatus;

            const response = await bookingAPI.getLibraryBookings(token, queryParams);
            // console.log(response)
            setBookings(response.data.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to fetch bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const calculateStats = () => {
        const total = bookings.length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const pending = bookings.filter(b => b.status === 'pending').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const missed = bookings.filter(b => b.status === 'missed').length;
        const checkedIn = bookings.filter(b => b.status === 'checked-in').length;
        const noCheckout = bookings.filter(b => b.status === 'no-checkout').length;
        const rejected = bookings.filter(b => b.status === 'rejected').length;
        const revenue = bookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, booking) => sum + booking.amount, 0);

        setStats({ total, confirmed, pending, cancelled, completed, revenue, missed, checkedIn, noCheckout, rejected });
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        // console.log(bookingId, newStatus)
        try {
            const res = await bookingAPI.updateBookingStatus(bookingId, newStatus, token);
            // console.log("res",res)
            toast.success(`Booking status updated to ${newStatus}`);
            fetchBookings();
        } catch (error) {
            // console.log("er",error)
            toast.error(error.response?.data?.message || 'Failed to update booking status');
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Export started. You will receive the file shortly.');
        } catch (error) {
            toast.error('Failed to generate export');
        } finally {
            setExportLoading(false);
        }
    };

    const handlePrint = () => {
        toast.info('Print functionality would be implemented here');
    };

    const openDetailModal = (booking) => {
        // Defensive: ensure booking and nested properties are always objects
        const safeBooking = {
            ...booking,
            user: booking?.user || { name: '', email: '', mobile: '' },
            seat: booking?.seat || { seatNumber: '', seatName: '' },
            timeSlot: booking?.timeSlot || { startTime: '', endTime: '' },
            amount: booking?.amount || 0,
            paymentStatus: booking?.paymentStatus || '',
            status: booking?.status || '',
            bookingDate: booking?.bookingDate || '',
            createdAt: booking?.createdAt || '',
            _id: booking?._id || '',
        };
        setSelectedBooking(safeBooking);
        setShowDetailModal(true);
    };

    const filteredBookings = bookings?.filter(booking => {
        const matchesSearch =
            booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.seat.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user.mobile.includes(searchTerm);

        const matchesFilter =
            filterStatus === 'all' ||
            booking.status === filterStatus;

        const matchesDate =
            !dateFilter ||
            new Date(booking.bookingDate)?.toISOString()?.split('T')[0] === dateFilter?.toISOString()?.split('T')[0];

        return matchesSearch && matchesFilter && matchesDate;
    });

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString?.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: theme === 'light' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-900 text-yellow-200',
            confirmed: theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900 text-green-200',
            cancelled: theme === 'light' ? 'bg-red-100 text-red-800' : 'bg-red-900 text-red-200',
            completed: theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200',
            rejected: theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-gray-700 text-gray-200'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const statusClasses = {
            paid: theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900 text-green-200',
            pending: theme === 'light' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-900 text-yellow-200',
            failed: theme === 'light' ? 'bg-red-100 text-red-800' : 'bg-red-900 text-red-200',
            refunded: theme === 'light' ? 'bg-purple-100 text-purple-800' : 'bg-purple-900 text-purple-200'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

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
                className="rounded-xl shadow-md p-6"
                style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                }}
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 style={{ color: themeColors.text }} className="text-2xl font-bold">Manage Bookings</h1>
                        <p style={{ color: themeColors.text }} className="mt-1">View and manage all bookings for your library</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full lg:w-auto">
                        <button
                            onClick={handleRefresh}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all w-full sm:w-auto ${refreshing ? 'animate-spin' : ''}`}
                            style={{
                                backgroundColor: themeColors.hover.background,
                                color: themeColors.primary
                            }}
                        >
                            <FiRefreshCw className="mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                            : 'linear-gradient(to right, #1e40af, #1e3a8a)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Total</h3>
                            <p className="text-xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <FiBookmark className="text-2xl opacity-80" />
                    </div>
                </div>
                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #8b5cf6, #7c3aed)'
                            : 'linear-gradient(to right, #5b21b6, #4c1d95)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Total Ravenue</h3>
                            <p className="text-xl font-bold mt-1">{stats.revenue}</p>
                        </div>
                        <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-10 h-10 rounded-full" />
                    </div>
                </div>
                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #eab308, #ca8a04)'
                            : 'linear-gradient(to right, #854d0e, #713f12)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Pending</h3>
                            <p className="text-xl font-bold mt-1">{stats.pending}</p>
                        </div>
                        <FiClock className="text-2xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #22c55e, #16a34a)'
                            : 'linear-gradient(to right, #166534, #14532d)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Confirmed</h3>
                            <p className="text-xl font-bold mt-1">{stats.confirmed}</p>
                        </div>
                        <FiCheckCircle className="text-2xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #ef4444, #dc2626)'
                            : 'linear-gradient(to right, #991b1b, #7f1d1d)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Cancelled</h3>
                            <p className="text-xl font-bold mt-1">{stats.cancelled}</p>
                        </div>
                        <FiXCircle className="text-2xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #8b5cf6, #7c3aed)'
                            : 'linear-gradient(to right, #5b21b6, #4c1d95)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Completed</h3>
                            <p className="text-xl font-bold mt-1">{stats.completed}</p>
                        </div>
                        <FiCheckCircle className="text-2xl opacity-80" />
                    </div>
                </div>

                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #a855f7, #9333ea)'
                            : 'linear-gradient(to right, #6b21a8, #581c87)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Rejected</h3>
                            <p className="text-xl font-bold mt-1">{stats.rejected}</p>
                        </div>
                        <FiThumbsDown className="text-2xl opacity-80" />
                    </div>
                </div>

                {/* Missed */}
                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #f97316, #ea580c)'
                            : 'linear-gradient(to right, #9a3412, #7c2d12)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Missed</h3>
                            <p className="text-xl font-bold mt-1">{stats.missed}</p>
                        </div>
                        <FiSlash className="text-2xl opacity-80" />
                    </div>
                </div>

                {/* Checked-In */}
                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                            : 'linear-gradient(to right, #1e40af, #1e3a8a)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">Checked-In</h3>
                            <p className="text-xl font-bold mt-1">{stats.checkedIn}</p>
                        </div>
                        <FiLogIn className="text-2xl opacity-80" />
                    </div>
                </div>

                {/* NoCheckout */}
                <div
                    className="p-4 rounded-xl shadow-md"
                    style={{
                        background: theme === 'light'
                            ? 'linear-gradient(to right, #64748b, #475569)'
                            : 'linear-gradient(to right, #334155, #1e293b)',
                        color: '#ffffff'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium">No Checkout</h3>
                            <p className="text-xl font-bold mt-1">{stats.noCheckout}</p>
                        </div>
                        <FiLogOut className="text-2xl opacity-80" />
                    </div>
                </div>


            </div>

            {/* Filters and Search */}
            <div
                className="rounded-xl shadow-md p-6"
                style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                }}
            >
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <FiSearch
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: themeColors.text }}
                        />
                        <input
                            type="text"
                            placeholder="Search by student, seat, booking ID, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                            style={{
                                backgroundColor: themeColors.background,
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                color: themeColors.text
                            }}
                        />
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-40">
                            <DatePicker
                                selected={dateFilter}
                                onChange={(date) => setDateFilter(date)}
                                placeholderText="Filter by date"
                                className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                                style={{
                                    backgroundColor: themeColors.background,
                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                    color: themeColors.text
                                }}
                                isClearable
                            />
                            <FiCalendar
                                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                style={{ color: themeColors.text }}
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
                            style={{
                                backgroundColor: themeColors.background,
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                color: themeColors.text
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                            <option value="missed">missed</option>
                            <option value="checked-in">checked-in</option>
                            <option value="no-checkout">no-checkout</option>
                        </select>


                        <div
                            className="flex rounded-lg overflow-hidden"
                            style={{
                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                            }}
                        >
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors flex-1 font-semibold`}
                                style={{
                                    backgroundColor: viewMode === 'grid' ? '#e1321b' : themeColors.background,
                                    color: viewMode === 'grid' ? (themeColors.lightText || '#fff') : themeColors.text,
                                    borderRight: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                }}
                                title="Grid view"
                            >
                                <FiGrid />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition-colors flex-1 font-semibold`}
                                style={{
                                    backgroundColor: viewMode === 'list' ? themeColors.primary : themeColors.background,
                                    color: viewMode === 'list' ? (themeColors.lightText || '#fff') : themeColors.text
                                }}
                                title="List view"
                            >
                                <FiList />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings Display */}
            <div
                className="rounded-xl shadow-md p-6"
                style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                }}
            >
                {currentBookings.length === 0 ? (
                    <div className="text-center py-12">
                        <FiBookmark
                            className="mx-auto text-6xl mb-4"
                            style={{ color: theme === 'light' ? '#d1d5db' : '#4b5563' }}
                        />
                        <h3 style={{ color: themeColors.text }} className="text-xl font-semibold mb-2">No Bookings Found</h3>
                        <p style={{ color: themeColors.text }}>No bookings match your current filters</p>
                    </div>
                ) : (
                    <>
                        {/* // Updated Grid View Section for ManageBookings Component */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {/* {console.log(currentBookings)} */}
                                {currentBookings.map((booking) => (
                                    <motion.div
                                        key={booking._id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group relative cursor-pointer transition-all duration-200 rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-lg "
                                        style={{
                                            borderColor: booking.status === 'confirmed'
                                                ? '#10b981'
                                                : booking.status === 'pending'
                                                    ? '#f59e0b'
                                                    : booking.status === 'cancelled'
                                                        ? '#ef4444'
                                                        : booking.status === 'completed'
                                                            ? '#3b82f6'
                                                            : (theme === 'light' ? '#e5e7eb' : '#374151'),
                                            backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
                                            boxShadow: theme === 'light'
                                                ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                                : '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
                                        }}
                                        onClick={() => openDetailModal(booking)}
                                    >
                                        {/* Status indicator bar */}
                                        <div
                                            className="absolute top-0 left-0 right-0 h-1"
                                            style={{
                                                backgroundColor: booking.status === 'confirmed'
                                                    ? '#10b981'
                                                    : booking.status === 'pending'
                                                        ? '#f59e0b'
                                                        : booking.status === 'cancelled'
                                                            ? '#ef4444'
                                                            : booking.status === 'completed'
                                                                ? '#3b82f6'
                                                                : '#6b7280'
                                            }}
                                        />

                                        <div className="p-4">
                                            {/* Header Section */}
                                            <div className="flex justify-between items-start mb-3">
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
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span
                                                                className="font-bold text-sm"
                                                                style={{ color: themeColors.text }}
                                                            >
                                                                #{booking.seat.seatNumber}
                                                            </span>
                                                            <span className='text-right'>
                                                                {getStatusBadge(booking.status)}

                                                            </span>
                                                        </div>
                                                        <p
                                                            className="text-xs"
                                                            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                        >
                                                            {booking.seat.seatName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Info Section */}
                                            <div
                                                className="mb-3 p-3 rounded-lg"
                                                style={{
                                                    backgroundColor: theme === 'light' ? '#f9fafb' : '#111827',
                                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaUserGraduate
                                                        className="text-sm"
                                                        style={{ color: themeColors.primary }}
                                                    />
                                                    <p
                                                        className="text-sm font-medium truncate"
                                                        style={{ color: themeColors.text }}
                                                    >
                                                        {booking.user.name}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <FiMail
                                                            className="flex-shrink-0"
                                                            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                        />
                                                        <span
                                                            className="truncate"
                                                            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                        >
                                                            {booking.user.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <FiPhone
                                                            className="flex-shrink-0"
                                                            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                        />
                                                        <span
                                                            style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                        >
                                                            {booking.user.mobile}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Booking Details Section */}
                                            <div
                                                className="mb-3 p-3 rounded-lg"
                                                style={{
                                                    backgroundColor: theme === 'light' ? '#f9fafb' : '#111827',
                                                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FiCalendar
                                                        className="text-sm"
                                                        style={{ color: themeColors.primary }}
                                                    />
                                                    <p
                                                        className="text-sm font-medium"
                                                        style={{ color: themeColors.text }}
                                                    >
                                                        {formatDate(booking.bookingDate)}
                                                    </p>
                                                </div>
                                                {/* {console.log(booking)} */}
                                                {booking.timeSlot != null ? (
                                                    <p
                                                        className="text-xs ml-6"
                                                        style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                    >
                                                        {formatTime(booking?.timeSlot?.startTime)} - {formatTime(booking?.timeSlot?.endTime)}
                                                    </p>

                                                ) : (
                                                    <p
                                                        className="text-xs ml-6"
                                                        style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
                                                    >
                                                        Not Available
                                                    </p>
                                                )}
                                            </div>

                                            {/* Payment & Amount Section */}
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src='/img/bms_coin.jpg'
                                                        alt='bms_coin'
                                                        className="w-5 h-5 rounded-full"
                                                    />
                                                    <span
                                                        className="text-sm font-bold"
                                                        style={{ color: themeColors.text }}
                                                    >
                                                        {booking.amount}
                                                    </span>
                                                </div>
                                                {getPaymentBadge(booking.paymentStatus)}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDetailModal(booking);
                                                    }}
                                                    className="flex-1 text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                                                    style={{
                                                        backgroundColor: themeColors.hover.background,
                                                        color: themeColors.text,
                                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                                    }}
                                                >
                                                    <FiInfo className="text-xs" />
                                                    Details
                                                </motion.button>

                                                {booking.status === 'pending' && (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(booking._id, 'confirmed');
                                                            }}
                                                            className="flex-1 text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-white"
                                                            style={{ backgroundColor: '#10b981' }}
                                                        >
                                                            <FiCheckCircle className="text-xs" />
                                                            Confirm
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(booking._id, 'rejected');
                                                            }}
                                                            className="flex-1 text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-white"
                                                            style={{ backgroundColor: '#ef4444' }}
                                                        >
                                                            <FiXCircle className="text-xs" />
                                                            Reject
                                                        </motion.button>
                                                    </>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(booking._id, 'completed');
                                                            }}
                                                            className="flex-1 text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-white"
                                                            style={{ backgroundColor: '#3b82f6' }}
                                                        >
                                                            <FiCheckCircle className="text-xs" />
                                                            Complete
                                                        </motion.button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusUpdate(booking._id, 'rejected');
                                                                setShowDetailModal(false);
                                                            }}
                                                            className=" flex-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <FiXCircle size={16} />  Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (

                            <div className="overflow-hidden rounded-xl border" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-max">
                                        <thead>
                                            <tr
                                                style={{
                                                    backgroundColor: theme === 'light' ? '#f9fafb' : '#111827',
                                                    borderBottom: `2px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                                }}
                                            >
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    <div className="flex items-center gap-2">
                                                        <FiHash className="text-xs" />
                                                        Booking ID
                                                    </div>
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    <div className="flex items-center gap-2">
                                                        <FaUserGraduate className="text-xs" />
                                                        Student
                                                    </div>
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    <div className="flex items-center gap-2">
                                                        <FaChair className="text-xs" />
                                                        Seat
                                                    </div>
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar className="text-xs" />
                                                        Date & Time
                                                    </div>
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    Status
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    <div className="flex items-center gap-2">
                                                        <img src='/img/bms_coin.jpg' alt='coin' className="w-4 h-4 rounded-full" />
                                                        Amount
                                                    </div>
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    Payment
                                                </th>
                                                <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: themeColors.text }}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentBookings.map((booking, index) => (
                                                <motion.tr
                                                    key={booking._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="hover:bg-opacity-50 transition-all duration-200 group"
                                                    style={{
                                                        borderBottom: `1px solid ${theme === 'light' ? '#f3f4f6' : '#374151'}`,
                                                        backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#f9fafb' : '#111827';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#1f2937';
                                                    }}
                                                >
                                                    <td className="py-4 px-6">
                                                        <motion.span
                                                            whileHover={{ scale: 1.05 }}
                                                            className="cursor-pointer font-mono text-sm px-2 py-1 rounded-md transition-all duration-200"
                                                            onClick={() => openDetailModal(booking)}
                                                            style={{
                                                                color: themeColors.primary,
                                                                backgroundColor: theme === 'light' ? themeColors.primary + '10' : themeColors.primary + '20'
                                                            }}
                                                            title={booking._id}
                                                        >
                                                            {booking._id}
                                                        </motion.span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: themeColors.primary + '20',
                                                                    color: themeColors.primary
                                                                }}
                                                            >
                                                                {booking.user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                                                                    {booking.user.name}
                                                                </p>
                                                                <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                                                    {booking.user.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div
                                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg"
                                                            style={{
                                                                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                                                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                                                            }}
                                                        >
                                                            <FaChair className="text-xs" style={{ color: themeColors.primary }} />
                                                            <div>
                                                                <p className="text-sm font-semibold" style={{ color: themeColors.text }}>
                                                                    #{booking.seat.seatNumber}
                                                                </p>
                                                                <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                                                    {booking.seat.seatName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div>
                                                            <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                                                                {formatDate(booking.bookingDate)}
                                                            </p>
                                                            {booking.timeSlot != null ? (

                                                                <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                                                    {formatTime(booking?.timeSlot?.startTime)} - {formatTime(booking?.timeSlot?.endTime)}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                                                    Not Available
                                                                </p>

                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getStatusBadge(booking.status)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="inline-flex items-center gap-2">
                                                            <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-6 h-6 rounded-full" />
                                                            <span className="font-semibold text-sm" style={{ color: themeColors.text }}>
                                                                {booking.amount}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getPaymentBadge(booking.paymentStatus)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => openDetailModal(booking)}
                                                                className="p-2 rounded-lg transition-all duration-200"
                                                                style={{
                                                                    color: themeColors.primary,
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.backgroundColor = theme === 'light' ? themeColors.primary + '10' : themeColors.primary + '20';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.backgroundColor = 'transparent';
                                                                }}
                                                                title="View Details"
                                                            >
                                                                <FiInfo size={16} />
                                                            </motion.button>

                                                            {booking.status === 'pending' && (
                                                                <>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                                        className="p-2 rounded-lg transition-all duration-200"
                                                                        style={{ color: '#10b981' }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = '#10b981' + '10';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = 'transparent';
                                                                        }}
                                                                        title="Confirm Booking"
                                                                    >
                                                                        <FiCheckCircle size={16} />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                        className="p-2 rounded-lg transition-all duration-200"
                                                                        style={{ color: '#ef4444' }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = '#ef4444' + '10';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = 'transparent';
                                                                        }}
                                                                        title="Reject Booking"
                                                                    >
                                                                        <FiXCircle size={16} />
                                                                    </motion.button>
                                                                </>
                                                            )}

                                                            {booking.status === 'confirmed' && (
                                                                <>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                                        className="p-2 rounded-lg transition-all duration-200"
                                                                        style={{ color: '#3b82f6' }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.backgroundColor = '#3b82f6' + '10';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.backgroundColor = 'transparent';
                                                                        }}
                                                                        title="Mark as Complete"
                                                                    >
                                                                        <FiCheckCircle size={16} />
                                                                    </motion.button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleStatusUpdate(selectedBooking._id, 'rejected');
                                                                            setShowDetailModal(false);
                                                                        }}
                                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                                    >
                                                                        Reject Booking
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col gap-4 mt-6 w-full">
            
                                <div className="w-full overflow-x-auto">
                                    <div className="flex flex-row flex-nowrap gap-2 justify-center sm:justify-start items-center px-1">

                                        {/* Only show active page, Previous, and Next buttons */}
                                        {/* Only one Previous, one Next, and one active page button */}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[40px]"
                                            style={{
                                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                                color: themeColors.text
                                            }}
                                        >
                                           {"<"}Prev
                                        </button>
                                        <span
                                            className="px-3 py-2 rounded-lg font-bold shadow min-w-[40px] bg-opacity-90"
                                            style={{
                                                backgroundColor: themeColors.primary,
                                                color: themeColors.lightText || '#ffffff',
                                                border: `1px solid ${themeColors.primary}`
                                            }}
                                        >
                                            {currentPage}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[40px]"
                                            style={{
                                                border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                                color: themeColors.text
                                            }}
                                        >
                                            Next{">"}
                                        </button>

                                    </div>
                                    
                                </div>
                                                    <div className="text-xs text-center  sm:text-left text-gray-400" >
                                    Page No {currentPage}, Showing {indexOfFirstBooking + 1} to {Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Booking Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: themeColors.background }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 style={{ color: themeColors.text }} className="text-xl font-bold">Booking Details</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                style={{ color: themeColors.text }}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 style={{ color: themeColors.text }} className="text-lg font-semibold mb-3 border-b pb-2">Student Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Name</p>
                                        <p style={{ color: themeColors.text }}>{selectedBooking.user.name}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Email</p>
                                        <p style={{ color: themeColors.text }}>{selectedBooking.user.email}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Phone</p>
                                        <p style={{ color: themeColors.text }}>{selectedBooking.user.mobile}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ color: themeColors.text }} className="text-lg font-semibold mb-3 border-b pb-2">Booking Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Booking ID</p>
                                        <p style={{ color: themeColors.text }}>{selectedBooking._id}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Status</p>
                                        <p>{getStatusBadge(selectedBooking.status)}</p>
                                    </div>


                                    <div className="">
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Amount</p>
                                        <div className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: themeColors.text }}>
                                            <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-10 h-10 rounded-full" />
                                            <span>{selectedBooking.amount}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Payment Status</p>
                                        <p>{getPaymentBadge(selectedBooking.paymentStatus)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ color: themeColors.text }} className="text-lg font-semibold mb-3 border-b pb-2">Seat Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Seat Number</p>
                                        <p style={{ color: themeColors.text }}>#{selectedBooking.seat.seatNumber}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Seat Name</p>
                                        <p style={{ color: themeColors.text }}>{selectedBooking.seat.seatName}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ color: themeColors.text }} className="text-lg font-semibold mb-3 border-b pb-2">Time Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Booking Date</p>
                                        <p style={{ color: themeColors.text }}>{formatDate(selectedBooking.bookingDate)}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Time Slot</p>
                                        <p style={{ color: themeColors.text }}>
                                            {formatTime(selectedBooking?.timeSlot?.startTime)} - {formatTime(selectedBooking?.timeSlot?.endTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: themeColors.text }} className="text-sm font-medium">Created At</p>
                                        <p style={{ color: themeColors.text }}>{formatDate(selectedBooking.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                            <h3 style={{ color: themeColors.text }} className="text-lg font-semibold mb-3">Actions</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedBooking.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedBooking._id, 'confirmed');
                                                setShowDetailModal(false);
                                            }}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Confirm Booking
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedBooking._id, 'rejected');
                                                setShowDetailModal(false);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Reject Booking
                                        </button>
                                    </>
                                )}
                                {selectedBooking.status === 'confirmed' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedBooking._id, 'completed');
                                                setShowDetailModal(false);
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedBooking._id, 'rejected');
                                                setShowDetailModal(false);
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Reject Booking
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-4 py-2 rounded-lg transition-colors"
                                    style={{
                                        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                                        color: themeColors.text
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBookings;