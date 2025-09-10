import React, { useState } from "react";
import passwordAPI from "../apis/passwordAPI";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { logout } from "../redux/features/authSlice";

const ChangePassword = () => {
  const { themeColors } = useTheme();
  const userData = useSelector((state) => state.auth.user);
  const token = userData?.token;
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordAPI.changePassword(currentPassword, newPassword, token);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordAPI.verifyChangePasswordOtp(otp, token);
      toast.success("Password changed successfully");
      setStep(3);
      setRedirecting(true);
      
      // Clear user data and redirect to login
      setTimeout(() => {
        dispatch(logout());
        navigate("/", { replace: true });
        // Fallback to window.location in case navigate doesn't work
        setTimeout(() => {
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
        }, 100);
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: themeColors.background, color: themeColors.text }}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: themeColors.accent }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: themeColors.primary }}
        ></div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-xl rounded-3xl shadow-2xl border p-8 md:p-10"
          style={{
            backgroundColor: themeColors.hover.background,
            color: themeColors.text,
            borderColor: "#ccc",
          }}
        >
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= step ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ 
                    backgroundColor: i <= step ? themeColors.primary : `${themeColors.primary}50`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl shadow-lg">
              {step === 1 && (
                <div 
                  className="w-full h-full flex items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <Lock className="w-8 h-8" style={{ color: themeColors.primary }} />
                </div>
              )}
              {step === 2 && (
                <div 
                  className="w-full h-full flex items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <Shield className="w-8 h-8" style={{ color: themeColors.primary }} />
                </div>
              )}
              {step === 3 && (
                <div 
                  className="w-full h-full flex items-center justify-center rounded-2xl animate-pulse"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: themeColors.primary }} />
                </div>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {step === 1 && "Change Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Success!"}
            </h1>
            
            <p className="text-sm opacity-80">
              {step === 1 && "Enter your current and new password"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Password changed successfully"}
            </p>
          </div>

          {/* Step 1: Password Input */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="text-sm font-medium block mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:outline-none border"
                      style={{
                        backgroundColor: "#f9fafb",
                        borderColor: "#ccc",
                        focusRingColor: themeColors.primary,
                      }}
                      placeholder="Enter your current password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="text-sm font-medium block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:outline-none border"
                      style={{
                        backgroundColor: "#f9fafb",
                        borderColor: "#ccc",
                        focusRingColor: themeColors.primary,
                      }}
                      placeholder="Enter your new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="text-sm font-medium block mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength="6"
                      className="w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:outline-none border text-center text-lg tracking-widest"
                      style={{
                        backgroundColor: "#f9fafb",
                        borderColor: "#ccc",
                        focusRingColor: themeColors.primary,
                      }}
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Verify & Change Password <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Success with Redirect */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-6">
                <div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-pulse"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <CheckCircle2 
                    className="w-10 h-10" 
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Password Changed!</h3>
                <p className="text-sm opacity-80 mb-4">
                  Your password has been updated successfully.
                </p>
              </div>

              {/* Redirect notification */}
              <div 
                className="p-4 rounded-xl border-2 mb-6"
                style={{ 
                  backgroundColor: `${themeColors.primary}10`,
                  borderColor: `${themeColors.primary}30`
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  {redirecting && (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" 
                         style={{ color: themeColors.primary }}>
                    </div>
                  )}
                  <span className="font-medium" style={{ color: themeColors.primary }}>
                    Redirecting to Login...
                  </span>
                </div>
                <p className="text-xs opacity-70">
                  Please login with your new password
                </p>
              </div>

              {/* Manual redirect button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                onClick={() => {
                  dispatch(logout());
                  navigate("/", { replace: true });
                }}
                className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center text-white"
                style={{ backgroundColor: themeColors.primary }}
              >
                Go to Login Now <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </motion.div>
          )}

          {/* Footer */}
          {step !== 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-sm opacity-60">
                Need help?{' '}
                <a
                  href="mailto:bookmyspace.today@gmail.com"
                  className="hover:underline font-medium"
                  style={{ color: themeColors.primary }}
                >
                  Contact Support
                </a>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChangePassword;