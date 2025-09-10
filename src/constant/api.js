// src/constants/api.js

const BASE_URL = import.meta.env.VITE_BASE_API;
const API_PREFIX = import.meta.env.VITE_API_URL || "api";

const apiRoutes = {
  user: `${BASE_URL}/${API_PREFIX}/users`,
  password: `${BASE_URL}/${API_PREFIX}/password`,
  library: `${BASE_URL}/${API_PREFIX}/library`,
  facility: `${BASE_URL}/${API_PREFIX}/facility`,
  libraryType: `${BASE_URL}/${API_PREFIX}/library-type`,
  seat: `${BASE_URL}/${API_PREFIX}/seat`,
  timeSlot: `${BASE_URL}/${API_PREFIX}/timeslot`,
  booking: `${BASE_URL}/${API_PREFIX}/booking`,
  attendance: `${BASE_URL}/${API_PREFIX}/attendance`,
  mbAttendance: `${BASE_URL}/${API_PREFIX}/mb/attendance`,
  dashboard: `${BASE_URL}/${API_PREFIX}/stats`,
  bankDetails: `${BASE_URL}/${API_PREFIX}/bank-details`,
  withdrawRequests: `${BASE_URL}/${API_PREFIX}/withdraw-requests`,
  earnings: `${BASE_URL}/${API_PREFIX}/earnings`,

};

export default apiRoutes;
