import React from 'react';
import { motion } from 'framer-motion';
import {
  FaBook,
  FaUsers,
  FaClock,
  FaMoneyBillWave,
  FaQrcode,
  FaUserEdit,
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaCoins
} from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(...registerables);

const DashboardStats = ({ statsData }) => {
  const { theme, themeColors } = useTheme();
  // console.log(statsData)
  if (!statsData) return (
    <div
      className="text-center py-10"
      style={{ color: themeColors.text }}
    >
      Loading dashboard data...
    </div>
  );

  // Destructure all keys from the latest API response
  const {
    library = {},
    counts = {},
    bookingStatus = {},
    revenue = {},
    totalEarningStats = {},
    attendance = {},
    recentBookings = [],
    recentAttendances = [],
    seatStats = [],
  } = statsData;
  console.log(statsData)
  // Booking Counts Bar Chart Data
  const bookingCountsBarData = {
    labels: [
      'Total Bookings',
      'Total One-Time Bookings',
      'Total Monthly Bookings',
      "Today's One-Time Bookings",
      "Today's Monthly Bookings"
    ],
    datasets: [
      {
        label: 'Bookings',
        data: [
          totalEarningStats.totalBookings || 0,
          totalEarningStats.totalOneTimeBookings || 0,
          totalEarningStats.totalMonthlyBookings || 0,
          totalEarningStats.todaysOneTimeBookings || 0,
          totalEarningStats.todaysMonthlyBookings || 0
        ],
        backgroundColor: [
          '#FF6B35',
          '#F7931E',
          '#FFD23F',
          '#06FFA5',
          '#4ECDC4'
        ],
        borderRadius: 0
      }
    ]
  };
  // Earnings Bar Chart Data
  const earningsBarData = {
    labels: [
      'Total Revenue',
      'One-Time Booking Earnings',
      'Monthly Booking Earnings',
      "Today's One-Time Earning",
      "Today's Monthly Earning",
      'Withdrawn Amount',
      'Withdrawable Amount',
      'Pending Withdraw Amount'
    ],
    datasets: [
      {
        label: 'Earnings',
        data: [
          totalEarningStats.totalRevenue || 0,
          totalEarningStats.totalBookingEarnings || 0,
          totalEarningStats.totalMonthlyEarnings || 0,
          totalEarningStats.todaysOneTimeEarning || 0,
          totalEarningStats.todaysMonthlyEarning || 0,
          totalEarningStats.withdrawnAmount || 0,
          totalEarningStats.withdrawableAmount || 0,
          totalEarningStats.pendingWithdrawAmount || 0
        ],
        backgroundColor: [
          '#FF6B35',
          '#F7931E',
          '#FFD23F',
          '#06FFA5',
          '#4ECDC4',
          '#3D5A80',
          '#98C1D9',
          '#EE6C4D'
        ],
        borderRadius: 0
      }
    ]
  };
  // Chart data with theme-aware colors
  const bookingStatusChartData = {
    labels: Object.keys(bookingStatus),
    datasets: [{
      data: Object.values(bookingStatus),
      backgroundColor: [
        '#FF6B35',
        '#F7931E',
        '#FFD23F',
        '#06FFA5'
      ],
      borderWidth: 0
    }]
  };

  const attendanceMethodData = {
    labels: ['QR Code', 'Manual'],
    datasets: [{
      data: [attendance.qrCount, attendance.manualCount],
      backgroundColor: [
        '#4ECDC4',
        '#FF6B35'
      ],
      borderWidth: 0
    }]
  };

  // Stats cards data with updated colors
  const statCards = [
    {
      icon: FaClock,
      title: 'Total Attendances',
      value: counts.attendances,
      iconColor: '#FF6B35',
      bgColor: '#FFF5F3'
    },
    {
      icon: FaUsers,
      title: 'Today Attendances',
      value: counts.todayAttendances,
      iconColor: '#F7931E',
      bgColor: '#FFF8F0'
    },
    {
      icon: FaClock,
      title: 'Avg Duration',
      value: `${attendance.avgDuration?.toFixed(2) || 0} mins`,
      iconColor: '#4ECDC4',
      bgColor: '#F0FFFE'
    },
    {
      icon: FaQrcode,
      title: 'QR Check-ins',
      value: attendance.qrCount,
      iconColor: '#06FFA5',
      bgColor: '#F0FFFC'
    },
    {
      icon: FaUserEdit,
      title: 'Manual Check-ins',
      value: attendance.manualCount,
      iconColor: '#3D5A80',
      bgColor: '#F4F6F8'
    }
  ];

  return (
    <div
      className="p-6 min-h-screen"
      style={{ backgroundColor: themeColors.background }}
    >
{/* Library Info Header */}

<div
  className="mb-8 p-6 shadow-sm border flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0"
  style={{
    backgroundColor: themeColors.background,
    borderColor: themeColors.hover.background
  }}
>
  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1 min-w-0">
    {library.logo && (
      <img
        src={`${import.meta.env.VITE_BASE_API}/uploads/${library.logo}`}
        alt="Library Logo"
        className="w-20 h-20 object-cover flex-shrink-0"
      />
    )}
    <div className="text-center sm:text-left w-full">
      <h1 style={{ color: themeColors.text }} className="text-2xl sm:text-3xl font-bold break-words">{library.libraryName}</h1>
      <p
        className="mt-2 text-sm sm:text-base break-words"
        style={{ color: themeColors.text }}
      >
        {library.description}
      </p>
    </div>
  </div>
  <div className="flex flex-col gap-2 items-center md:items-end w-full md:w-auto">
    <div className="flex items-center gap-2">
      <h1 style={{ color: themeColors.text }} className="text-sm sm:text-base">Account Status: </h1>
      <span 
        className="px-3 py-1 text-xs sm:text-sm capitalize"
        style={{
          backgroundColor: 
            !library.isBlocked ? 'rgba(6, 255, 165, 0.2)' :
            'rgba(255, 107, 53, 0.2)',
          color:
            !library.isBlocked ? 'rgb(6, 255, 165)' :
            'rgb(255, 107, 53)'
        }}
      >
        {library.isBlocked ? "Blocked" : "Active"}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <h1 style={{ color: themeColors.text }} className="text-sm sm:text-base">Approval Status: </h1>
      <span 
        className="px-3 py-1 text-xs sm:text-sm capitalize"
        style={{
          backgroundColor: 
            library.status === 'approved' ? 'rgba(6, 255, 165, 0.2)' :
            library.status === 'pending' ? 'rgba(255, 210, 63, 0.2)' :
            library.status === 'rejected' ? 'rgba(255, 107, 53, 0.2)' :
            library.status === 'in_review' ? 'rgba(78, 205, 196, 0.2)' :
            themeColors.hover.background,
          color:
            library.status === 'approved' ? 'rgb(6, 255, 165)' :
            library.status === 'pending' ? 'rgb(255, 210, 63)' :
            library.status === 'rejected' ? 'rgb(255, 107, 53)' :
            library.status === 'in_review' ? 'rgb(78, 205, 196)' :
            themeColors.text
        }}
      >
        {library.status ? library.status.replace('_', ' ') : 'N/A'}
      </span>
    </div>
  </div>
</div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-6 shadow-sm border"
          style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.hover.background
            }}
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 mb-4"
              style={{
                backgroundColor: stat.bgColor,
                color: stat.iconColor
              }}
            >
              {stat.coin ? (
                <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-10 h-10" />
              ) :(
                <stat.icon className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 style={{ color: themeColors.text }} className="text-2xl font-bold">{stat.value}</h3>
              <p style={{ color: themeColors.text }} className="text-sm">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* All Earning Stats Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>All Earning Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Total Revenue',
              value: totalEarningStats.totalRevenue,
              icon: FaCoins,
              color: '#FF6B35'
            },
            {
              title: 'Total Earnings From One-Time Bookings',
              value: totalEarningStats.totalBookingEarnings,
              icon: FaMoneyBillWave,
              color: '#F7931E'
            },
            {
              title: 'Total Earnings Monthly Bookings',
              value: totalEarningStats.totalMonthlyEarnings,
              icon: FaMoneyBillWave,
              color: '#FFD23F'
            },
            {
              title: 'Total Bookings',
              value: totalEarningStats.totalBookings,
              icon: FaBook,
              color: '#06FFA5'
            },
            {
              title: 'Total One-Time Bookings',
              value: totalEarningStats.totalOneTimeBookings,
              icon: FaBook,
              color: '#4ECDC4'
            },
            {
              title: 'Total Monthly Bookings',
              value: totalEarningStats.totalMonthlyBookings,
              icon: FaBook,
              color: '#3D5A80'
            },
            {
              title: "Today's One-Time Bookings",
              value: totalEarningStats.todaysOneTimeBookings,
              icon: FaBook,
              color: '#98C1D9'
            },
            {
              title: "Today's Monthly Bookings",
              value: totalEarningStats.todaysMonthlyBookings,
              icon: FaBook,
              color: '#EE6C4D'
            },
            {
              title: "Today's Earning From One-Time Bookings",
              value: totalEarningStats.todaysOneTimeEarning,
              icon: FaMoneyBillWave,
              color: '#FF6B35'
            },
            {
              title: "Today's Earning From Monthly Bookings",
              value: totalEarningStats.todaysMonthlyEarning,
              icon: FaMoneyBillWave,
              color: '#F7931E'
            },
            {
              title: 'Total Withdrawn Amount',
              value: totalEarningStats.withdrawnAmount,
              icon: FaCoins,
              color: '#4ECDC4'
            },
            {
              title: 'Total Withdrawable Amount',
              value: totalEarningStats.withdrawableAmount,
              icon: FaCoins,
              color: '#06FFA5'
            },
            {
              title: 'Total Pending Withdraw Amount',
              value: totalEarningStats.pendingWithdrawAmount,
              icon: FaCoins,
              color: '#FFD23F'
            }
          ].map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-6 shadow-sm border"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.hover.background }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                <card.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 style={{ color: card.color }} className="text-2xl font-bold">{card.value?.toLocaleString()}</h3>
                <p style={{ color: themeColors.text }} className="text-sm">{card.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

{/* Booking Counts Bar Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>Booking Counts Breakdown</h2>
        <div className="shadow-sm border p-6" style={{ backgroundColor: themeColors.background, borderColor: themeColors.hover.background }}>
          <div className="h-96">
            <Bar
              data={bookingCountsBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: { color: themeColors.text }
                  },
                  y: {
                    ticks: { color: themeColors.text }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      {/* Earnings Bar Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>Earnings Breakdown</h2>
        <div className="shadow-sm border p-6" style={{ backgroundColor: themeColors.background, borderColor: themeColors.hover.background }}>
          <div className="h-96">
            <Bar
              data={earningsBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    ticks: { color: themeColors.text }
                  },
                  y: {
                    ticks: { color: themeColors.text }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Booking Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 shadow-sm border"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.hover.background
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaChartPie style={{ color: '#FF6B35' }} />
            <h3 style={{ color: themeColors.text }} className="font-semibold">Booking Status</h3>
          </div>
          <div className="h-64">
            <Pie
              data={bookingStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: themeColors.text
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Attendance Method Pie Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 shadow-sm border"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.hover.background
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaChartBar style={{ color: '#4ECDC4' }} />
            <h3 style={{ color: themeColors.text }} className="font-semibold">Attendance Methods</h3>
          </div>
          <div className="h-64">
            <Pie
              data={attendanceMethodData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: themeColors.text
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="shadow-sm border"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.hover.background
          }}
        >
          <div
            className="p-6 border-b"
            style={{ borderColor: themeColors.hover.background }}
          >
            <div className="flex items-center gap-2">
              <FaCalendarAlt style={{ color: '#FF6B35' }} />
              <h3 style={{ color: themeColors.text }} className="font-semibold">Recent Bookings</h3>
            </div>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: themeColors.hover.background }}
          >
            {recentBookings.map((booking, index) => (
              <div
                key={index}
                className="p-4 hover:bg-opacity-50 transition-colors"
                style={{
                  backgroundColor: index % 2 === 0 ? themeColors.background : themeColors.hover.background
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p style={{ color: themeColors.text }} className="font-medium">{booking.user.name}</p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors.text }}
                    >
                      Seat: {booking.seat.seatName}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: '#06FFA515',
                      color: '#06FFA5'
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-gray-600">
                  {/* Booking Date */}
                  <span style={{ color: themeColors.text }}>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>

                  {/* Coin Icon with Amount */}
                  <div className="flex items-center gap-1 font-medium" style={{ color: themeColors.text }}>
                                    <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-9 h-9" />
                    <span>{booking.amount}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Attendances */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="shadow-sm border"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.hover.background
          }}
        >
          <div
            className="p-6 border-b"
            style={{ borderColor: themeColors.hover.background }}
          >
            <div className="flex items-center gap-2">
              <FaUsers style={{ color: '#4ECDC4' }} />
              <h3 style={{ color: themeColors.text }} className="font-semibold">Recent Attendances</h3>
            </div>
          </div>
          <div
            className="divide-y"
            style={{ borderColor: themeColors.hover.background }}
          >
            {recentAttendances.map((attendance, index) => (
              <div
                key={index}
                className="p-4 hover:bg-opacity-50 transition-colors"
                style={{
                  backgroundColor: index % 2 === 0 ? themeColors.background : themeColors.hover.background
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p style={{ color: themeColors.text }} className="font-medium">{attendance.student.name}</p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors.text }}
                    >
                      {attendance?.timeSlot?.startTime} - {attendance?.timeSlot?.endTime}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: '#F7931E15',
                      color: '#F7931E'
                    }}
                  >
                    {attendance.method}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span style={{ color: themeColors.text }}>
                    {new Date(attendance.checkInTime).toLocaleString()}
                  </span>
                  <span style={{ color: themeColors.text }} className="font-medium">
                    {attendance.durationMinutes || 0} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default DashboardStats;