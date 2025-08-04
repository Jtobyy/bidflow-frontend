'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

const demoNotifications = [
  {
    id: 1,
    sender_name: "Aunt Viv",
    avatar: "/assets/viv.jpg",
    text: "I still can't access my account. Can you help me reset my password?",
    created_at: new Date(Date.now() - 37 * 60 * 1000).toISOString(), // 37 minutes ago
    is_read: false,
    status: "waiting",
    status_time: "35 minutes",
  },
  {
    id: 2,
    sender_name: "Lisa Mona",
    avatar: "/assets/lisa.jpg",
    text: "There seems to be a discrepancy in my last invoice. I was charged for features I...",
    created_at: new Date(Date.now() - 62 * 60 * 1000).toISOString(), // 1hr+ ago
    is_read: false,
    status: "escalated",
  },
  {
    id: 3,
    sender_name: "Lisa Mona",
    avatar: "/assets/lisa.jpg",
    text: "There seems to be a discrepancy in my last invoice. I was charged for features I...",
    created_at: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
    is_read: false,
    status: "escalated",
  },
  {
    id: 4,
    sender_name: "Lisa Mona",
    avatar: "/assets/lisa.jpg",
    text: "There seems to be a discrepancy in my last invoice. I was charged for features I...",
    created_at: new Date(Date.now() - 62 * 60 * 1000).toISOString(),
    is_read: false,
    status: "escalated",
  },
];

export function NotificationProvider({ children }) {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // On mount, load demo data
    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
  }, []);

  const toggleNotification = () => setIsNotificationVisible((v) => !v);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const value = {
    isNotificationVisible,
    toggleNotification,
    notifications,
    unreadCount,
    markAsRead,
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
