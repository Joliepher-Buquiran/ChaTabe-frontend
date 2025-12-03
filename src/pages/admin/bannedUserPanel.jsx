
import React, { useState, useEffect } from "react";
import axios from "../../api/axiosSetup";
import { Search, RotateCcw, UserX, AlertCircle } from "lucide-react";


const BannedUsersPanel = ({moodColorHandler}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchBannedUsers = async () => {

    setLoading(true);
    try {
      const res = await axios.get("/admin/banned-users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);

  };

  useEffect(() => {
    fetchBannedUsers();
  }, []);


 
  const unbanUser = async (userId) => {

    if (!confirm("Do you want to unban this user?")) return;

    try {

      await axios.post(`/admin/unban/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      alert("User unbanned");
    
    } catch (error) {
      console.log("Error Unbanning the user", error)
    }
  };

    const filtered = users.filter(u => 
    u.username && u.username.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (

    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-3xl font-bold text-red-700">Banned Users</h2>
          <p className="text-gray-600">Manage and unban users</p>
        </div>
        
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search banned users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-all ease-in"
          />
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            <span>{users.length} banned</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            {search ? `No banned users found for "${search}"` : "No users are banned yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((user) => (
              <div key={user._id} className="p-6 hover:bg-red-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={user.profilePic || user.profilePicURL} className="w-10 h-10 object-cover rounded-full border-2 " style={{borderColor: moodColorHandler(user.moodStatus)}}/>
                    <UserX className="absolute -top-2 -right-2 text-red-600 bg-white rounded-full p-1 border" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{user.username}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => unbanUser(user._id)}
                  className="px-6 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium flex items-center gap-2 transition cursor-pointer "
                >
                  <RotateCcw size={20} /> Unban User
                </button>
                          
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannedUsersPanel;