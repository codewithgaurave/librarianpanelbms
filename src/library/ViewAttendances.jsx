import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

import {
  Calendar,
  Filter,
  Users,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  QrCode,
  Edit,
  Download,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Timer,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import attendanceAPI from '../apis/attendanceAPI.js';
import mbAttendanceAPI from '../apis/mbAttendanceAPI.js';
import { useTheme } from '../context/ThemeContext.jsx';

const ViewAttendances = () => {
  const { theme, themeColors } = useTheme();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingType, setBookingType] = useState('onetime'); // 'onetime' or 'monthly'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    method: '',
    page: 1,
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  const userData = useSelector((state) => state.auth.user);
  const token = userData?.token;

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      
      if (bookingType === 'onetime') {
        response = await attendanceAPI.getLibraryAttendances(token);
      } else {
        response = await mbAttendanceAPI.getAllMonthlyBookingForLibrary(token);
      }
      console.log("res", response)
      
      setAttendanceData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance data');
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAttendances();
    }
  }, [token, filters, bookingType]);

  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    setFilters(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (newPage) => {
    const totalPages = bookingType === 'onetime' 
      ? attendanceData?.attendances?.pages 
      : attendanceData?.attendances?.totalPages;
    
    if (newPage > 0 && newPage <= totalPages) {
      handleFilterChange('page', newPage);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get stats based on booking type
  const getStats = () => {
    if (!attendanceData) return null;
    
    if (bookingType === 'onetime') {
      return attendanceData.stats;
    } else {
      // Map monthly booking stats to match one-time booking structure
      const summary = attendanceData.stats?.summary || {};
      return {
        totalAttendances: summary.totalAttendances || 0,
        attendanceRate: summary.totalRegisteredStudents > 0 
          ? Math.round((summary.uniqueStudents / summary.totalRegisteredStudents) * 100)
          : 0,
        avgDuration: summary.avgDuration || 0,
        dailyAverage: summary.totalAttendances > 0 
          ? Math.round(summary.totalAttendances / 30)
          : 0,
        qrCount: summary.qrCount || 0,
        manualCount: summary.manualCount || 0,
        uniqueStudents: summary.uniqueStudents || 0,
        totalBookings: summary.totalRegisteredStudents || 0,
        attendedBookings: summary.uniqueStudents || 0,
        absentBookings: (summary.totalRegisteredStudents || 0) - (summary.uniqueStudents || 0),
        today: {
          total: summary.todayAttendance || 0,
          attended: summary.todayAttendance || 0,
          absent: 0,
          bookings: summary.totalRegisteredStudents || 0,
          attendanceRate: summary.todayAttendance > 0 ? 100 : 0,
          date: new Date().toISOString()
        }
      };
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => {
    const colorMap = {
      blue: themeColors.primary,
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div 
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4`}
              style={{ 
                backgroundColor: theme === 'dark' ? `${colorMap[color]}20` : `${colorMap[color]}10`,
              }}
            >
              <Icon 
                className={`w-6 h-6`} 
                style={{ color: colorMap[color] }} 
              />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: themeColors.text }}>{value}</h3>
            <p className="text-sm" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>{title}</p>
            {subtitle && <p className="text-xs mt-1" style={{ color: theme === 'dark' ? '#6B7280' : '#9CA3AF' }}>{subtitle}</p>}
          </div>
          {trend && (
            <div className={`text-right ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className="text-lg font-semibold">{trend > 0 ? '+' : ''}{trend}%</div>
              <div className="text-xs" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>vs last week</div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const BookingTypeButtons = () => (
    <div className="flex items-center gap-2 mb-6">
      <button
        onClick={() => handleBookingTypeChange('onetime')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          bookingType === 'onetime'
            ? 'text-white'
            : theme === 'dark' 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
        style={bookingType === 'onetime' ? { backgroundColor: themeColors.primary } : {}}
      >
        <CalendarDays className="w-4 h-4" />
        One-Time Bookings
      </button>
      <button
        onClick={() => handleBookingTypeChange('monthly')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          bookingType === 'monthly'
            ? 'text-white'
            : theme === 'dark' 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
        style={bookingType === 'monthly' ? { backgroundColor: themeColors.primary } : {}}
      >
        <CalendarRange className="w-4 h-4" />
        Monthly Bookings
      </button>
    </div>
  );

  const FilterSection = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`rounded-xl p-4 shadow-md border mb-6 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 flex flex-col">
              <label className="flex items-center gap-1 text-xs font-medium mb-1" style={{ color: themeColors.text }}>
                <Calendar className="w-4 h-4" /> Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:border-transparent text-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : 'white',
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                  color: themeColors.text
                }}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="flex items-center gap-1 text-xs font-medium mb-1" style={{ color: themeColors.text }}>
                <Calendar className="w-4 h-4" /> End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:border-transparent text-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : 'white',
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                  color: themeColors.text
                }}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="flex items-center gap-1 text-xs font-medium mb-1" style={{ color: themeColors.text }}>
                <QrCode className="w-4 h-4" /> Method
              </label>
              <select
                value={filters.method}
                onChange={(e) => handleFilterChange('method', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:border-transparent text-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#374151' : 'white',
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                  color: themeColors.text
                }}
              >
                <option value="">All Methods</option>
                <option value="QR">QR Code</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div className="flex flex-row gap-2 md:flex-col md:gap-2 md:items-end">
              <button 
                onClick={() => fetchAttendances()}
                className="px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
                style={{
                  backgroundColor: themeColors.primary,
                  color: theme === 'dark' ? themeColors.text : 'white'
                }}
              >
                <Search className="w-4 h-4" />
                Apply
              </button>
              <button 
                onClick={() => {
                  setFilters(prev => ({ ...prev, startDate: '', endDate: '', method: '' }));
                  fetchAttendances();
                }}
                className="px-4 py-2 rounded-lg transition-colors flex items-center gap-1 border text-sm font-medium shadow-sm"
                style={{
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                  backgroundColor: theme === 'dark' ? '#374151' : 'white',
                  color: themeColors.text
                }}
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAttendanceTable = () => {
    const attendances = attendanceData?.attendances;
    if (!attendances) return null;

    const docs = attendances.docs || attendances.data || [];
    const currentPage = attendances.page || 1;
    const totalPages = attendances.pages || attendances.totalPages || 1;
    const total = attendances.total || attendances.totalDocs || 0;

    return (
      <div className={`rounded-xl shadow-sm border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
        <div className="p-6 border-b" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
              Recent {bookingType === 'onetime' ? 'One-Time' : 'Monthly'} Attendances
            </h3>
            <div className="flex items-center gap-2 text-sm" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
              <span>Showing {docs.length} of {total} records</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB' }}>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                >
                  Student
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                >
                  {bookingType === 'onetime' ? 'Time Slot' : 'Visit Date'}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                >
                  {bookingType === 'onetime' ? 'Check In' : 'Sessions Count'}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                >
                  {bookingType === 'onetime' ? 'Check Out' : 'Total Duration'}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                >
                  {bookingType === 'onetime' ? 'Duration' : 'Booking Period'}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                >
                  Method
                </th>
                {bookingType === 'monthly' && (
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}
                  >
                    Sessions Detail
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ color: themeColors.text, divideColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
              {docs.map((attendance, index) => (
                <motion.tr
                  key={attendance._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-opacity-10"
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.5)',
                    hoverBackgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: themeColors.text }}>{attendance.student.name}</div>
                      <div className="text-sm" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>{attendance.student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                    {bookingType === 'onetime' 
                      ? (attendance.timeSlot?.startTime + ' - ' + attendance.timeSlot?.endTime)
                      : formatDate(attendance.date)
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                    {bookingType === 'onetime' 
                      ? formatTime(attendance.checkInTime)
                      : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{attendance.sessions?.length || 0}</span>
                          <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>sessions</span>
                        </div>
                      )
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                    {bookingType === 'onetime' 
                      ? (attendance.checkOutTime ? formatTime(attendance.checkOutTime) : 
                          <span style={{ color: '#10B981' }}>Active</span>)
                      : (
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                          <span className="font-medium">{formatDuration(attendance.totalDurationMinutes)}</span>
                        </div>
                      )
                    }
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: themeColors.text }}>
                    {bookingType === 'onetime' 
                      ? (attendance.durationMinutes ? formatDuration(attendance.durationMinutes) : '-')
                      : (attendance.booking && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                            {formatDate(attendance.booking.startDate)}
                          </div>
                          <div className="text-xs" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                            to {formatDate(attendance.booking.endDate)}
                          </div>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            attendance.booking.status === 'confirmed' 
                              ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                              : (theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                          }`}>
                            {attendance.booking.status}
                          </div>
                        </div>
                      ))
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attendance.method === 'QR' 
                        ? (theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                        : (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                    }`}>
                      {attendance.method === 'QR' ? <QrCode className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                      {attendance.method}
                    </span>
                  </td>
                  {bookingType === 'monthly' && (
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {attendance.sessions && attendance.sessions.length > 0 ? (
                          <div className="space-y-2">
                            {attendance.sessions.slice(0, 3).map((session, sessionIndex) => (
                              <div 
                                key={session._id || sessionIndex} 
                                className="text-xs p-2 rounded border"
                                style={{ 
                                  backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
                                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB'
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                                    {formatTime(session.checkInTime)}
                                  </span>
                                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                                    {session.checkOutTime ? formatTime(session.checkOutTime) : 'Active'}
                                  </span>
                                </div>
                                <div className="text-center mt-1">
                                  <span className="font-medium" style={{ color: themeColors.text }}>
                                    {formatDuration(session.durationMinutes)}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {attendance.sessions.length > 3 && (
                              <div className="text-xs text-center" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                                +{attendance.sessions.length - 3} more sessions
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
                            No sessions
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
          >
            <div className="text-sm" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                  backgroundColor: theme === 'dark' ? '#374151' : 'white',
                  color: themeColors.text
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: theme === 'dark' ? '#4B5563' : '#D1D5DB',
                  backgroundColor: theme === 'dark' ? '#374151' : 'white',
                  color: themeColors.text
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && !attendanceData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="p-6 rounded-lg shadow-md max-w-md text-center" style={{ backgroundColor: theme === 'dark' ? '#1F2937' : 'white' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#EF4444' }}>Error Loading Data</h2>
          <p className="mb-4" style={{ color: themeColors.text }}>{error}</p>
          <button
            onClick={fetchAttendances}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: themeColors.primary,
              color: theme === 'dark' ? themeColors.text : 'white'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return null;
  }

  const stats = getStats();

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: themeColors.text }}>Library Attendance</h1>
            <p className="mt-1" style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>Monitor and track student attendance in your library</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-600 text-white' : theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            {/* <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              style={{
                backgroundColor: '#10B981',
                color: 'white'
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </button> */}
          </div>
        </div>

        {/* Booking Type Buttons */}
        <BookingTypeButtons />

        <FilterSection />

        {/* Today's Overview */}
        {stats?.today && (
          <div 
            className="rounded-xl p-6 text-white mb-8"
            style={{
              background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.accent})`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Today's Overview</h2>
                <p className="text-blue-100">{formatDate(stats.today.date)}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.today.attendanceRate}%</div>
                <div className="text-blue-100">Attendance Rate</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.today.total}</div>
                <div className="text-blue-100 text-sm">Total Check-ins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.today.attended}</div>
                <div className="text-blue-100 text-sm">Attended</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.today.absent}</div>
                <div className="text-blue-100 text-sm">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.today.bookings}</div>
                <div className="text-blue-100 text-sm">Total Bookings</div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Total Attendances"
              value={stats.totalAttendances}
              color="blue"
            />
            <StatCard
              icon={Target}
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              subtitle={`${stats.attendedBookings} of ${stats.totalBookings} bookings`}
              color="green"
            />
            <StatCard
              icon={Timer}
              title="Avg Duration"
              value={formatDuration(stats.avgDuration)}
              subtitle="Per session"
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              title="Daily Average"
              value={stats.dailyAverage}
              subtitle="Attendances per day"
              color="orange"
            />
          </div>
        )}

        {/* Method & Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`rounded-xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-5 h-5" style={{ color: themeColors.primary }} />
                <h3 className="font-semibold" style={{ color: themeColors.text }}>Check-in Methods</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>QR Code</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 rounded-full h-2" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalAttendances > 0 ? (stats.qrCount / stats.totalAttendances) * 100 : 0}%`,
                          backgroundColor: themeColors.primary
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>{stats.qrCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>Manual</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 rounded-full h-2" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalAttendances > 0 ? (stats.manualCount / stats.totalAttendances) * 100 : 0}%`,
                          backgroundColor: '#10B981'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>{stats.manualCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-5 h-5" style={{ color: '#10B981' }} />
                <h3 className="font-semibold" style={{ color: themeColors.text }}>Attendance vs Absence</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>Attended</span>
                  <span className="font-semibold" style={{ color: '#10B981' }}>{stats.attendedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>Absent</span>
                  <span className="font-semibold" style={{ color: '#EF4444' }}>{stats.absentBookings}</span>
                </div>
                <div className="w-full rounded-full h-3 mt-3" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                  <div 
                    className="h-3 rounded-full" 
                    style={{ 
                      width: `${stats.attendanceRate}%`,
                      backgroundColor: '#10B981'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                <h3 className="font-semibold" style={{ color: themeColors.text }}>Student Engagement</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>Unique Students</span>
                  <span className="font-semibold" style={{ color: '#8B5CF6' }}>{stats.uniqueStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}>Avg per Student</span>
                  <span className="font-semibold" style={{ color: themeColors.text }}>
                    {stats.uniqueStudents > 0 ? Math.round(stats.totalAttendances / stats.uniqueStudents * 10) / 10 : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        {renderAttendanceTable()}
      </div>
    </div>
  );
};

export default ViewAttendances;