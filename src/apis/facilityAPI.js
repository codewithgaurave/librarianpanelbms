import axios from "axios";
import apiRoutes from "../constant/api";

const facilityAPI = {
  // Public routes
  getAllFacilities: () => axios.get(apiRoutes.facility),
  getFacilityById: (facilityId) => axios.get(`${apiRoutes.facility}/${facilityId}`),
  createFacility: (data) => axios.post(apiRoutes.facility, data),

  // Admin routes
  getAllFacilitiesAdmin: () => axios.get(`${apiRoutes.facility}/admin/all`),
  updateFacility: (facilityId, data) => axios.put(`${apiRoutes.facility}/${facilityId}`, data),
  toggleFacilityStatus: (facilityId) => axios.patch(`${apiRoutes.facility}/toggle-status/${facilityId}`),
  deleteFacility: (facilityId) => axios.delete(`${apiRoutes.facility}/${facilityId}`),
};

export default facilityAPI;
