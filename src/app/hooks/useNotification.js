'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useApi } from '../services/axios';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();


export function NotificationProvider({ children }) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);


  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      if (Array.isArray(data)) {
        setNotifications(data.map(n => ({
          id: n.id,
          sender_name: n.recipient?.username || 'Unknown',
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
    loading
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
