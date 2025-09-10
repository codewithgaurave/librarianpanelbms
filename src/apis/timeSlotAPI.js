import axios from "axios";
import apiRoutes from "../constant/api";

const timeSlotAPI = {
  // 📖 Public Routes (if any)
  getAllTimeSlots: (token) =>
    axios.get(`${apiRoutes.timeSlot}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getTimeSlotById: (id, token) =>
    axios.get(`${apiRoutes.timeSlot}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getAllTimeSlotsByLibrary: (id, token) =>
    axios.get(`${apiRoutes.timeSlot}/${id}/library`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🔐 librarian-Protected Routes
  createTimeSlot: (timeSlotData, token) =>
    axios.post(`${apiRoutes.timeSlot}/`, timeSlotData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Seat Management Endpoints
  addSeatsToTimeSlot: (timeSlotId, seatIds, token) =>
    axios.post(
      `${apiRoutes.timeSlot}/${timeSlotId}/add-seats`,
      { seatIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  removeSeatsFromTimeSlot: (timeSlotId, seatIds, token) =>
    axios.post(
      `${apiRoutes.timeSlot}/${timeSlotId}/remove-seats`,
      { seatIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  updateTimeSlot: (id, updatedData, token) =>
    axios.put(`${apiRoutes.timeSlot}/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  toggleTimeSlotStatus: (id, token) =>
    axios.patch(`${apiRoutes.timeSlot}/${id}/toggle-status`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  deleteTimeSlot: (id, token) =>
    axios.delete(`${apiRoutes.timeSlot}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default timeSlotAPI;