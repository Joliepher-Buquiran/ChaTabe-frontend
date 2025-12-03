import React, { useEffect, useState } from "react";
import axios from "../../api/axiosSetup";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Shield, LogOut, Activity, Ban, Send,LayoutDashboard  } from "lucide-react";
import {ResponsiveContainer,LineChart,CartesianGrid,XAxis,YAxis,Tooltip,Line} from 'recharts'
import MessagePanel from './messagesPage'


import UserPage from "./userPage";
import BannedUsersPanel from "./bannedUserPanel";

const AdminDashboard = () => {

    const navigate = useNavigate();

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [totalBannedUsers,setTotalBannedUsers] = useState(0)
  const [totalMessageSentToday,setTotalMessageSentToday] = useState(0)
  const [registeredUserToday,setRegisteredUserToday] = useState(0)
  const [currentPage, setCurrentPage] = useState('dashboard'); 


 

  const [range, setRange] = useState('7d');
  const [chartData, setChartData] = useState([]);
  
  axios.defaults.withCredentials = true;

  const fetchData = async () => {

    try {

        const responses = await Promise.all([

          axios.get("/admin/total-users"),
          axios.get("/admin/total-messages"),
          axios.get("/admin/active-users"),
          axios.get("/admin/messages-today"),
          axios.get("/admin/total-banned-users"),
          axios.get("/admin/registered-users-today"),
          

        ])

  
        setTotalUsers(responses[0].data.totalUsers );
        setTotalMessages(responses[1].data.totalMessages );
        setTotalActiveUsers(responses[2].data.activeUsers );
        setTotalMessageSentToday(responses[3].data.messagesToday)
        setTotalBannedUsers(responses[4].data.bannedUsers)
        setRegisteredUserToday(responses[5].data.usersToday)

    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {

    if(!confirm("Do you want to logout?")) return
    
    await axios.post("/logout",{withCredentials:true});
    navigate("/");
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/admin/stats?range=${range}`);
        setChartData(res.data.data || []);
      } catch (err) {
        console.error("Fetch error:", err.response || err);
      }
    };
      fetchStats();
  }, [range]);


   const moodColorHandler = (moodStatus) => {
        if (moodStatus === 'Happy') return '#dd7c30';
        if (moodStatus === 'Sad') return '#1a4097';
        if (moodStatus === 'Angry') return '#ff3131';
        if (moodStatus === 'Annoyed') return '#049650';
        if (moodStatus === 'Afraid') return '#7228c2';
        return '#ffffffff'; 
      };   


  function selector(){
    return(

          <div className="flex gap-2 mb-6 flex-wrap">
            {['1d', '7d', '30d', '1y'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-all ${
                  range === r
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>

                  {r === '1d' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '1 Year'}
              
              </button>
      ))}
    </div>
        )
  }

  

  return (
    <div className="flex bg-gray-100 min-h-screen">

      
      <aside className="w-60 bg-white shadow-md p-5 fixed h-full">
        <h1 className="text-2xl font-bold mb-8 text-blue-600">Admin Panel</h1>
        
        <nav className="flex flex-col gap-4">

          <button 
            onClick={() => setCurrentPage('dashboard')}

            className={`flex items-center gap-3 text-left px-3 py-2 cursor-pointer  rounded-lg transition ease-in ${
              currentPage === 'dashboard' 
                ? 'bg-blue-600 text-white font-semibold shadow-lg' 
                : 'text-gray-900 hover:bg-gray-200'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button className={`flex items-center gap-3 text-left px-3 cursor-pointer  py-2 rounded-lg transition ease-in ${
                currentPage === 'users' 
                  ? 'bg-blue-600 text-white font-semibold shadow-lg' 
                  : 'text-gray-900 hover:bg-gray-200'
                    }`} 

              onClick={() => setCurrentPage('users')}>

            <Users size={20} /> Users

          </button>

          <button className={`flex items-center gap-3 text-left px-3 cursor-pointer  py-2 rounded-lg transition ease-in ${
                currentPage === 'messages' 
                  ? 'bg-blue-600 text-white font-semibold shadow-lg' 
                  : 'text-gray-900 hover:bg-gray-200'
                    }`} 

              onClick={() =>setCurrentPage('messages')}>

            <MessageSquare size={20} /> Messages

          </button>

          <button className={`flex items-center gap-3 text-left px-3 cursor-pointer py-2 rounded-lg transition ease-in ${
                currentPage === 'security' 
                  ? 'bg-blue-600 text-white font-semibold shadow-lg' 
                  : 'text-gray-900 hover:bg-gray-200'
                    }`} 

              onClick={() => setCurrentPage('bannedUsers') }>
            <Ban size={20} /> Banned Users

          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-700 mt-10 cursor-pointer px-2 py-2 rounded-lg transition ease-in hover:bg-red-200"
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>


      <main className="ml-64 p-5 overflow-y-auto ">

        {currentPage === 'users'? (
          <UserPage moodColorHandler={moodColorHandler}/>
        ):currentPage === 'messages'? (
          <MessagePanel moodColorHandler={moodColorHandler}/>
        ):currentPage === 'bannedUsers' ? (
          <BannedUsersPanel moodColorHandler={moodColorHandler}/>
        ):currentPage === 'dashboard'?(

          <>

          <header className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-500">Monitor users and messages in real-time</p>
          </header>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                
                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>

                <div className="p-3 bg-blue-100 rounded-full">
                    <Users size={24} className="text-blue-600" />
                </div>
              </div>
              
                <p className="text-4xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-sm text-gray-500 mt-2">All registered users</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">

                <h3 className="text-lg font-semibold text-gray-700">Total Messages</h3>

                <div className="p-3 bg-green-100 rounded-full">
                    <MessageSquare size={24} className="text-green-600" />
                </div>
              </div>

                <p className="text-4xl font-bold text-gray-900">{totalMessages}</p>
                <p className="text-sm text-gray-500 mt-2">Across all chats</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">

                <h3 className="text-lg font-semibold text-gray-700">Registered Users Today</h3>

                <div className="p-3 bg-purple-100 rounded-full">
                    <Shield size={24} className="text-purple-600" />
                </div>
                </div>

                <p className="text-4xl font-bold text-gray-900">{registeredUserToday}</p>
                <p className="text-sm text-gray-500 mt-2">Privileged accounts</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">

                <h3 className="text-lg font-semibold text-gray-700">Message Sent Today</h3>
                <div className="p-3 bg-indigo-100 rounded-full">

                    <Send size={24} className="text-indigo-600" />
                </div>
                </div>

                <p className="text-4xl font-bold text-gray-900">{totalMessageSentToday}</p>
                <p className="text-sm text-gray-500 mt-2">All conversation</p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  
                <h3 className="text-lg font-semibold text-gray-700">Active Users </h3>

                <div className="p-3 bg-green-100 rounded-full">
                    <Activity size={24} className="text-lime-600" />
                </div>
                </div>

                <p className="text-4xl font-bold text-gray-900">{totalActiveUsers}</p>
                <p className="text-sm text-gray-500 mt-2">Currently online</p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">

                <h3 className="text-lg font-semibold text-gray-700">Banned Users</h3>

                <div className="p-3 bg-red-100 rounded-full">
                    <Ban size={24} className="text-red-600" />
                </div>
                </div>

                <p className="text-4xl font-bold text-gray-900">{totalBannedUsers}</p>
                <p className="text-sm text-gray-500 mt-2">Currently banned</p>
            </div>


            </div>

            <div className="p-1 mt-10">

              {chartData.length === 0 ? (

              <div className="flex flex-col gap-3">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xl font-semibold">Growth & Activity Overview</p>
                  <p className="text-sm text-gray-500 mt-1">
                      New users and message volume • {
                        range === '1d' ? 'Today' :
                        range === '7d' ? 'Last 7 days' :
                        range === '30d' ? 'Last 30 days' :
                        'Past year'
                      }
                  </p>
      
                </div>

                <div className="flex justify-end">
                  {selector()}

                </div>

                <div className="h-80 flex items-center justify-center bg-gray-200 rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading analytics...</p>
                  </div>
                </div>
              </div>
            ) : (
              <>

              <div className="flex flex-col gap-3">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xl font-semibold">Growth & Activity Overview</p>
                  <p className="text-sm text-gray-500 mt-1">
                      New users and message volume • {
                        range === '1d' ? 'Today' :
                        range === '7d' ? 'Last 7 days' :
                        range === '30d' ? 'Last 30 days' :
                        'Past year'
                      }
                  </p>
      
                </div>

                <div className="flex justify-end">
                  {selector()}

                </div>

                <div>              

                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" />
                        <XAxis dataKey="date" tick={{ fontSize: 13 }} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={4} name="New Users" />
                        <Line type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={4} name="Messages" />
                    </LineChart>
                  </ResponsiveContainer>
                  
                </div>  
              </div> 
            </>
            )}


           
          </div>


            </>
        ):(null)}

       
        
            
        
      </main>
    </div>
  );
};

export default AdminDashboard;
