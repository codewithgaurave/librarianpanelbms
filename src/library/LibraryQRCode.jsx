import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaDownload, FaQrcode, FaSync, FaInfoCircle } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import libraryAPI from '../apis/libraryAPI';
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook

const LibraryQRCode = () => {
    const { theme, themeColors } = useTheme(); // Get theme and themeColors from context
    const { token, library } = useSelector(state => state.auth.user);
    const { _id: libraryId, libraryName = 'Library' } = library || {};
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Apply theme styles
    const containerStyles = {
        backgroundColor: themeColors.background,
        color: themeColors.text,
    };

    const cardStyles = {
        backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
    };

    const buttonPrimaryStyles = {
        backgroundColor: themeColors.primary,
        color: '#ffffff',
        hoverBackgroundColor: themeColors.hover.background,
    };

    const buttonSecondaryStyles = {
        backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
        color: theme === 'light' ? '#374151' : '#f3f4f6',
        hoverBackgroundColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
    };

    const infoBoxStyles = {
        backgroundColor: theme === 'light' ? '#f9fafb' : '#111827',
        borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
    };

    const fetchQRCode = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await libraryAPI.getLibraryQrCode(token);
            
            if (!data?.success || !data?.data?.qrCodeUrl) {
                throw new Error(data?.message || 'Invalid QR code response');
            }

            setQrData(data.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || 'Failed to load QR code');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQRCode(); }, [token, libraryId]);

    const handleDownload = async () => {
        try {
            const response = await fetch(qrData.qrCodeUrl);
            if (!response.ok) throw new Error('QR code not found');
            const blob = await response.blob();
            saveAs(blob, `${libraryName.replace(/\s+/g, '-')}-qrcode.png`);
            toast.success('QR code downloaded');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div 
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
                    style={{ borderColor: themeColors.primary }}
                />
                <p style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Loading QR code...</p>
            </div>
        );

        if (error) return (
            <div 
                className="border-l-4 p-4 rounded-lg" 
                style={{ 
                    backgroundColor: theme === 'light' ? '#fef2f2' : '#2c1a1a',
                    borderColor: '#ef4444'
                }}
            >
                <div className="flex items-start">
                    <FaInfoCircle className="flex-shrink-0 h-5 w-5 mt-0.5" style={{ color: '#ef4444' }} />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium" style={{ color: '#ef4444' }}>Error loading QR code</h3>
                        <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>{error}</p>
                        <button 
                            onClick={fetchQRCode} 
                            className="mt-3 inline-flex items-center px-3 py-1 text-sm rounded-md hover:opacity-90"
                            style={{ 
                                backgroundColor: '#ef4444',
                                color: '#ffffff'
                            }}
                        >
                            <FaSync className="mr-2" /> Try Again
                        </button>
                    </div>
                </div>
            </div>
        );

        if (qrData) return (
            <div className="flex flex-col items-center space-y-4">
                <div 
                    className="px-8 pt-8 rounded-lg border-2" 
                    style={{ 
                        backgroundColor: '#ffffff', // QR code background should always be white
                        borderColor: theme === 'light' ? '#e5e7eb' : '#374151'
                    }}
                >
                    <img 
                        src={`${import.meta.env.VITE_BASE_API}/uploads/${qrData.qrCodePath}`} 
                        alt={`${libraryName} QR Code`} 
                        className="w-64 h-64" 
                    />
                </div>
                <div className="flex space-x-4">
                    <button 
                        onClick={handleDownload} 
                        className="flex items-center px-4 py-2 rounded-lg hover:opacity-90"
                        style={buttonPrimaryStyles}
                    >
                        <FaDownload className="mr-2" /> Download
                    </button>
                    <button 
                        onClick={fetchQRCode} 
                        className="flex items-center px-4 py-2 rounded-lg hover:opacity-90"
                        style={buttonSecondaryStyles}
                    >
                        <FaSync className="mr-2" /> Refresh
                    </button>
                </div>
                <div 
                    className="p-4 rounded-lg w-full"
                    style={infoBoxStyles}
                >
                    <h3 className="font-medium" style={{ color: themeColors.text }}>Library Information</h3>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Name: {libraryName}</p>
                    <p className="text-sm" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>ID: <span className="font-mono">{libraryId}</span></p>
                </div>
            </div>
        );

        return (
            <div className="text-center py-8">
                <div 
                    className="border-l-4 p-4 rounded-lg" 
                    style={{ 
                        backgroundColor: theme === 'light' ? '#fffbeb' : '#3a2a0a',
                        borderColor: '#f59e0b'
                    }}
                >
                    <div className="flex items-start">
                        <FaInfoCircle className="flex-shrink-0 h-5 w-5 mt-0.5" style={{ color: '#f59e0b' }} />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium" style={{ color: '#f59e0b' }}>QR Code Not Available</h3>
                            <button 
                                onClick={fetchQRCode} 
                                className="mt-2 inline-flex items-center px-3 py-1 text-sm rounded-md hover:opacity-90"
                                style={{ 
                                    backgroundColor: '#f59e0b',
                                    color: '#ffffff'
                                }}
                            >
                                <FaSync className="mr-2" /> Generate QR Code
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="max-w-md mx-auto rounded-xl shadow-md overflow-hidden p-6"
            style={cardStyles}
        >
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2" style={{ color: themeColors.text }}>
                    <FaQrcode style={{ color: themeColors.primary }} /> Library QR Code
                </h2>
                <p className="mt-1" style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>Scan this QR code to view library details</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default LibraryQRCode;