import axios from "axios";
import apiRoutes from "../constant/api";

const withdrawRequestAPI = {
  // Librarian: Create withdraw request
  createWithdrawRequest: (data, token) =>
    axios.post(`${apiRoutes.withdrawRequests}/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Admin: Get all withdraw requests
  getAllWithdrawRequests: (token) =>
    axios.get(`${apiRoutes.withdrawRequests}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Admin: Resolve a withdraw request
  resolveWithdrawRequest: (requestId, token) =>
    axios.patch(`${apiRoutes.withdrawRequests}/${requestId}/resolve`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Admin: Reject a withdraw request
  rejectWithdrawRequest: (requestId, rejectedReason, token) =>
    axios.patch(`${apiRoutes.withdrawRequests}/${requestId}/reject`, { rejectedReason }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Get withdraw requests for a specific library
  getMyWithdrawRequests: (libraryId, token) =>
    axios.get(`${apiRoutes.withdrawRequests}/library/${libraryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default withdrawRequestAPI;
