"use client";
import React, { useEffect } from "react";
import { X, Bell, CheckCircle } from "lucide-react";
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
    loading
  } = useNotification();

  if (!isNotificationVisible) return null;

  // Optional: lock background scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        // NOTE: replaced top-23 (invalid) with top-0; added h-screen flex flex-col
        className="fixed top-0 right-0 w-[400px] max-w-[100vw] min-w-[320px] h-screen bg-[#fffce8] shadow-lg border-l border-[#08305e] z-50 transition-transform duration-300 pointer-events-auto flex flex-col"
        style={{
          transform: isNotificationVisible ? "translateX(0)" : "translateX(100%)",
          borderTopLeftRadius: "18px",
          borderBottomLeftRadius: "18px",
        }}
      >
        {/* Header (non-scrolling) */}
        <div className="flex items-center justify-between p-5 border-b border-[#254c7c] bg-[#08305e] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bell className="text-[#38a0f7] w-6 h-6" />
            <span className="text-lg font-bold text-[#fffce8]">Notifications</span>
          </div>
          <button
            className="hover:bg-[#254c7c] p-1 rounded cursor-pointer"
            onClick={toggleNotification}
            aria-label="Close"
          >
            <X className="w-6 h-6 text-[#fffce8]" />
          </button>
        </div>

        {/* Tabs (non-scrolling) */}
        <div className="flex gap-4 px-5 pt-4 pb-2 bg-[#fffce8]">
          <button className="font-semibold text-[#fffce8] bg-[#38a0f7] rounded-lg px-4 py-1 text-sm shadow flex items-center gap-2">
            All
            {unreadCount > 0 && (
              <span className="bg-white text-[#38a0f7] rounded-full px-2 py-0.5 font-bold text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable list area */}
        <div
          className="p-3 pt-3 space-y-2 flex-1 overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" }} // smooth iOS scrolling
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-[#406087] text-center py-16 font-medium">No new notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border shadow transition ${
                  n.is_read
                    ? "bg-[#08305e]/10 border-[#cbd5e1]"
                    : "bg-[#e5f4fe] border-[#38a0f7] shadow-lg"
                }`}
              >
                {/* Avatar */}
                {n.avatar ? (
                  <img
                    src={n.avatar}
                    alt={n.sender_name}
                    className="w-10 h-10 rounded-full object-cover border border-[#38a0f7]"
                  />
                ) : (
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e5f4fe] border border-[#38a0f7]">
                    <FontAwesomeIcon icon={faUser} className="text-[#38a0f7] text-xl" />
                  </span>
                )}

                {/* Main */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#08305e]">{n.sender_name || "System"}</span>
                    <span className="text-xs text-[#406087]">{dayjs(n.created_at).fromNow() || "Just now"}</span>
                  </div>
                  <div className="text-[#08305e] text-sm mb-1">{n.text || n.description || n.title}</div>

                  {/* Actions */}
                  <div className="flex justify-end items-center gap-1 text-xs mt-1">
                    <button
                      className={`flex items-center gap-1 text-xs rounded px-2 py-1 ml-2 ${
                        n.is_read
                          ? "text-[#b7c7de] bg-[#fffce8] border border-[#cbd5e1] cursor-default"
                          : "text-[#38a0f7] bg-white border border-[#38a0f7] hover:bg-[#38a0f7] hover:text-white"
                      }`}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      disabled={n.is_read}
                    >
                      <CheckCircle size={15} />
                      {n.is_read ? "Read" : "Mark as read"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
