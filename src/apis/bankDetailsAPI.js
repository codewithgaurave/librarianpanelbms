import axios from "axios";
import apiRoutes from "../constant/api";

const bankDetailsAPI = {
	// Add or update bank details for a library
	upsertBankDetails: (libraryId, data, token) =>
		axios.post(`${apiRoutes.bankDetails}/library/${libraryId}`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}),

	// Get bank details by library ID
	getBankDetailsById: (libraryId, token) =>
		axios.get(`${apiRoutes.bankDetails}/library/${libraryId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}),
};

export default bankDetailsAPI;
