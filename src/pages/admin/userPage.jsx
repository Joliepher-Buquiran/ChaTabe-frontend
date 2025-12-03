import React, { useState, useEffect } from 'react';
import { Search, Eye, MessageCircle, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from '../../api/axiosSetup';

const UserPage = ({moodColorHandler}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/users", {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };


  const banUser = async (userId, username) => {

    if (!confirm(`Do you want to ban ${username} ?`)) return;

    try {
    
      const response = await axios.post(`/admin/ban/${userId}`, { isBanned: true, });
      
      if (response.data.success) {

        alert(`${username} has been banned`);
        fetchUsers(); 
      
      }
    } catch (error) {
      console.error("Ban failed:", error.response || error);
      alert("Failed to ban user. Check console.");
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter]);


  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">All Users</h2>
      <p className="text-gray-600 mb-8">Manage and monitor all registered users</p>

      {/* Search + Status Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-4 border border-gray-200 rounded-xl bg-white"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="text-left p-6 font-semibold text-gray-700">User</th>
              <th className="text-left p-6 font-semibold text-gray-700">Status</th>
              <th className="text-left p-6 font-semibold text-gray-700">Joined</th>
              <th className="text-right p-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (

              <tr><td colSpan="4" className="text-center py-16">Loading...</td></tr>

            ) : users.length === 0 ? (

              <tr><td colSpan="4" className="text-center py-16 text-gray-500">No users found</td></tr>

            ) : (

              users.map((user) => (

                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-6">

                    <div className="flex items-center gap-4">

                      <img src={user.profilePic || user.profilePicURL} alt={`${user.username} profile picture`} className='w-10 h-10 lg:w-10 lg:h-10 rounded-full object-cover border-2' style={{borderColor: moodColorHandler(user.moodStatus) }}/>

                      <div>
                        <p className="font-medium text-gray-900">{user.username || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                    </div>
                  </td>

                  <td className="p-6">

                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isBanned 
                        ? "bg-red-100 text-red-800" 
                        : user.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.isBanned ? "Banned" : user.isActive ? "Online" : "Offline"}
                    </span>
                  </td>

                  <td className="p-6 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">

                      <button className="p-2 hover:bg-gray-300 rounded-lg cursor-pointer"><Eye size={18} /></button>
                      <button className="p-2 hover:bg-gray-300 rounded-lg cursor-pointer"><MessageCircle size={18} /></button>
                      <button disabled={user.isBanned}
                          className={`p-3 rounded-xl cursor-pointer transition ${
                            user.isBanned 
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                              : "bg-orange-100 hover:bg-orange-200 text-orange-600"
                          }`} onClick={() => banUser(user._id, user.username) }><Ban size={18} /></button>
                    
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPage(page - 1)} disabled={page === 1}
                className="px-5 py-2 rounded-xl border disabled:opacity-50"><ChevronLeft size={16} /> Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={page === pagination.pages}
                className="px-5 py-2 rounded-xl border disabled:opacity-50">Next <ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;