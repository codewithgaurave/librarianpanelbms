import axios from "axios";
import apiRoutes from "../constant/api";

const bookingAPI = {
  // 📅 Create a booking (student only)
  createBooking: (data, token) =>
    axios.post(`${apiRoutes.booking}/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 👤 Get bookings of the logged-in student
  getMyBookings: (token) =>
    axios.get(`${apiRoutes.booking}/my-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // ❌ Cancel a specific booking (student only)
  cancelBooking: (bookingId, token) =>
    axios.patch(`${apiRoutes.booking}/${bookingId}/cancel`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🏛️ Get bookings for the librarian's library
  getLibraryBookings: (token, queryParams = {}) =>
    axios.get(`${apiRoutes.booking}/library`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: queryParams, // e.g., { date: '2025-06-29', status: 'pending' }
    }),

  // 🧾 Update booking status (librarian only)
  updateBookingStatus: (bookingId, status, token) =>
    axios.put(`${apiRoutes.booking}/${bookingId}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🧾 reject booking (librarian only)
  rejectBooking: (bookingId, token) =>
    axios.put(`${apiRoutes.booking}/${bookingId}/reject`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🌐 Get all bookings (admin only)
  getAllBookings: (token) =>
    axios.get(`${apiRoutes.booking}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default bookingAPI;
