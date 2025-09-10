import axios from "axios";
import apiRoutes from "../constant/api";

const libraryTypeAPI = {

  // Public routes
  getAllLibraryTypes: () => axios.get(apiRoutes.libraryType),
  getLibraryTypeById: (libraryTypeId) => axios.get(`${apiRoutes.libraryType}/${libraryTypeId}`),
  createLibraryType: (data) => axios.post(apiRoutes.libraryType, data),

  // Admin routes
  getAllLibraryTypesAdmin: () => axios.get(`${apiRoutes.libraryType}/admin/all`),
  updateLibraryType: (libraryTypeId, data) => axios.put(`${apiRoutes.libraryType}/${libraryTypeId}`, data),
  toggleLibraryTypeStatus: (libraryTypeId) => axios.patch(`${apiRoutes.libraryType}/toggle-status/${libraryTypeId}`),
  deleteLibraryType: (libraryTypeId) => axios.delete(`${apiRoutes.libraryType}/${libraryTypeId}`),
  
};

export default libraryTypeAPI;
