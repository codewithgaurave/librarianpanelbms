import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaChair,
    FaCoins,
    FaHistory,
    FaChartBar,
    FaUsers,
    FaCalendarCheck,
    FaCalendarTimes,
    FaMoneyCheckAlt,
    FaReceipt,
    FaBan,
    FaClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import seatAPI from '../apis/seatAPI';

const ViewMonthlyBookingSeat = () => {
    const { theme, themeColors } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.user);
    const token = userData?.token;
    const [seatData, setSeatData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    // Fetch seat details
    const fetchSeatData = async () => {
        try {
            setLoading(true);
            const response = await seatAPI.getMonthlySeatCompleteDetails(id, token);
            setSeatData(response.data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch seat details');
            setLoading(false);
            toast.error(error.response?.data?.message || 'Failed to fetch seat details');
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
        });
    };

    // Format date with time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate duration in days
    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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

    if (!seatData?.seatDetails) {
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

    const { seatDetails, bookings, statistics, meta } = seatData;

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
                        Monthly Booking: {seatDetails.seatName} ({seatDetails.seatNumber})
                    </h1>
                    <p style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                        Detailed monthly booking statistics and history for this seat
                    </p>
                </div>
                <div className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                    Last updated: {formatDateTime(meta.lastUpdated)}
                </div>
            </div>

            {/* Seat Information Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-6 border mb-8"
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
                        <FaChair />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Seat Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Seat Number:</p>
                        <p className="text-lg" style={{ color: themeColors.text }}>{seatDetails.seatNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Seat Name:</p>
                        <p className="text-lg" style={{ color: themeColors.text }}>{seatDetails.seatName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status:</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${seatDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {seatDetails.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Booking Type:</p>
                        <p className="text-lg" style={{ color: themeColors.text }}>Monthly Booking</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Created At:</p>
                        <p className="text-sm" style={{ color: themeColors.text }}>{formatDateTime(seatDetails.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Last Updated:</p>
                        <p className="text-sm" style={{ color: themeColors.text }}>{formatDateTime(seatDetails.updatedAt)}</p>
                    </div>
                </div>
            </motion.div>

            {/* Key Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Bookings Card */}
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
                            <FaCalendarAlt />
                        </div>
                        <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Total Bookings</h2>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: themeColors.text }}>
                        {statistics.totalBookings}
                    </p>
                    <p className="text-sm mt-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                        All-time monthly bookings
                    </p>
                </motion.div>

                {/* Active Bookings Card */}
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
                            <FaCalendarCheck />
                        </div>
                        <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Active Bookings</h2>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: themeColors.text }}>
                        {statistics.activeBookings}
                    </p>
                    <p className="text-sm mt-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                        Currently active monthly bookings
                    </p>
                </motion.div>

                {/* Revenue Card */}
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
                            <FaMoneyBillWave />
                        </div>
                        <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Total Revenue</h2>
                    </div>
                    <div className="flex items-end gap-2">
                        <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-6 h-6 rounded-full" />
                        <p className="text-3xl font-bold" style={{ color: themeColors.text }}>
                            {statistics.revenueGenerated}
                        </p>
                    </div>
                    <p className="text-sm mt-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                        Generated from monthly bookings
                    </p>
                </motion.div>

                {/* User Distribution Card */}
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
                            <FaUsers />
                        </div>
                        <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Top User</h2>
                    </div>
                    {statistics.userDistribution.length > 0 ? (
                        <div>
                            <p className="text-lg font-medium" style={{ color: themeColors.text }}>
                                {statistics.userDistribution[0].user.name}
                            </p>
                            <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                {statistics.userDistribution[0].count} bookings • {statistics.userDistribution[0].totalAmount} coins
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>No bookings yet</p>
                    )}
                </motion.div>
            </div>

            {/* Detailed Booking Statistics */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-6 border mb-8"
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
                        <FaChartBar />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Booking Statistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#eff6ff' : '#1e3a8a' }}>
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-blue-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>Confirmed</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>
                                    {statistics.activeBookings}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>
                                    Current monthly bookings
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#f0fdf4' : '#14532d' }}>
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-green-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#166534' : '#bbf7d0' }}>Completed</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#166534' : '#bbf7d0' }}>
                                    {statistics.completedBookings}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#166534' : '#bbf7d0' }}>
                                    Past monthly bookings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#fef2f2' : '#7f1d1d' }}>
                        <div className="flex items-center gap-3">
                            <FaTimesCircle className="text-red-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>Cancelled</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>
                                    {statistics.cancelledBookings}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>
                                    Cancelled by users
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#fffbeb' : '#713f12' }}>
                        <div className="flex items-center gap-3">
                            <FaClock className="text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#92400e' : '#fde68a' }}>Pending</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#92400e' : '#fde68a' }}>
                                    {statistics.pendingBookings}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#92400e' : '#fde68a' }}>
                                    Awaiting confirmation
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#fef2f2' : '#7f1d1d' }}>
                        <div className="flex items-center gap-3">
                            <FaBan className="text-red-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>Rejected</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>
                                    {statistics.rejectedBookings}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>
                                    Rejected by admin
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payment Statistics */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-lg p-6 border mb-8"
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
                        <FaMoneyCheckAlt />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Payment Statistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#eff6ff' : '#1e3a8a' }}>
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-blue-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>Paid</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>
                                    {statistics.paymentStats.paid}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>
                                    Successful payments
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#fffbeb' : '#713f12' }}>
                        <div className="flex items-center gap-3">
                            <FaClock className="text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#92400e' : '#fde68a' }}>Pending</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#92400e' : '#fde68a' }}>
                                    {statistics.paymentStats.pending}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#92400e' : '#fde68a' }}>
                                    Awaiting payment
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#fef2f2' : '#7f1d1d' }}>
                        <div className="flex items-center gap-3">
                            <FaTimesCircle className="text-red-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>Failed</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>
                                    {statistics.paymentStats.failed}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#991b1b' : '#fecaca' }}>
                                    Failed transactions
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: theme === 'light' ? '#eff6ff' : '#1e3a8a' }}>
                        <div className="flex items-center gap-3">
                            <FaMoneyBillWave className="text-blue-500" />
                            <div>
                                <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>Refunded</p>
                                <p className="text-lg font-bold" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>
                                    {statistics.paymentStats.refunded}
                                </p>
                                <p className="text-xs" style={{ color: theme === 'light' ? '#1e40af' : '#bfdbfe' }}>
                                    Amounts refunded
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bookings Table */}
            <div className="rounded-lg border overflow-hidden mb-8" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                <div className="flex justify-between items-center p-4" style={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#111827' }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: theme === 'light' ? themeColors.hover.background : themeColors.hover.background,
                                color: themeColors.primary
                            }}
                        >
                            <FaReceipt />
                        </div>
                        <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Monthly Bookings History</h2>
                    </div>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                        Showing {bookings.length} of {meta.totalRecords} records
                    </p>
                </div>

                <table className="min-w-full divide-y">
                    <thead style={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#111827' }}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Booked At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                    No monthly bookings available
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking, index) => (
                                <motion.tr
                                    key={booking._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937' }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <FaUser style={{ color: themeColors.primary }} />
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <p className="text-sm" style={{ color: themeColors.text }}>
                                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                            </p>
                                            <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                                {calculateDuration(booking.startDate, booking.endDate)} days
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 rounded-full" />
                                            <span style={{ color: themeColors.text }}>{booking.amount}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                            }`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm" style={{ color: themeColors.text }}>
                                            {formatDateTime(booking.bookedAt)}
                                        </p>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Monthly Trend */}
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
                        <FaHistory />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Monthly Booking Trend</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(statistics.monthlyTrend).map(([monthYear, count]) => (
                        <div key={monthYear} className="p-4 rounded-lg border" style={{ borderColor: theme === 'light' ? '#e5e7eb' : '#374151' }}>
                            <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                {monthYear}
                            </p>
                            <p className="text-xl font-bold" style={{ color: themeColors.text }}>
                                {count} bookings
                            </p>
                            <p className="text-xs" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                                Monthly bookings trend
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ViewMonthlyBookingSeat;