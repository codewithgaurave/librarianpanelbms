import axios from "axios";
import apiRoutes from "../constant/api";

const userAPI = {
  // 📌 Public Routes
  createUser: (userData) => axios.post(`${apiRoutes.user}/`, userData),

  loginUser: (credentials) => axios.post(`${apiRoutes.user}/login`, credentials),

  // 🔐 Protected Routes (require token)
  getUserById: (userId, token) =>
    axios.get(`${apiRoutes.user}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updateUser: (userId, updatedData, token) =>
    axios.put(`${apiRoutes.user}/update/${userId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🔐 Admin Routes
  getAllUsers: (token) =>
    axios.get(`${apiRoutes.user}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  toggleBlockUser: (userId, token) =>
    axios.patch(`${apiRoutes.user}/toggle/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  deleteUser: (userId, token) =>
    axios.delete(`${apiRoutes.user}/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default userAPI;
