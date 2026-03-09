import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const markAsRead = (id) => {
        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    useEffect(() => {
        let newSocket;

        if (user) {
            // Connect to server
            newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected globally');
                // Join the user's specific room
                newSocket.emit('joinUserRoom', user._id);
            });

            // Listen for global booking updates
            newSocket.on('bookingUpdated', (data) => {
                console.log('Global booking update received:', data);

                let title = '';
                let message = '';
                let type = 'info';

                if (data.status === 'active') {
                    title = 'Booking Active';
                    message = `Your booking ${data.bookingId.substring(0, 8)} is now Active!`;
                    type = 'success';
                    toast.success(message, { duration: 5000, icon: '🟢' });
                } else if (data.status === 'completed') {
                    title = 'Checkout Complete';
                    message = `You have checked out.`;
                    if (data.extra_charges > 0) {
                        message += ` Extra charges: Rs. ${data.extra_charges}`;
                        type = 'error';
                        toast.error(message, { duration: 6000, icon: '🛑' });
                    } else {
                        type = 'success';
                        toast.success(message, { duration: 5000, icon: '✅' });
                    }
                } else if (data.status === 'cancelled') {
                    title = 'Booking Cancelled';
                    message = `Your booking ${data.bookingId.substring(0, 8)} was cancelled.`;
                    type = 'error';
                    toast.error(message, { duration: 5000 });
                } else if (data.status === 'cancelled_noshow') {
                    title = 'Booking No-Show';
                    message = `Booking ${data.bookingId.substring(0, 8)} cancelled due to No-show.`;
                    type = 'warning';
                    toast.error(message, { duration: 6000, icon: '⚠️' });
                }

                if (title) {
                    const newNotif = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        title,
                        message,
                        type,
                        time: new Date(),
                        read: false,
                        bookingId: data.bookingId
                    };
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            });
        }

        return () => {
            if (newSocket) {
                newSocket.off('bookingUpdated');
                newSocket.disconnect();
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};
