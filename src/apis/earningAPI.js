import axios from "axios";
import apiRoutes from "../constant/api";

const earningAPI = {
  // Get total earnings for a library (admin)
  getEarningsByLibrary: (libraryId, token) =>
    axios.get(`${apiRoutes.earnings}/library/${libraryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Get my earnings and withdraw stats for a library (librarian)
  getMyEarningsByLibrary: (libraryId, token) =>
    axios.get(`${apiRoutes.earnings}/library/${libraryId}/my-earnings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

export default earningAPI;
