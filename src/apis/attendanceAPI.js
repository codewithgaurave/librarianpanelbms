import axios from "axios";
import apiRoutes from "../constant/api";

const attendanceAPI = {
  // 📌 Get attendances of the logged-in student
  getMyAttendances: (studentId, token) =>
    axios.get(`${apiRoutes.attendance}/my-attendances/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 📍 Check-in to a library (Student only)
  checkIn: (libraryId, bookingId, token) =>
    axios.post(`${apiRoutes.attendance}/${libraryId}/check-in/${bookingId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 📤 Check-out from a library (Student only)
  checkOut: (libraryId, bookingId, token) =>
    axios.post(`${apiRoutes.attendance}/${libraryId}/check-out/${bookingId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🏛️ Get all attendances for librarian's library
  getLibraryAttendances: (token) =>
    axios.get(`${apiRoutes.attendance}/library`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🌐 Get all attendances (Admin only)
  getAllAttendances: (token) =>
    axios.get(`${apiRoutes.attendance}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default attendanceAPI;
