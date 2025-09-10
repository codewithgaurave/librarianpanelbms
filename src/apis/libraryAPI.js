import axios from "axios";
import apiRoutes from "../constant/api";

const libraryAPI = {
  getLibraryById: (libraryId, token) => axios.get(`${apiRoutes.library}/${libraryId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  getMyLibrary: (token) => axios.get(`${apiRoutes.library}/my-library`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  getAllLibrariesForAdmin: (token) => axios.get(`${apiRoutes.library}/for-admin`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  getAllLibrariesForStudents: (token) => axios.get(`${apiRoutes.library}/for-students`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
  getLibraryQrCode: (token) => axios.get(`${apiRoutes.library}/qr-code`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  togglePopularLibrary: (libraryId, token) => axios.patch(`${apiRoutes.library}/popular/${libraryId}/toggle`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  toggleBlockLibrary: (libraryId, token) => axios.patch(`${apiRoutes.library}/block/${libraryId}/toggle`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  deleteLibrary: (libraryId, token) => axios.delete(`${apiRoutes.library}/${libraryId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),

  registerLibrary: (formData, token) => axios.post(`${apiRoutes.library}/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  }),

  updateLibrary: (libraryId, data, token) => axios.put(`${apiRoutes.library}/update/${libraryId}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    }
  }),
};

export default libraryAPI;
