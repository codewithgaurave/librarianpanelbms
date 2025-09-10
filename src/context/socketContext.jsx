// src/context/SocketContext.jsx
import { io } from "socket.io-client";
import { createContext, useEffect } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
  reconnectionAttempts: 3,
  reconnectionDelay: 3000,
});

export const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.token) return;

    // Initialize socket with auth token
    socket.auth = { token: user.token };
    socket.connect();

    // Join role-specific room
    const room = getRoomForUser(user);
    socket.emit('join-room', room);

    // Setup event listeners
    setupBookingListeners(user.role);
    setupConnectionListeners();

    return () => {
      cleanupSocketListeners();
      socket.emit('leave-room', room);
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [user?.token, user?._id, user?.role, user?.libraryId]);

  // Helper functions
  const getRoomForUser = (user) => {
    switch(user.role) {
      case 'admin': return `admin-${user._id}`;
      case 'librarian': return `library-${user.libraryId}`;
      default: return `user-${user._id}`;
    }
  };

  const setupBookingListeners = (role) => {
    // Booking created event (for admins and librarians)
    socket.on('booking-created', (data) => {
      console.log("s",data)
      if (role === 'admin' || role === 'librarian') {
        toast.success("New Booking Created", {
          description: `User: ${data.user.name}\nSeat: ${data.seat.number}`,
          action: {
            label: "View",
            onClick: () => window.open(`/bookings/${data._id}`, "_blank")
          }
        });
      }
    });

    // Booking status updates (for all roles)
    socket.on('booking-status-changed', (data) => {
      const isMyBooking = data.user._id === user._id;
      const verb = data.status === 'confirmed' ? 'confirmed' : 
                  data.status === 'cancelled' ? 'cancelled' : 
                  'updated';
      
      if (isMyBooking || role !== 'user') {
        toast[getToastType(data.status)](`Booking ${verb}`, {
          description: `Seat: ${data.seat.number}\nStatus: ${data.status}`,
          ...(role !== 'user' && {
            action: {
              label: "Manage",
              onClick: () => window.open(`/bookings/${data._id}`)
            }
          })
        });
      }
    });

    // Payment updates (for booking user)
    socket.on('payment-processed', (data) => {
      if (data.user._id === user._id) {
        toast.success(`Payment ${data.status}`, {
          description: `Amount: ₹${data.amount}\nFor booking ${data.bookingId}`
        });
      }
    });
  };

  const getToastType = (status) => {
    switch(status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'error';
      case 'pending': return 'info';
      default: return 'info';
    }
  };

  const setupConnectionListeners = () => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      toast.warning("Disconnected", {
        description: "Reconnecting to real-time service..."
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      toast.error("Connection Error", {
        description: err.message || "Failed to connect to real-time updates"
      });
    });
  };

  const cleanupSocketListeners = () => {
    socket.off('booking-created');
    socket.off('booking-status-changed');
    socket.off('payment-processed');
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
  };

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};