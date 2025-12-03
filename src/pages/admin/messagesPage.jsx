// src/pages/admin/MessagePanel.jsx
import React, { useState, useEffect } from "react";
import axios from "../../api/axiosSetup";
import { Search, Trash2, Ban, AlertCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";


const MessagePanel = ({moodColorHandler}) => {

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  axios.defaults.withCredentials = true;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const limit = 10; 

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/messages", {
        params: {
          search: search.trim() === "" ? undefined : search.trim(),
          limit,
          page,
        },
      });
      setMessages(res.data.messages || []);
      setTotalMessages(res.data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
    setLoading(false);
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMessages();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);


  useEffect(() => {
    fetchMessages();
  }, [page]);

  
   const banUser = async (userId, username) => {

    if (!confirm(`Do you want to ban ${username} ?`)) return;

    try {
    
      const response = await axios.post(`/admin/ban/${userId}`, { isBanned: true, });
      
      if (response.data.success) {

        alert(`${username} has been banned`);
        fetchMessages(); 
      
      }
    } catch (error) {
      console.error("Ban failed:", error.response || error);
      alert("Failed to ban user. Check console.");
    }
  };


  const totalPages = Math.ceil(totalMessages / limit);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Messages Panel</h2>
        <p className="text-gray-600">Monitor and moderate all messages in real-time</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 ">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search messages or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500" />
            <span>{totalMessages} total messages</span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            {search.trim() ? `No messages found for "${search}"` : "No messages yet"}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {messages.map((msg) => (
                <div key={msg._id} className="p-6 hover:bg-gray-50 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={msg.sender?.profilePic || "/default-avatar.png"}
                          alt={msg.sender?.username}
                          style={{borderColor: moodColorHandler(msg.sender?.moodStatus)}}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            
                              <p className="font-semibold text-gray-900">
                                {msg.sender?.username || "Unknown"}
                              </p>
                                {msg.sender?.isBanned && ( 
                                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    Banned
                                  </span>
                                )}
                              
                            </div>
                          <p className="text-gray-900 mb-1">
                            {msg.text}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              To: {msg.receiver?.username || "Unknown"}
                            </span>
                            <Clock size={14} />
                            {new Date(msg.createdAt).toLocaleString([], { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}

                          </p>
                        </div>
                      </div>
                      <p className="text-gray-800 mt-3 pl-1 text-lg">{msg.content}</p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                          onClick={() => banUser(msg.sender._id, msg.sender.username)} 
                          disabled={msg.sender?.isBanned}
                          className={`p-3 rounded-xl cursor-pointer transition ${
                            msg.sender?.isBanned 
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                              : "bg-orange-100 hover:bg-orange-200 text-orange-600"
                          }`}
                        >
                          <Ban size={18} />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION — ALWAYS SHOWS WHEN >10 MESSAGES */}
            {totalPages > 1 && (
              <div className="px-6 py-5 border-t bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalMessages)} of {totalMessages}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border cursor-pointer disabled:opacity-50 hover:bg-gray-100 flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="text-sm font-medium">Page {page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border cursor-pointer disabled:opacity-50 hover:bg-gray-100 flex items-center gap-1"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessagePanel;