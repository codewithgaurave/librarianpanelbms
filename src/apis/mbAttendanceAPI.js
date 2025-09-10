  import axios from "axios";
  import apiRoutes from "../constant/api";

  const mbAttendanceAPI = {
    // 🏛️ Get all attendances for librarian's library
    getAllMonthlyBookingForLibrary: (token) =>
      axios.get(`${apiRoutes.mbAttendance}/library`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

  };

  export default mbAttendanceAPI;
