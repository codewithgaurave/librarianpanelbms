import axios from "axios";
import apiRoutes from "../constant/api"; // Make sure `apiRoutes.seat` is correctly defined

const seatAPI = {
  // 🔐 Protected Routes (require token)
  
  // Seat Management
  createSeat: (seatData, token) =>
    axios.post(`${apiRoutes.seat}/`, seatData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  bulkCreateSeats: (seatsArray, token) =>
    axios.post(`${apiRoutes.seat}/bulk`, seatsArray, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getAllSeats: (token) =>
    axios.get(`${apiRoutes.seat}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getSeatById: (seatId, token) =>
    axios.get(`${apiRoutes.seat}/get-one/${seatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getSeatDetails: (seatId, token) =>
    axios.get(`${apiRoutes.seat}/${seatId}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getMonthlySeatCompleteDetails: (seatId, token) =>
    axios.get(`${apiRoutes.seat}/${seatId}/mb/details/for-librarian`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updateSeat: (seatId, updatedData, token) =>
    axios.put(`${apiRoutes.seat}/update/${seatId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  deleteSeat: (seatId, token) =>
    axios.delete(`${apiRoutes.seat}/delete/${seatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  toggleSeatStatus: (seatId, token) =>
    axios.patch(`${apiRoutes.seat}/${seatId}/toggle-status`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getSeatsByLibrary: (libraryId, token) =>
    axios.get(`${apiRoutes.seat}/library/${libraryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Time Slot Management
  addTimeSlots: (seatId, data, token) =>
    axios.post(`${apiRoutes.seat}/${seatId}/time-slots`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getTimeSlots: (seatId, params = {}, token) =>
    axios.get(`${apiRoutes.seat}/${seatId}/time-slots`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  bookTimeSlot: (seatId, slotId, bookingData, token) =>
    axios.post(
      `${apiRoutes.seat}/${seatId}/time-slots/${slotId}/book`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  updateTimeSlot: (seatId, slotId, updatedData, token) =>
    axios.put(
      `${apiRoutes.seat}/${seatId}/time-slots/${slotId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  toggleTimeSlotStatus: (seatId, slotId, token) =>
    axios.delete(`${apiRoutes.seat}/${seatId}/toggle-time-slots/${slotId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  deleteTimeSlot: (seatId, slotId, token) =>
    axios.delete(`${apiRoutes.seat}/${seatId}/time-slots/${slotId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default seatAPI;