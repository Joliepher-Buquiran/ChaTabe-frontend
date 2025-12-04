// Imports and setup
import axios from '../api/axiosSetup.js';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Search, MessageSquareText, Smile, ThumbsUp, MessageCircleOff, LogOut, X } from "lucide-react";
import MessageInputComponent from '../components/MessageInputComponent';
import ChatBox from '../components/chatBox';
import ConfirmationModal from '../components/confirmationModal.jsx';
import BlockConfirmationModal from '../components/blockConfirmationModal.jsx';
import UnblockConfirmationModal from '../components/unblockConfirmationModal.jsx';
import LogoutConfirmationModal from '../components/logoutConfirmationModal.jsx';
import RightPanel from '../components/rightPanel.jsx';
import { io } from "socket.io-client";



axios.defaults.withCredentials = true;

const Home = () => {

  const messagesEndRef = useRef(null); 

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(0);
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState(false)
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [userData, setUserData] = useState()

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedBy, setIsBlockedBy] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [showMoodModal, setShowMoodModal] = useState(false);      
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null); 

  const [loading, setLoading] = useState(true)


  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Fallback for safety

  // Initialize socket inside component with dynamic URL
  const socket = useRef(null);
  useEffect(() => {
    socket.current = io(API_URL, {
      withCredentials: true,
    });
  
    // Example event listener
    socket.current.on("connect", () => {
      console.log("Connected with id:", socket.current.id);
    });
  
    socket.current.on("receiveMessage", (msg) => {
      console.log("Received message:", msg);
    });
  
    // Cleanup on unmount
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [API_URL]);
  


  useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

    useEffect(() => {
      if (!socket.current) return;
    
      const onReceive = (incoming) => {
        const msgConvId =
          incoming?.conversationId?._id ??
          incoming?.conversationId ??
          incoming?.conversation ??
          null;
    
        if (!msgConvId || !conversationId) return;
    
        if (String(msgConvId) === String(conversationId)) {
          setMessages(prev => {
            if (prev.some(m => m._id === incoming._id)) return prev;
            return [...prev, incoming];
          });
        }
      };
    
      const onTyping = (data) => {
        if (String(data.conversationId) === String(conversationId)) setIsTyping(true);
      };
    
      const onStopTyping = (data) => {
        if (String(data.conversationId) === String(conversationId)) setIsTyping(false);
      };
    
      socket.current.on("receiveMessage", onReceive);
      socket.current.on("typing", onTyping);
      socket.current.on("stopTyping", onStopTyping);
    
      return () => {
        socket.current.off("receiveMessage", onReceive);
        socket.current.off("typing", onTyping);
        socket.current.off("stopTyping", onStopTyping);
      };
    }, [conversationId]);
    
    

    useEffect(() => {
      if (!socket.current) return;
    
      const handleUpdate = (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId ? { ...msg, text: data.text } : msg
          )
        );
      };
    
      socket.current.on("updateMessage", handleUpdate);
    
      return () => socket.current.off("updateMessage", handleUpdate);
    }, [conversationId]);
    

  

    useEffect(() => {
      if (!socket.current) return;
    
      const handleDelete = (data) => {
        if (data.conversationId === conversationId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.messageId ? { ...msg, isDeleted: true } : msg
            )
          );
        }
      };
    
      socket.current.on("deleteMessage", handleDelete);
    
      return () => socket.current.off("deleteMessage", handleDelete);
    }, [conversationId]);
    



  useEffect(() => {
    async function fetchUserData() {
      try {

        setLoading(true); 

        const res = await axios.get('/user-data',{
          withCredentials: true
        })

        setUserData(res.data)
        console.log('User data: ',res.data)

      } catch (error) {
        console.error("Error fetching user data:", error);
      }finally {
        setLoading(false);  
      }
    }
 
    setTimeout(() => {
      fetchUserData(); 
    }, 100);
  }, []);


    useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        if (query.trim() === "") {
          setResults([]);
          return;
        }

        if (query.trim().length >= 1) {
          handleSearch();
        }
      }, 300); 

      return () => clearTimeout(delayDebounceFn);
    }, [query]);


  useEffect(() => {
    if (!userId) return;
    handleSelectUser(userId);
  }, [userId]);
    
  const selectedUser = userData?.user?.contacts?.find(user => user._id === userId);
  
  const handleSearch = async () => {

  try {

    setLoading(true); 

    const response = await axios.get(`/search?username=${query}`, {
      withCredentials: true
    });

    setResults(response.data.users || []);
  } catch (error) {
    console.log('Search error:', error);
    setResults([]);
  }finally {
    setLoading(false);  
  }
};

  const addContact = async (contactId) => {
    try {

      setLoading(true); 

      const response = await axios.post('/add-contact',{
        contactId
      },{ withCredentials: true})

      alert(response.data.message)

      setUserData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            contacts: [...prev.user.contacts, response.data.newContact] 
          }
        }));


      setQuery("");

    } catch (error) {
      if(error.response) {
        alert(error.response.data.message)
        
        console.log('Something went wrong ', error.response )
      }else{
        alert('Something went wrong')
        console.log('Something went wrong ',error )
      }
    }finally {
      setLoading(false);  
    }
  }
    
  const Logout = async () => {
    if (loggingOut) return;      
    setLoggingOut(true);
    
    try {

      setLoading(true);

      await axios.post('/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);  
      setLoading(false)
    }
  };

  const handleSelectUser = async (receiverId) => {
    if (receiverId === userId) return;
    setUserId(receiverId);
    setMessages([]);
    setConversationId(null)
    setIsBlocked(false)
    setIsBlockedBy(false)
    setLoading(true); 

    if (!receiverId || !userData?.user?._id) return;

    let findContact = userData.user.contacts.find(contact => contact._id === receiverId);
      
    if (!findContact) return;

    try {
      const convoRes = await axios.post("/conversation", {
        senderId: userData?.user?._id,
        receiverId,
      });

      let convo;

      if (Array.isArray(convoRes.data)) {
        convo = convoRes.data.find(
          (contact) =>
            (contact.senderId === userData?.user?._id && contact.receiverId === receiverId) ||
            (contact.receiverId === userData?.user?._id && contact.senderId === receiverId)
        );
      } else {
        convo = convoRes.data;
      }

      if (!convo) {
        console.error("No conversation returned");
        return;
      }

      setConversationId(convo.conversationId);
      setIsBlocked(convo.isBlocked || false);
      setIsBlockedBy(convo.blockedBy || null);

      socket.current.emit("joinRoom", convo.conversationId);

      const messageRes = await axios.post("/messages", {
        conversationId: convo.conversationId,
        senderId: userData?.user?._id,
        receiverId
      },{withCredentials:true});

      setMessages(messageRes.data);
     
    } catch (error) {
      console.error("Error fetching conversation or messages:", error);
      setMessages([]);
    }finally {
      setLoading(false);  
    }
  };

  
  const moodColorHandler = (moodStatus) => {
    if (moodStatus === 'Happy') return '#dd7c30';
    if (moodStatus === 'Sad') return '#1a4097';
    if (moodStatus === 'Angry') return '#ff3131';
    if (moodStatus === 'Annoyed') return '#049650';
    if (moodStatus === 'Afraid') return '#7228c2';
    return '#ffffffff'; 
  };    

  const openDeleteModal = (msg) => {
    setMessageToDelete(msg);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    setLoading(true); 
    console.log('Deleting message:', messageToDelete);

    try {
      await axios.delete(`/delete-message/${messageToDelete._id}`, { withCredentials: true });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageToDelete._id ? { ...msg, isDeleted: true } : msg
        )
    );

      socket.current.emit("deleteMessage", {
        conversationId,
        messageId: messageToDelete._id,
      });

      // if (handleSelectUser) await handleSelectUser(selectedUser._id);

    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      closeDeleteModal();
      setLoading(false)
    }
  };

  const blockContact = async () => {
    if (isBlocking) return;      
    setIsBlocking(true);
    setLoading(true); 

    try {
      const response = await axios.post('/block-contact',{
        conversationId
      },{withCredentials:true})

      console.log('Contact block status changed:', response.data);
      setIsBlocked(response.data.isBlocked);
      setIsBlockedBy(response.data.blockedBy);
      
    } catch (error) {
      console.log("Error blocking contact:", error);
    } finally {
      setIsBlocking(false);
      setShowBlockModal(false);
      setLoading(false)
    }
  }

  
  const moods = [
    { name: "Happy", color: "#dd7c30" },
    { name: "Sad", color: "#1a4097" },
    { name: "Angry", color: "#ff3131" },
    { name: "Annoyed", color: "#049650" },
    { name: "Afraid", color: "#7228c2" },
  ];

  const updateMood = async (newMood) => {
    setLoading(true); 
    try {
      await axios.post('/update-mood', { moodStatus: newMood }, { withCredentials: true });
      
      setUserData(prev => ({
        ...prev,
        user: { ...prev.user, moodStatus: newMood }
      }));

      setShowMoodModal(false);
    } catch (err) {
      alert("Failed to update mood");
      console.error(err);
    }finally {
      setLoading(false);  
    }
  };

  return (

    
    <div className="flex flex-col h-screen bg-gradient-to-r from-[#ffffff] to-[#9176e8]">

      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6f2db7] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#6f2db7] font-semibold">Loading...</p>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
        />
      )}

      { showBlockModal && (
        <BlockConfirmationModal 
          showBlockModal={showBlockModal} 
          setShowBlockModal={setShowBlockModal} 
          blockContact={blockContact}
          isBlocking={isBlocking}
        />
      )}

      { showUnblockModal && (
        <UnblockConfirmationModal 
          showUnblockModal={showUnblockModal} 
          setShowUnblockModal={setShowUnblockModal} 
          blockContact={blockContact}
          isBlocking={isBlocking}
        />
      )}

      { showLogoutModal && (
        <LogoutConfirmationModal
          showLogoutModal={showLogoutModal}        
          setShowLogoutModal={setShowLogoutModal}
          loggingOut={loggingOut}
          Logout={Logout}
        />
      )}

      

  {showProfileModal && (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 sm:mx-8">

        <div className="flex justify-end ">
          <button
            onClick={() => setShowProfileModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-all ease-in-out cursor-pointer"
          >
            <X size={28} />
          </button>
 
        </div>

        <p className='text-[#6f2db7] text-2xl font-bold text-center mb-20'>Profile</p>


        
        <div className="flex flex-col items-center -mt-10">
          <div className="relative">
            <img 
              src={userData?.user?.profilePic || "/default-avatar.png"}
              alt="Your Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 shadow-2xl ring-4 ring-white/50"
              style={{ borderColor: moodColorHandler(userData?.user?.moodStatus) }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </div>

          <h3 className="mt-5 text-2xl font-bold text-gray-800">
            {userData?.user?.username}
          </h3>
          <p 
            className="text-sm font-medium mt-1"
            style={{ color: moodColorHandler(userData?.user?.moodStatus) }}
          >
            {userData?.user?.moodStatus || "No mood set"}
          </p>
        </div>

      
        <div className="mt-10 space-y-4">
          <button
            onClick={() => {
              alert("Change Name feature coming soon!");
              setShowProfileModal(false);
            }}
            className="w-full py-4 px-6 bg-[#6f2db7] hover:bg-[#5a1e9a] text-white rounded-xl font-medium transition-all shadow-lg cursor-pointer"
          >
            Change Name
          </button>

          <button
            onClick={() => { setShowProfileModal(false)  
              setShowLogoutModal(true) }}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )}

   
      {showMoodModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-[#6f2db7] mb-3">Choose your mood</h3>
              <button 
                onClick={() => setShowMoodModal(false)} 
                className="text-gray-600 hover:text-gray-800 cursor-pointer transition-all"
              >
                <X size={28} onClick={() => {
                            setSelectedMood(userData?.user?.moodStatus || null);
                            setShowMoodModal(true);
                          }}/>
              </button>
              
            </div>

            
            <div className="grid grid-cols-2 gap-4 ">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood.name)} 
                  className={`
                    py-8 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300 cursor-pointer
                    ${selectedMood === mood.name 
                      ? 'scale-110 ring-4 ring-[#6f2db7] shadow-2xl shadow-black/30' 
                      : 'hover:scale-105 active:scale-95'
                    }
                  `}
                  style={{ backgroundColor: mood.color }}
                >
                  {mood.name}
                </button>
              ))}
            </div>

            <p className="text-center mt-6 text-gray-600">
              Current mood:{' '}
              <span style={{ color: moodColorHandler(userData?.user?.moodStatus) }} className="font-bold">
                {userData?.user?.moodStatus || "None"}
              </span>
            </p>

  
            <button 
              className={`
                mt-6 w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg
                ${selectedMood 
                  ? 'bg-[#6f2db7] hover:bg-[#5a1e9a] cursor-pointer active:scale-95' 
                  : 'bg-gray-400 cursor-not-allowed'
                }
              `}
              onClick={() => {
                if (selectedMood) {
                  updateMood(selectedMood);
                }
              }}
              disabled={!selectedMood}
            >
              {selectedMood ? `Set as ${selectedMood}` : 'Pick a mood first'}
            </button>
          </div>
        </div>
      )}
            
      <header className="bg-white flex flex-row flex-wrap justify-between items-center px-3 py-2 border-b border-gray-100 gap-2">

        <img
          src="/logo.png"
          alt="Logo"
          className="w-14 h-10 sm:w-22 sm:h-12 md:w-[8vw] md:h-[7vh] 2xl:w-[9vw] xl:w-[9vw] object-cover rounded-md flex-shrink-0"
        />

        <div className="flex flex-row items-center justify-center w-[48%] sm:w-[64%] md:w-auto gap-2 md:gap-3">
      
          <div className="relative flex items-center bg-white rounded-md px-3 py-1 w-[55%] sm:w-[40%] md:w-[38vw] lg:w-[25vw] 2xl:w-[25vw] border border-[#6f2db7]">
              <Search className="text-[#6f2db7] mr-2" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contact"
                className="bg-transparent outline-none w-full text-[#6f2db7] placeholder-[#6f2db7]/70 text-sm sm:text-base py-2"
              />

             
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#6f2db7]/40 scrollbar-track-gray-50">
                    {results.map((user, index) => (
                      <div
                        key={user._id}
                        className={`flex items-center justify-between px-5 py-4 transition-all hover:bg-[#6f2db7]/5 ${
                          index !== results.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={user.profilePic || user.profilePicURL}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
                            style={{ borderColor: moodColorHandler(user.moodStatus) }}
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{user.username}</p>
                            <p className="text-xs text-gray-500">Click Add to add contact </p>
                          </div>
                        </div>

                        <button
                          onClick={() => addContact(user._id)}
                          className="bg-[#6f2db7] hover:bg-[#5a1e9a] text-white px-6 py-2.5 rounded-xl text-sm cursor-pointer font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          <div className="flex justify-center items-center ">
           
            <div className="flex flex-col items-center cursor-pointer ml-2" onClick={() => setShowMoodModal(true)}>
              <Smile className="text-[#6f2db7] block sm:hidden" size={16} />
              <Smile className="text-[#6f2db7] hidden sm:block" size={20} />
              <p className="text-[12px] text-[#6f2db7]">Mood</p>
            </div>
          </div>
        </div>
            
        {userData && (
          <div 
            className="w-8 sm:w-9 md:w-10 aspect-square cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowProfileModal(true)}
          >
            <img
              src={userData.user.profilePic || userData.user.profilePicURL}
              style={{borderColor: moodColorHandler(userData.user.moodStatus)}}
              alt="User Profile Picture"
              className="w-full h-full rounded-full border-2 border-[#6f2db7] object-cover"
            />
          </div>
        )}
      </header>

      <main className="flex flex-col md:flex-row flex-grow gap-3 px-4 py-2 bg-gradient-to-r from-[#ffffff] to-[#9176e8]">
        
        <div className="bg-transparent flex-[1] 2xl:flex-[0.8] xl:flex-[0.9] lg:flex-[1.3] md:flex-[2]  min-h-[300px] md:min-h-[89vh] rounded-md  shadow-gray-500 shadow-2xl p-3 overflow-y-auto">
          
          <p className='text-[#6f2db7] text-2xl font-semibold ml-3 mt-3 mb-5'>Contacts</p>
          
          <ul className="space-y-3">
            {
              userData?.user?.contacts?.length > 0 ? (
                userData.user.contacts.map(user => (
                  <li
                    key={user._id}
                    className={`flex items-center gap-3 p-2 rounded-md shadow-sm cursor-pointer  ${
                      userId === user._id ? 'bg-[#6f2db7]' : 'bg-gray-200'
                    }`}
                    onClick={() => handleSelectUser(user._id)}
                  >
                    <img
                      src={user.profilePic || user.profilePicURL}
                      alt={user.username}
                      style={{ borderColor: moodColorHandler(user.moodStatus) }}
                      className="w-10 h-10 lg:w-10 lg:h-10 rounded-full object-cover border-2"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold text-sm text-gray-800 ${
                        userId === user._id ? 'text-white' : 'text-black'
                      }`}>{user.username}</p>
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <p>{user.recentMessage}</p>
                        <p>{user.recentMessageTime}</p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className='text-lg text-center'>No contacts available</p>
              )
            }
          </ul>
        </div>
          
        <div className="flex-[4] lg:flex-[3] min-h-[300px] md:min-h-[89vh] rounded-md shadow-xl flex flex-col p-2 px-3 overflow-hidden bg-transparent shadow-gray-500 2xl:shadow-inner">
          {selectedUser ? (
            <>
              <div className="flex flex-row gap-2 p-3">
                <img
                  src={selectedUser.profilePic || selectedUser.profilePicURL}
                  alt={selectedUser.username}
                  style={{ borderColor: moodColorHandler(selectedUser.moodStatus) }}
                  className="w-14 h-14 rounded-full object-cover border-2"
                />
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-[#6f2db7] pl-2">{selectedUser.username}</h2>
                  <p className={`text-[11px]  pl-2 font-semibold`} style={{color: moodColorHandler(selectedUser.moodStatus)}} >{selectedUser.moodStatus}</p>
                </div>
              </div>

              <div className="w-full bg-white h-[1px] my-2"></div>
        
            
              <ChatBox 
                messages={messages}
                messagesEndRef={messagesEndRef}
                userData={userData}
                moodColorHandler={moodColorHandler}
                setEditingMessage={setEditingMessage}
                handleSelectUser={handleSelectUser}
                conversationId={conversationId}
                openDeleteModal={openDeleteModal}
                isBlocked={isBlocked}
                isBlockedBy={isBlockedBy}
                loading={loading}
              />

              <MessageInputComponent  
                senderId={userData?.user?._id}
                receiverId={selectedUser?._id}
                senderUsername={userData?.user?.username}
                receiverUsername={selectedUser?.username}
                handleSelectUser={handleSelectUser} 
                conversationId={conversationId}
                editingMessage={editingMessage}        
                setEditingMessage={setEditingMessage}
                isBlocked={isBlocked}
                blockedBy={isBlockedBy}
                blockContact={blockContact}
                setShowBlockModal={setShowBlockModal}
                setShowUnblockModal={setShowUnblockModal}
                currentUserId={userData?.user?._id}
                setMessages={setMessages}
              />
            </>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p className="text-[#6f2db7] text-xl text-center font-semibold p-3">Select a user to start chatting</p>
            </div>
          )}
        </div>

        <RightPanel
          selectedUser={selectedUser} 
          isSearching={isSearching} 
          setIsSearching={setIsSearching} 
          Logout={Logout} 
          conversationId={conversationId} 
          moodColorHandler={moodColorHandler}
          blockContact={blockContact}
          setShowBlockModal={setShowBlockModal} 
          showBlockModal={showBlockModal}
          setShowLogoutModal={setShowLogoutModal}
          isBlocked={isBlocked}
          isBlockedBy={isBlockedBy}
        />
      </main>
    </div>
  );
};

export default Home;