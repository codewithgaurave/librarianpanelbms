import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import passwordAPI from "../apis/passwordAPI";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, Shield } from "lucide-react";

const ForgotPassword = () => {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await passwordAPI.forgotPassword(email);
      console.log(res);
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordAPI.resetPassword(email, otp, newPassword);
      toast.success("Password reset successfully");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
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
                  <Mail className="w-8 h-8" style={{ color: themeColors.primary }} />
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
                  className="w-full h-full flex items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: themeColors.primary }} />
                </div>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify & Reset"}
              {step === 3 && "Success!"}
            </h1>
            
            <p className="text-sm opacity-80">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the OTP and your new password"}
              {step === 3 && "Your password has been reset successfully"}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label htmlFor="email" className="text-sm font-medium block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:outline-none border"
                      style={{
                        backgroundColor: "#f9fafb",
                        borderColor: "#ccc",
                        focusRingColor: themeColors.primary,
                      }}
                      placeholder="Enter your email address"
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
                      Send Reset Code <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                onClick={() => navigate('/login')}
                className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center border-2"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: `${themeColors.accent}50`,
                  color: themeColors.accent,
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: OTP and New Password */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleResetPassword} className="space-y-6">
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
                      Reset Password <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                onClick={() => navigate('/login')}
                className="w-full mt-4 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center border-2"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: `${themeColors.accent}50`,
                  color: themeColors.accent,
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-6">
                <div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <CheckCircle2 
                    className="w-10 h-10" 
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Password Reset Complete!</h3>
                <p className="text-sm opacity-80">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center text-white"
                style={{ backgroundColor: themeColors.primary }}
              >
                Continue to Login <ArrowRight className="w-4 h-4 ml-2" />
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

export default ForgotPassword;