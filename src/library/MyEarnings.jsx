import React, { useEffect, useState } from "react";
import earningAPI from "../apis/earningAPI";
import withdrawRequestAPI from "../apis/withdrawRequestAPI";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";

const MyEarnings = () => {
  const userData = useSelector((state) => state.auth.user);
  const { themeColors } = useTheme();
  const token = userData?.token;
  const libraryId = userData?.library?._id;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchEarnings() {
      setLoading(true);
      try {
        const res = await earningAPI.getMyEarningsByLibrary(libraryId, token);
        setData(res.data);
      } catch (err) {
        toast.error("Failed to fetch earnings");
      }
      setLoading(false);
    }
    if (libraryId && token) fetchEarnings();
  }, [libraryId, token]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (Number(withdrawAmount) > data?.stats?.withdrawableAmount) {
      toast.error("Amount exceeds withdrawable balance");
      return;
    }
    setWithdrawLoading(true);
    try {
      await withdrawRequestAPI.createWithdrawRequest({ libraryId, requestedAmount: Number(withdrawAmount) }, token);
      toast.success("Withdraw request submitted");
      setWithdrawAmount("");
      // Refresh earnings to show updated pending amount
      const res = await earningAPI.getMyEarningsByLibrary(libraryId, token);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit withdraw request");
    }
    setWithdrawLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#38a169";
      case "confirmed": return themeColors.primary;
      case "missed": return "#e53e3e";
      case "pending": return themeColors.accent;
      case "resolved": return "#38a169";
      case "rejected": return "#e53e3e";
      default: return themeColors.text;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "completed": return "#c6f6d5";
      case "confirmed": return `${themeColors.primary}20`;
      case "missed": return "#fed7d7";
      case "pending": return `${themeColors.accent}20`;
      case "resolved": return "#c6f6d5";
      case "rejected": return "#fed7d7";
      default: return themeColors.hover.background;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: 1200, 
        margin: "40px auto", 
        padding: 24, 
        textAlign: "center" 
      }}>
        <div style={{
          background: themeColors.background,
          borderRadius: 16,
          padding: 48,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <i className="ri-loader-line" style={{ 
            fontSize: 32, 
            color: themeColors.primary, 
            animation: "spin 1s linear infinite" 
          }}></i>
          <div style={{ 
            fontSize: 18, 
            color: themeColors.text, 
            marginTop: 16 
          }}>
            Loading earnings data...
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, earningHistory, withdrawHistory } = data;

  return (
    <div style={{ maxWidth: "100%", margin: "40px auto", padding: 24 }}>
      {/* Header */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: 32,
        background: themeColors.background,
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{ 
          color: themeColors.text, 
          margin: 0,
          fontSize: 28,
          fontWeight: 700
        }}>
          <i className="ri-money-dollar-circle-line" style={{ 
            color: themeColors.primary, 
            marginRight: 12,
            fontSize: 32
          }}></i>
           Earnings Dashboard
        </h2>
        <p style={{ 
          color: themeColors.text, 
          opacity: 0.7, 
          margin: "8px 0 0 0",
          fontSize: 16
        }}>
          Track your revenue and manage withdrawals
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: 20, 
        marginBottom: 32 
      }}>
        <div style={{ 
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
          borderRadius: 16, 
          padding: 24, 
          color: "#fff",
          boxShadow: `0 8px 25px ${themeColors.primary}30`,
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1, fontSize: 80 }}>
            <i className="ri-coins-line"></i>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 500, opacity: 0.9 }}>Total Revenue</h4>
            <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0", display: 'flex', alignItems: 'center', gap: 4 }}>
              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-7 h-7 inline rounded-full mr-1" />
              {stats.totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              <i className="ri-arrow-up-line"></i> All time earnings
            </div>
          </div>
        </div>

        <div style={{ 
          background: themeColors.background,
          border: `2px solid #38a169`,
          borderRadius: 16, 
          padding: 24,
          boxShadow: "0 8px 25px rgba(56, 161, 105, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1, fontSize: 80, color: "#38a169" }}>
            <i className="ri-wallet-3-line"></i>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: themeColors.text }}>Withdrawable Amount</h4>
            <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0", color: "#38a169", display: 'flex', alignItems: 'center', gap: 4 }}>
              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-7 h-7 inline rounded-full mr-1" />
              {stats.withdrawableAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.7 }}>
              <i className="ri-download-line"></i> Available for withdrawal
            </div>
          </div>
        </div>

        <div style={{ 
          background: themeColors.background,
          border: `2px solid #e53e3e`,
          borderRadius: 16, 
          padding: 24,
          boxShadow: "0 8px 25px rgba(229, 62, 62, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1, fontSize: 80, color: "#e53e3e" }}>
            <i className="ri-hand-coin-line"></i>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: themeColors.text }}>Withdrawn Amount</h4>
            <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0", color: "#e53e3e", display: 'flex', alignItems: 'center', gap: 4 }}>
              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-7 h-7 inline rounded-full mr-1" />
              {stats.withdrawnAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.7 }}>
              <i className="ri-check-line"></i> Successfully withdrawn
            </div>
          </div>
        </div>

        <div style={{ 
          background: themeColors.background,
          border: `2px solid #d69e2e`,
          borderRadius: 16, 
          padding: 24,
          boxShadow: "0 8px 25px rgba(214, 158, 46, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1, fontSize: 80, color: "#d69e2e" }}>
            <i className="ri-time-line"></i>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: themeColors.text }}>Pending Withdraw</h4>
            <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0", color: "#d69e2e", display: 'flex', alignItems: 'center', gap: 4 }}>
              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-7 h-7 inline rounded-full mr-1" />
              {stats.pendingWithdrawAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.7 }}>
              <i className="ri-hourglass-line"></i> Under review
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 16, 
        marginBottom: 32 
      }}>
        <div style={{ 
          background: themeColors.background,
          border: `1px solid ${themeColors.primary}30`,
          borderRadius: 12, 
          padding: 20,
          textAlign: "center"
        }}>
          <i className="ri-calendar-check-line" style={{ fontSize: 24, color: themeColors.primary, marginBottom: 8 }}></i>
          <h5 style={{ margin: 0, color: themeColors.text, fontSize: 14 }}>One-Time Bookings</h5>
          <div style={{ fontSize: 20, fontWeight: 600, color: themeColors.primary, marginTop: 4 }}>
            <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 inline rounded-full mr-1" />
            {stats.totalEarningFromOneTimeBooking.toLocaleString()}
          </div>
        </div>
        <div style={{ 
          background: themeColors.background,
          border: `1px solid ${themeColors.primary}30`,
          borderRadius: 12, 
          padding: 20,
          textAlign: "center"
        }}>
          <i className="ri-calendar-line" style={{ fontSize: 24, color: themeColors.accent, marginBottom: 8 }}></i>
          <h5 style={{ margin: 0, color: themeColors.text, fontSize: 14 }}>Monthly Bookings</h5>
          <div style={{ fontSize: 20, fontWeight: 600, color: themeColors.accent, marginTop: 4 }}>
            <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 inline rounded-full mr-1" />
            {stats.totalEarningFromOneTimeMonthlyBooking.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Withdraw Section */}
      <div style={{
        background: themeColors.background,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: `1px solid ${themeColors.primary}20`
      }}>
        <h3 style={{ 
          color: themeColors.text, 
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <i className="ri-bank-card-line" style={{ color: themeColors.primary }}></i>
          Request Withdrawal
        </h3>
        
        <form onSubmit={handleWithdraw} style={{ 
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          gap: 12,
          alignItems: window.innerWidth < 768 ? "stretch" : "center",
          justifyContent: "flex-start",
          width: "100%"
        }}>
          <div style={{ 
            display: "flex", 
            flex: 1, 
            alignItems: window.innerWidth < 768 ? "stretch" : "center", 
            gap: 12, 
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            width: "100%"
          }}>
            <div style={{ flex: 1 }}>
            <label style={{ 
              display: "block", 
              marginBottom: 6, 
              fontSize: 14, 
              fontWeight: 500, 
              color: themeColors.text 
            }}>
              Amount to Withdraw
            </label>
            <input
              type="number"
              min="1"
              max={stats.withdrawableAmount}
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ 
                width: "100%",
                padding: "12px 16px", 
                borderRadius: 10, 
                border: `2px solid ${themeColors.primary}30`, 
                fontSize: 16,
                outline: "none",
                background: themeColors.background,
                color: themeColors.text,
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = themeColors.primary}
              onBlur={(e) => e.target.style.borderColor = `${themeColors.primary}30`}
            />
            <div
            className="flex"
             style={{ 
              fontSize: 12, 
              color: themeColors.text, 
              opacity: 0.6, 
              marginTop: 4 
            }}>
              Max:&nbsp;<img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 rounded-full" />{stats.withdrawableAmount.toLocaleString()}
            </div>
          </div>
          <button
            type="submit"
            disabled={withdrawLoading || !withdrawAmount}
            style={{ 
              background: withdrawLoading || !withdrawAmount ? "#a0aec0" : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`,
              color: "#fff", 
              border: "none", 
              borderRadius: 10, 
              padding: "12px 32px", 
              fontWeight: 600, 
              fontSize: 16, 
              cursor: withdrawLoading || !withdrawAmount ? "not-allowed" : "pointer",
              height: "fit-content",
              whiteSpace: "nowrap",
              boxShadow: withdrawLoading || !withdrawAmount ? "none" : `0 4px 12px ${themeColors.primary}40`,
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (!withdrawLoading && withdrawAmount) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = `0 6px 16px ${themeColors.primary}60`;
              }
            }}
            onMouseOut={(e) => {
              if (!withdrawLoading && withdrawAmount) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 12px ${themeColors.primary}40`;
              }
            }}
          >
            {withdrawLoading ? (
              <>
                <i className="ri-loader-line" style={{ marginRight: 8, animation: "spin 1s linear infinite" }}></i>
                Processing...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line" style={{ marginRight: 8 }}></i>
                Withdraw
              </>
            )}
          </button>
                    </div>
        </form>
            </div>

      {/* Navigation Tabs */}
      <div
        className="rounded-2xl shadow-md overflow-hidden mb-8"
        style={{ background: themeColors.background }}
      >
        <div
          className="flex flex-wrap border-b overflow-x-auto scrollbar-hide"
          style={{ borderBottom: `1px solid ${themeColors.primary}20` }}
        >
          {["overview", "earnings", "withdrawals"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[120px] py-4 px-3 text-base font-semibold capitalize transition-colors duration-200 focus:outline-none ${activeTab === tab ? "" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              style={{
                background: activeTab === tab ? themeColors.primary : themeColors.background,
                color: activeTab === tab ? "#fff" : themeColors.text,
              }}
            >
              <i className={`ri-${tab === "overview" ? "dashboard" : tab === "earnings" ? "money-dollar" : "bank"}-line mr-2`}></i>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              {/* Responsive: Cards for mobile/tablet, grid for desktop */}
              {window.innerWidth < 768 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  {/* Recent Earnings as cards */}
                  {earningHistory.slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{
                      background: themeColors.hover.background,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${themeColors.primary}20`,
                      marginBottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.user.profileImage ? (
                          <img src={"/img/" + item.user.profileImage} alt={item.user.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: themeColors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                            {item.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 500, color: themeColors.text }}>{item.user.name}</div>
                          <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.6 }}>{item.user.email}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, color: themeColors.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-4 h-4 inline rounded-full mr-1" />
                          {item.amount}
                        </div>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: getStatusBg(item.status), color: getStatusColor(item.status) }}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                  {/* Recent Withdrawals as cards */}
                  {withdrawHistory.length > 0 ? withdrawHistory.slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{
                      background: themeColors.hover.background,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${themeColors.primary}20`,
                      marginBottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: themeColors.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-4 h-4 inline rounded-full mr-1" />
                          {item.amount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.6 }}>{new Date(item.requestedAt).toLocaleDateString()}</div>
                      </div>
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, background: getStatusBg(item.status), color: getStatusColor(item.status), fontWeight: 500 }}>{item.status}</span>
                    </div>
                  )) : (
                    <div style={{ textAlign: "center", padding: 20, color: themeColors.text, opacity: 0.6 }}>
                      <i className="ri-inbox-line" style={{ fontSize: 32, marginBottom: 8, display: "block" }}></i>
                      No withdrawals yet
                    </div>
                  )}
                </div>
              ) : (
                // Desktop: keep grid format
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 24 }}>
                  {/* Recent Earnings */}
                  <div style={{ background: themeColors.hover.background, borderRadius: 12, padding: 20, border: `1px solid ${themeColors.primary}20` }}>
                    <h4 style={{ color: themeColors.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="ri-history-line" style={{ color: themeColors.primary }}></i>
                      Recent Earnings
                    </h4>
                    <div style={{ maxHeight: 500, overflowY: "auto" }}>
                      {earningHistory.slice(0, 20).map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < 4 ? `1px solid ${themeColors.primary}10` : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {item.user.profileImage ? (
                              <img src={"/img/" + item.user.profileImage} alt={item.user.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: themeColors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>
                                {item.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontSize: 14, color: themeColors.text }}>{item.user.name}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 600, color: themeColors.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-4 h-4 inline rounded-full mr-1" />
                              {item.amount}
                            </div>
                            <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: getStatusBg(item.status), color: getStatusColor(item.status) }}>{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Recent Withdrawals */}
                  <div style={{ background: themeColors.hover.background, borderRadius: 12, padding: 20, border: `1px solid ${themeColors.primary}20` }}>
                    <h4 style={{ color: themeColors.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="ri-exchange-dollar-line" style={{ color: themeColors.accent }}></i>
                      Recent Withdrawals
                    </h4>
                    <div style={{ maxHeight: 500, overflowY: "auto" }}>
                      {withdrawHistory.length > 0 ? withdrawHistory.slice(0, 20).map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < Math.min(withdrawHistory.length - 1, 4) ? `1px solid ${themeColors.primary}10` : "none" }}>
                          <div>
                            <div style={{ fontWeight: 600, color: themeColors.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-4 h-4 inline rounded-full mr-1" />
                              {item.amount.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.6 }}>{new Date(item.requestedAt).toLocaleDateString()}</div>
                          </div>
                          <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, background: getStatusBg(item.status), color: getStatusColor(item.status), fontWeight: 500 }}>{item.status}</span>
                        </div>
                      )) : (
                        <div style={{ textAlign: "center", padding: 20, color: themeColors.text, opacity: 0.6 }}>
                          <i className="ri-inbox-line" style={{ fontSize: 32, marginBottom: 8, display: "block" }}></i>
                          No withdrawals yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Earnings History Tab */}
          {activeTab === "earnings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ color: themeColors.text, margin: 0 }}>
                  <i className="ri-money-dollar-box-line" style={{ color: themeColors.primary, marginRight: 8 }}></i>
                  Earning History
                </h3>
                <div style={{ background: themeColors.hover.background, padding: "8px 12px", borderRadius: 8, fontSize: 14, color: themeColors.text }}>
                  Total: {earningHistory.length} transactions
                </div>
              </div>
              {window.innerWidth < 768 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {earningHistory.map((item, idx) => (
                    <div key={idx} style={{ background: `${themeColors.accent}10`, borderRadius: 16, padding: 18, border: `1px solid ${themeColors.primary}20`, display: "flex", flexDirection: "column", gap: 12, boxShadow: `0 2px 8px ${themeColors.primary}10` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        {item.user.profileImage ? (
                          <img src={"/img/" + item.user.profileImage} alt={item.user.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: themeColors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
                            {item.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: themeColors.text, fontSize: 17, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.user.name}</div>
                          <div style={{ fontSize: 13, color: themeColors.text, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.user.email}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 2 }}>
                        <span style={{ fontWeight: 700, color: themeColors.primary, fontSize: 18, display: 'flex', alignItems: 'center', gap: 4, background: `${themeColors.primary}10`, borderRadius: 12, padding: "4px 10px" }}>
                          <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-5 h-5 inline rounded-full mr-1" />
                          {item.amount.toLocaleString()}
                        </span>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: item.type === "monthly" ? `${themeColors.accent}30` : `${themeColors.primary}20`, color: item.type === "monthly" ? themeColors.accent : themeColors.primary, display: "flex", alignItems: "center", gap: 4 }}>
                          <i className={`ri-${item.type === "monthly" ? "calendar" : "calendar-check"}-line`} style={{ marginRight: 4 }}></i>
                          {item.type === "monthly" ? "Monthly" : "Single"}
                        </span>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: getStatusBg(item.status), color: getStatusColor(item.status), display: "flex", alignItems: "center" }}>{item.status}</span>
                        <span style={{ color: themeColors.text, fontSize: 13, background: `${themeColors.primary}05`, borderRadius: 8, padding: "2px 8px" }}>
                          {item.type === "monthly" 
                            ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}` 
                            : new Date(item.bookingDate).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${themeColors.primary}20` }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", background: themeColors.background, minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: themeColors.hover.background }}>
                        <th style={{ padding: "16px 12px", textAlign: "left", color: themeColors.text, fontWeight: 600 }}>User</th>
                        <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Type</th>
                        <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Status</th>
                        <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earningHistory.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${themeColors.primary}10`, transition: "background 0.2s" }}
                        onMouseOver={(e) => e.currentTarget.style.background = themeColors.hover.background}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {item.user.profileImage ? (
                                <img src={"/img/" + item.user.profileImage} alt={item.user.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.accent} 100%)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                                  {item.user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 500, color: themeColors.text }}>{item.user.name}</div>
                                <div style={{ fontSize: 12, color: themeColors.text, opacity: 0.6 }}>{item.user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ fontWeight: 600, color: themeColors.primary, fontSize: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-4 h-4 inline rounded-full mr-1" />
                              {item.amount.toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: item.type === "monthly" ? `${themeColors.accent}20` : `${themeColors.primary}20`, color: item.type === "monthly" ? themeColors.accent : themeColors.primary }}>
                              <i className={`ri-${item.type === "monthly" ? "calendar" : "calendar-check"}-line`} style={{ marginRight: 4 }}></i>
                              {item.type === "monthly" ? "Monthly" : "Single"}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: getStatusBg(item.status), color: getStatusColor(item.status) }}>{item.status}</span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: themeColors.text, fontSize: 14 }}>
                            {item.type === "monthly" 
                              ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}` 
                              : new Date(item.bookingDate).toLocaleDateString()
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Withdraw History Tab */}
          {activeTab === "withdrawals" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ color: themeColors.text, margin: 0 }}>
                  <i className="ri-exchange-box-line" style={{ color: themeColors.accent, marginRight: 8 }}></i>
                  Withdrawal History
                </h3>
                <div style={{ background: themeColors.hover.background, padding: "8px 12px", borderRadius: 8, fontSize: 14, color: themeColors.text }}>
                  Total: {withdrawHistory.length} requests
                </div>
              </div>
              {window.innerWidth < 768 ? (
                withdrawHistory.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {withdrawHistory.map((item, idx) => (
                      <div key={idx} style={{ background: themeColors.hover.background, borderRadius: 12, padding: 16, border: `1px solid ${themeColors.primary}20`, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-6 h-6 rounded-full" />
                          <span style={{ fontWeight: 600, color: themeColors.primary, fontSize: 16 }}>{item.amount.toLocaleString()}</span>
                          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: getStatusBg(item.status), color: getStatusColor(item.status) }}>{item.status}</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 13, color: themeColors.text, opacity: 0.8 }}>
                          <span>Requested: {item.requestedAt ? new Date(item.requestedAt).toLocaleString() : "-"}</span>
                          <span>Resolved: {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : "-"}</span>
                          <span>Reason: {item.rejectedReason || "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: themeColors.text, opacity: 0.6, background: themeColors.hover.background, borderRadius: 12 }}>
                    <i className="ri-inbox-line" style={{ fontSize: 48, marginBottom: 16, display: "block" }}></i>
                    <h4 style={{ margin: "0 0 8px 0" }}>No withdrawal requests yet</h4>
                    <p style={{ margin: 0 }}>Your withdrawal history will appear here once you make requests</p>
                  </div>
                )
              ) : (
                withdrawHistory.length > 0 ? (
                  <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${themeColors.primary}20` }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", background: themeColors.background, minWidth: 700 }}>
                      <thead>
                        <tr style={{ background: themeColors.hover.background }}>
                          <th style={{ padding: "16px 12px", textAlign: "left", color: themeColors.text, fontWeight: 600 }}>Amount</th>
                          <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Status</th>
                          <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Requested At</th>
                          <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Resolved At</th>
                          <th style={{ padding: "16px 12px", textAlign: "center", color: themeColors.text, fontWeight: 600 }}>Rejected Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawHistory.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: `1px solid ${themeColors.primary}10`, transition: "background 0.2s" }}
                          onMouseOver={(e) => e.currentTarget.style.background = themeColors.hover.background}
                          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <td className="flex gap-2" style={{ padding: "12px", textAlign: "center" }}>
                              <img src='/img/bms_coin.jpg' alt='bms_coin' className="w-6 h-6 rounded-full" />
                              <span style={{ fontWeight: 600, color: themeColors.primary, fontSize: 16 }}>{item.amount.toLocaleString()}</span>
                            </td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: getStatusBg(item.status), color: getStatusColor(item.status) }}>{item.status}</span>
                            </td>
                            <td style={{ padding: "12px", textAlign: "center", color: themeColors.text, fontSize: 14 }}>
                              {item.requestedAt ? new Date(item.requestedAt).toLocaleString() : "-"}
                            </td>
                            <td style={{ padding: "12px", textAlign: "center", color: themeColors.text, fontSize: 14 }}>
                              {item.resolvedAt ? new Date(item.resolvedAt).toLocaleString() : "-"}
                            </td>
                            <td style={{ padding: "12px", textAlign: "center", color: themeColors.text, fontSize: 14 }}>
                              {item.rejectedReason || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: themeColors.text, opacity: 0.6, background: themeColors.hover.background, borderRadius: 12 }}>
                    <i className="ri-inbox-line" style={{ fontSize: 48, marginBottom: 16, display: "block" }}></i>
                    <h4 style={{ margin: "0 0 8px 0" }}>No withdrawal requests yet</h4>
                    <p style={{ margin: 0 }}>Your withdrawal history will appear here once you make requests</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .tab-button {
              font-size: 14px;
              padding: 12px 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyEarnings;