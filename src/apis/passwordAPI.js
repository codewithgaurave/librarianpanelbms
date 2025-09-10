import axios from "axios";
import apiRoutes from "../constant/api";

const passwordAPI = {
  // 📌 Forgot Password (send OTP to email)
  forgotPassword: (email) =>
    axios.post(`${apiRoutes.password}/forgot-password`, { email }),

  // 📌 Reset Password using OTP
  resetPassword: (email, otp, newPassword) =>
    axios.post(`${apiRoutes.password}/reset-password`, {
      email,
      otp,
      newPassword,
    }),

  // 📌 Change Password (logged-in password) - Step 1: request OTP
  changePassword: (currentPassword, newPassword, token) =>
    axios.post(
      `${apiRoutes.password}/change-password`,
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  // 📌 Verify OTP for Change Password - Step 2: confirm OTP
  verifyChangePasswordOtp: (otp, token) =>
    axios.post(
      `${apiRoutes.password}/verify-change-password-otp`,
      { otp },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),
};

export default passwordAPI;
