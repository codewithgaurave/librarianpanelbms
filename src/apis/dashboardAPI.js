import axios from "axios";
import apiRoutes from "../constant/api";

const dashboardAPI = {
  getAdminStats: (token) =>
    axios.get(`${apiRoutes.dashboard}/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getLibrarianStats: (token) =>
    axios.get(`${apiRoutes.dashboard}/librarian`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getStudentStats: (token) =>
    axios.get(`${apiRoutes.dashboard}/student`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default dashboardAPI;