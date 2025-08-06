'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useApi } from '../services/axios';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { api } = useApi();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data.map(n => ({
          id: n.id,
          sender_name: n.recipient?.username || 'System',
          avatar: n.recipient?.avatar,
          text: n.message,
          description: n.data?.type?.replace('_', ' ').toUpperCase(),
          is_read: n.read,
          created_at: n.created_at,
        })));
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket connection when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const access = localStorage.getItem('access');
    const ws = new window.WebSocket(`ws://localhost:8000/ws/notifications/?token=${access}`);

    wsRef.current = ws;

    ws.onopen = () => {
      // Optionally: console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Assuming data matches your sample
        if (data?.message) {
          toast(
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm">{data.message}</p>
              </div>
            </div>,
            {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              className: 'notification-toast',
              onClick: () => setIsNotificationVisible(true)
            }
          );
          new Audio('/assets/notification.wav').play();
        }
        setNotifications(prev => [
          {
            id: data.id,
            sender_name: 'System',
            avatar: null,
            text: data.message,
            description: data.data?.type?.replace('_', ' ').toUpperCase(),
            is_read: data.read,
            created_at: data.created_at,
          },
          ...prev,
        ]);
        setUnreadCount(prev => prev + 1);
      } catch (e) {
        // Handle JSON error
      }
    };

    ws.onerror = () => {
      // Optionally: toast.error('Notification connection error');
    };

    ws.onclose = () => {
      // Optionally: console.log('WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated]);

  // Fetch on demand (and when opening modal)
  useEffect(() => {
    if (isAuthenticated && isNotificationVisible) {
      fetchNotifications();
    }
  }, [isAuthenticated, isNotificationVisible]);

  const toggleNotification = () => setIsNotificationVisible((v) => !v);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { read: true });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // handle error or toast
    }
  };

  const value = {
    isNotificationVisible,
    toggleNotification,
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
