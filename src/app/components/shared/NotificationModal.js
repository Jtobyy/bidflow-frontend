"use client";
import React from "react";
import { X, Bell, CheckCircle, AlertCircle, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotification } from "@/app/hooks/useNotification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

dayjs.extend(relativeTime);


export default function NotificationModal() {
  const {
    isNotificationVisible,
    toggleNotification,
    notifications,
    markAsRead,
    unreadCount,
  } = useNotification();

  if (!isNotificationVisible) return null;

  // Example avatars - update with real URLs from your notifications data
  const defaultAvatar = "/assets/viv.jpg";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="fixed top-23 right-0 h-full w-[400px] bg-[#fffce8] shadow-lg border-l border-[#08305e] z-50 transition-transform duration-300 pointer-events-auto"
        style={{
          transform: isNotificationVisible ? "translateX(0)" : "translateX(100%)",
          borderTopLeftRadius: "18px",
          borderBottomLeftRadius: "18px",
          maxWidth: "100vw",
          minWidth: "320px"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#254c7c] bg-[#08305e] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bell className="text-[#38a0f7] w-6 h-6" />
            <span className="text-lg font-bold text-[#fffce8]">Notifications</span>
          </div>
          <button
            className="hover:bg-[#254c7c] p-1 rounded"
            onClick={toggleNotification}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-[#fffce8]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-5 pt-4 pb-2 bg-[#fffce8] sticky top-0 z-10">
          <button className="font-semibold text-[#fffce8] bg-[#38a0f7] rounded-lg px-4 py-1 text-sm shadow flex items-center gap-2">
            All
            {unreadCount > 0 && (
              <span className="bg-white text-[#38a0f7] rounded-full px-2 py-0.5 font-bold text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification list */}
        <div className="p-5 pt-3 space-y-5">
          {notifications.length === 0 && (
            <div className="text-[#406087] text-center py-16 font-medium">No notifications yet.</div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-xl border shadow transition ${
                n.is_read
                  ? "bg-[#08305e]/10 border-[#cbd5e1]"
                  : "bg-[#e5f4fe] border-[#38a0f7] shadow-lg"
              }`}
            >
              {/* Avatar */}
              <FontAwesomeIcon icon={faUser} color="#38a0f7" /> 
              {/* Main */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#08305e]">{n.sender_name || "System"}</span>
                  <span className="text-xs text-[#406087]">{dayjs(n.created_at).fromNow() || "Just now"}</span>
                </div>
                <div className="text-[#08305e] text-sm mb-1">{n.text || n.description || n.title}</div>
                {/* Status line */}
                {n.status && (
                  <div className="flex justify-end items-center gap-1 text-xs mt-1">
                    <button
                      className={`flex items-center gap-1 text-xs rounded px-2 py-1 ml-2 ${
                        n.is_read
                          ? "text-[#b7c7de] bg-[#fffce8] border border-[#cbd5e1]"
                          : "text-[#38a0f7] bg-white border border-[#38a0f7] hover:bg-[#38a0f7] hover:text-white"
                      }`}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      disabled={n.is_read}
                    >
                      <CheckCircle size={15} />
                      {n.is_read ? "Read" : "Mark as read"}
                    </button>
                  </div>
                )}
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
