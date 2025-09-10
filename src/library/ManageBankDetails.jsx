import React, { useEffect, useState } from "react";
import bankDetailsAPI from "../apis/bankDetailsAPI";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";

const ManageBankDetails = () => {
  const userData = useSelector((state) => state.auth.user);
  const { themeColors } = useTheme();
  const token = userData.token;
  const libraryId = userData?.library?._id;

  const [details, setDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await bankDetailsAPI.getBankDetailsById(libraryId, token);
        setDetails(res.data);
        setHasData(true);
        setForm({
          accountHolderName: res.data.accountHolderName || "",
          accountNumber: res.data.accountNumber || "",
          ifscCode: res.data.ifscCode || "",
          bankName: res.data.bankName || "",
          upiId: res.data.upiId || ""
        });
      } catch (err) {
        // If 404, it means no bank details exist yet
        if (err.response?.status === 404) {
          setHasData(false);
          setIsEditing(true); // Automatically enable edit mode for new entry
        } else {
          setError("Could not fetch bank details");
        }
      }
      setLoading(false);
    }
    if (libraryId) fetchDetails();
  }, [libraryId, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validation helpers
  const validateAccountNumber = (num) => /^[0-9]{9,18}$/.test(num);
  const validateIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
  const validateUPI = (upi) => upi === "" || /^[a-zA-Z0-9\.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate fields
    if (!validateAccountNumber(form.accountNumber)) {
      setError("Account number must be 9-18 digits.");
      return;
    }
    if (!validateIFSC(form.ifscCode)) {
      setError("Invalid IFSC code format. Example: SBIN0001234");
      return;
    }
    if (!validateUPI(form.upiId)) {
      setError("Invalid UPI ID format. Example: yourname@upi");
      return;
    }

    setLoading(true);
    try {
  const res = await bankDetailsAPI.upsertBankDetails(libraryId, form, token);
  setDetails(res.data);
  setHasData(true);
  setIsEditing(false);
  setSuccess("Bank details saved successfully!");
  setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update bank details");
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    if (hasData) {
      // Reset form to original data
      setForm({
        accountHolderName: details.accountHolderName || "",
        accountNumber: details.accountNumber || "",
        ifscCode: details.ifscCode || "",
        bankName: details.bankName || "",
        upiId: details.upiId || ""
      });
      setIsEditing(false);
    }
    setError("");
    setSuccess("");
  };

  if (loading && !hasData) {
    return (
      <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, textAlign: "center" }}>
        <div style={{
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          borderRadius: 16,
          background: themeColors.background,
          padding: 48
        }}>
          <div style={{ fontSize: 18, color: themeColors.text }}>Loading bank details...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24 }}>
      <div style={{
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        borderRadius: 16,
        background: themeColors.background,
        padding: 32,
        position: "relative"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 24, color: themeColors.text }}>
          <span style={{ verticalAlign: "middle", marginRight: 8 }}>
            <i className="ri-bank-line" style={{ fontSize: 28, color: themeColors.primary }}></i>
          </span>
          {hasData ? "Bank Details" : "Add Bank Details"}
        </h2>

        {/* Success Message */}
        {success && (
          <div style={{ 
            background: "#d1fae5", 
            color: "#065f46", 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 16, 
            textAlign: "center",
            border: "1px solid #86efac"
          }}>
            <i className="ri-check-circle-line" style={{ marginRight: 8 }}></i>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: "#fef2f2", 
            color: themeColors.primary, 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 16, 
            textAlign: "center",
            border: `1px solid ${themeColors.primary}`
          }}>
            <i className="ri-error-warning-line" style={{ marginRight: 8 }}></i>
            {error}
          </div>
        )}

        {/* No Data State */}
        {!hasData && !isEditing && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <i className="ri-bank-line" style={{ fontSize: 36, color: "#fff" }}></i>
            </div>
            <h3 style={{ color: themeColors.text, marginBottom: 12 }}>No Bank Details Found</h3>
            <p style={{ color: themeColors.text, opacity: 0.7, marginBottom: 24, lineHeight: 1.5 }}>
              You haven't added your bank details yet. Add them now to receive payments and manage your account.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: `0 4px 12px ${themeColors.primary}40`
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 6px 16px ${themeColors.primary}60`;
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 12px ${themeColors.primary}40`;
              }}
            >
              <i className="ri-add-line" style={{ marginRight: 8 }}></i>
              Add Bank Details
            </button>
          </div>
        )}

        {/* Display Mode */}
        {hasData && !isEditing && (
          <div>
            <div style={{ 
              background: themeColors.hover.background, 
              borderRadius: 12, 
              padding: 24,
              marginBottom: 20,
              border: `1px solid ${themeColors.primary}20`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h4 style={{ color: themeColors.primary, margin: 0, fontSize: 18 }}>
                  <i className="ri-information-line" style={{ marginRight: 8 }}></i>
                  Current Bank Details
                </h4>
                <button
                  onClick={handleEdit}
                  style={{
                    background: themeColors.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = themeColors.accent;
                    e.target.style.color = themeColors.text;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = themeColors.primary;
                    e.target.style.color = "#fff";
                  }}
                >
                  <i className="ri-edit-line" style={{ marginRight: 6 }}></i>
                  Edit
                </button>
              </div>
              
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${themeColors.primary}20` }}>
                  <span style={{ fontWeight: 500, color: themeColors.text }}>Account Holder:</span>
                  <span style={{ color: themeColors.text }}>{details.accountHolderName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${themeColors.primary}20` }}>
                  <span style={{ fontWeight: 500, color: themeColors.text }}>Account Number:</span>
                  <span style={{ color: themeColors.text, fontFamily: "monospace" }}>
                    {details.accountNumber}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${themeColors.primary}20` }}>
                  <span style={{ fontWeight: 500, color: themeColors.text }}>IFSC Code:</span>
                  <span style={{ color: themeColors.text, fontFamily: "monospace" }}>{details.ifscCode}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${themeColors.primary}20` }}>
                  <span style={{ fontWeight: 500, color: themeColors.text }}>Bank Name:</span>
                  <span style={{ color: themeColors.text }}>{details.bankName}</span>
                </div>
                {details.upiId && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ fontWeight: 500, color: themeColors.text }}>UPI ID:</span>
                    <span style={{ color: themeColors.text, fontFamily: "monospace" }}>{details.upiId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit/Add Form */}
        {isEditing && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ 
                fontWeight: 600, 
                color: themeColors.text, 
                display: "block", 
                marginBottom: 6,
                fontSize: 14
              }}>
                Account Holder Name *
              </label>
              <input 
                name="accountHolderName" 
                value={form.accountHolderName} 
                onChange={handleChange} 
                required
                placeholder="Enter full name as per bank records"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: 10, 
                  border: `2px solid ${themeColors.primary}30`, 
                  fontSize: 15,
                  transition: "border-color 0.2s",
                  outline: "none",
                  background: themeColors.background,
                  color: themeColors.text
                }} 
                onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                onBlur={(e) => e.target.style.borderColor = `${themeColors.primary}30`}
              />
            </div>

            <div>
              <label style={{ 
                fontWeight: 600, 
                color: themeColors.text, 
                display: "block", 
                marginBottom: 6,
                fontSize: 14
              }}>
                Account Number *
              </label>
              <input 
                name="accountNumber" 
                value={form.accountNumber} 
                onChange={handleChange} 
                required
                placeholder="Enter your bank account number"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: 10, 
                  border: `2px solid ${themeColors.primary}30`, 
                  fontSize: 15,
                  fontFamily: "monospace",
                  transition: "border-color 0.2s",
                  outline: "none",
                  background: themeColors.background,
                  color: themeColors.text
                }}
                onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                onBlur={(e) => e.target.style.borderColor = `${themeColors.primary}30`}
              />
            </div>

            <div>
              <label style={{ 
                fontWeight: 600, 
                color: themeColors.text, 
                display: "block", 
                marginBottom: 6,
                fontSize: 14
              }}>
                IFSC Code *
              </label>
              <input 
                name="ifscCode" 
                value={form.ifscCode} 
                onChange={handleChange} 
                required
                placeholder="e.g., SBIN0001234"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: 10, 
                  border: `2px solid ${themeColors.primary}30`, 
                  fontSize: 15,
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  transition: "border-color 0.2s",
                  outline: "none",
                  background: themeColors.background,
                  color: themeColors.text
                }}
                onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                onBlur={(e) => e.target.style.borderColor = `${themeColors.primary}30`}
              />
            </div>

            <div>
              <label style={{ 
                fontWeight: 600, 
                color: themeColors.text, 
                display: "block", 
                marginBottom: 6,
                fontSize: 14
              }}>
                Bank Name *
              </label>
              <input 
                name="bankName" 
                value={form.bankName} 
                onChange={handleChange} 
                required
                placeholder="Enter your bank name"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: 10, 
                  border: `2px solid ${themeColors.primary}30`, 
                  fontSize: 15,
                  transition: "border-color 0.2s",
                  outline: "none",
                  background: themeColors.background,
                  color: themeColors.text
                }}
                onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                onBlur={(e) => e.target.style.borderColor = `${themeColors.primary}30`}
              />
            </div>

            <div>
              <label style={{ 
                fontWeight: 600, 
                color: themeColors.text, 
                display: "block", 
                marginBottom: 6,
                fontSize: 14
              }}>
                UPI ID <span style={{ color: themeColors.text, opacity: 0.6, fontWeight: 400 }}>(optional)</span>
              </label>
              <input 
                name="upiId" 
                value={form.upiId} 
                onChange={handleChange}
                placeholder="yourname@upi"
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  borderRadius: 10, 
                  border: `2px solid ${themeColors.primary}30`, 
                  fontSize: 15,
                  fontFamily: "monospace",
                  transition: "border-color 0.2s",
                  outline: "none",
                  background: themeColors.background,
                  color: themeColors.text
                }}
                onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                onBlur={(e) => e.target.style.borderColor = `${themeColors.primary}30`}
              />
            </div>

            {/* Form Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  background: loading ? "#a0aec0" : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px 0",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: loading ? "not-allowed" : "pointer",
                  flex: 1,
                  transition: "all 0.2s",
                  boxShadow: loading ? "none" : `0 4px 12px ${themeColors.primary}40`
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = `0 6px 16px ${themeColors.primary}60`;
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = `0 4px 12px ${themeColors.primary}40`;
                  }
                }}
              >
                {loading ? (
                  <>
                    <i className="ri-loader-line" style={{ marginRight: 8, animation: "spin 1s linear infinite" }}></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line" style={{ marginRight: 8 }}></i>
                    {hasData ? "Update Details" : "Save Details"}
                  </>
                )}
              </button>

              {hasData && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: themeColors.hover.background,
                    color: themeColors.text,
                    border: `2px solid ${themeColors.primary}30`,
                    borderRadius: 10,
                    padding: "14px 24px",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = themeColors.active.background;
                    e.target.style.borderColor = themeColors.primary;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = themeColors.hover.background;
                    e.target.style.borderColor = `${themeColors.primary}30`;
                  }}
                >
                  <i className="ri-close-line" style={{ marginRight: 8 }}></i>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Security Notice */}
        {/* {(isEditing || !hasData) && (
          <div style={{
            background: `${themeColors.accent}20`,
            border: `1px solid ${themeColors.accent}40`,
            borderRadius: 10,
            padding: 16,
            marginTop: 20,
            fontSize: 14
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <i className="ri-shield-check-line" style={{ color: themeColors.primary, fontSize: 16, marginTop: 2 }}></i>
              <div style={{ color: themeColors.text, lineHeight: 1.4 }}>
                <strong>Security Notice:</strong> Your bank details are encrypted and stored securely. 
                We never share this information with third parties.
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* Add some CSS for the loading animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManageBankDetails;