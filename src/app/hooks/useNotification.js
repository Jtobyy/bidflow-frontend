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
  const [loading, setLoading] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);

  const { api } = useApi();
  const { isAuthenticated } = useAuth();
  const wsRef = useRef(null);

  // ------- Helpers
  const normalize = (n) => ({
    id: n.id,
    sender_name: n.recipient?.username || 'System',
    avatar: n.recipient?.avatar || null,
    text: n.message,
    description: String(n?.data?.type || '')
      .replace(/_/g, ' ')
      .toUpperCase(),
    is_read: !!n.read,
    created_at: n.created_at,
  });

  const recalcUnread = (items) =>
    items.reduce((acc, curr) => acc + (curr.is_read ? 0 : 1), 0);

  // ------- Fetch (page 1 or arbitrary URL)
  const fetchNotifications = async (url = '/notifications', { append = false } = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get(url);

      // DRF paginated shape: { count, next, previous, results }
      const results = Array.isArray(data) ? data : data?.results || [];
      const mapped = results.map(normalize);

      setNotifications((prev) => (append ? [...prev, ...mapped] : mapped));
      setNextUrl(Array.isArray(data) ? null : data?.next || null);

      // Unread based on what we've loaded into state
      setUnreadCount((prev) => (append ? prev + recalcUnread(mapped) : recalcUnread(mapped)));
    } catch (error) {
      // You can toast/log if you like
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextUrl) return;
    await fetchNotifications(nextUrl, { append: true });
  };

  // ------- WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const access = localStorage.getItem('access');
    const ws = new window.WebSocket(`ws://localhost:8000/ws/notifications/?token=${access}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.message) {
          toast(
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm">{data.message}</p>
              </div>
            </div>,
            {
              position: 'bottom-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              className: 'notification-toast',
              onClick: () => setIsNotificationVisible(true),
            }
          );
          // play sound (ignore errors silently)
          try { new Audio('/assets/notification.wav').play(); } catch {}
        }

        const incoming = normalize({
          ...data,
          recipient: data.recipient ?? { username: 'System', avatar: null },
          read: data.read ?? false,
        });

        // Prepend new notification
        setNotifications((prev) => [incoming, ...prev]);

        // Increment unread only if it's unread
        setUnreadCount((prev) => (incoming.is_read ? prev : prev + 1));
      } catch {
        // ignore JSON parse errors
      }
    };

    return () => {
      try { ws.close(); } catch {}
    };
  }, [isAuthenticated]);

  // Fetch latest when opening the panel
  useEffect(() => {
    if (isAuthenticated && isNotificationVisible) {
      fetchNotifications('/notifications', { append: false });
    }
  }, [isAuthenticated, isNotificationVisible]);

  const toggleNotification = () => setIsNotificationVisible((v) => !v);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      // optional: toast.error('Failed to mark as read');
    }
  };

  const value = {
    isNotificationVisible,
    toggleNotification,
    notifications,
    unreadCount,
    markAsRead,
    fetchNotifications, // still exposed if you want to trigger manually
    loadMore,
    hasMore: !!nextUrl,
    loading,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  return useContext(NotificationContext);
}
