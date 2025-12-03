import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Search, MessageCircleOff, LogOut } from "lucide-react";

const RightPanel = ({ selectedUser, isSearching, setIsSearching, setShowLogoutModal, conversationId,moodColorHandler,setShowBlockModal, isBlocked,isBlockedBy }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchHandler = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/search-message', {
        message: searchQuery.trim(),
        conversationId
      }, { withCredentials: true });

      setSearchResults(response.data.results || []);
    } catch (error) {
      console.log("Search error:", error.response?.data || error.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  
    useEffect(() => {
      if (!searchQuery.trim()) {
        setSearchResults([]);   
        setIsLoading(false);
      }
    }, [searchQuery]);


    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();        
        searchHandler();
      }
      if (e.key === 'Escape') {
        setIsSearching(false);
        setSearchResults([]);
        setSearchQuery('');
      }
    };


    
    const getProfileImageSrc = (user) => {
      if (!user) return "https://sggs.ac.in/assets/back/assets/img/avatars/1.png";
      
      // Prioritize binary profilePic if present
      const profilePic = user.profilePic;
      if (profilePic && profilePic.data && profilePic.data.data && profilePic.contentType) {
        try {
          const binaryString = new Uint8Array(profilePic.data.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          );
          const base64String = btoa(binaryString);
          return `data:${profilePic.contentType};base64,${base64String}`;
        } catch (e) {
          console.error("Base64 conversion failed:", e);
        }
      }
      
      // Fallback to profilePicURL if it's a valid string
      if (typeof user.profilePicURL === 'string' && user.profilePicURL.trim() !== '') {
        return user.profilePicURL;
      }
      
      // Final fallback
      return "https://sggs.ac.in/assets/back/assets/img/avatars/1.png";
    };
    
  return (
    <>
      {selectedUser ? (
        <>
          {isSearching ? (
            <div className="flex flex-col flex-1 lg:flex-[0.9] min-w-0 basis-[10%] bg-[#6f2db7] rounded-lg overflow-hidden">

              {/* Header */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-600">
                <X 
                  size={22} 
                  className='text-white cursor-pointer hover:text-gray-300' 
                  onClick={() => {
                    setIsSearching(false);
                    setSearchResults([]);
                    setSearchQuery('');
                  }} 
                />
                <p className='text-white font-semibold text-lg'>Search Messages</p>
              </div>

            
              <div className="p-4">
                <div className='flex items-center gap-3 bg-white rounded-lg px-4 py-2'>
                  <Search size={20} className='text-[#6f2db7]' />
                  <input 
                    type="text" 
                    className='flex-1 bg-transparent outline-none text-[#6f2db7] placeholder-purple-[#6f2db7] caret-purple-[#6f2db7]'
                    placeholder='Search in conversation...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
              </div>

        
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {isLoading ? (
                  <p className="text-center text-gray-400 mt-8">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-gray-400 mt-8">
                    {searchQuery.trim() ? "No messages found" : "Type something to search"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((msg) =>  { console.log(msg)
                     return (
                      <div
                        key={msg._id}
                        className="bg-gray-800/50 backdrop-blur rounded-lg p-4 hover:bg-gray-750 transition cursor-pointer border border-gray-700"
                        onClick={() => {
                          console.log("Jump to message:", msg._id);
                        
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            
                            <img src={getProfileImageSrc(msg.sender)} alt={msg.sender?.username} style={{borderColor: moodColorHandler(msg.sender?.moodStatus),borderWidth: 2}} className="w-9 h-9 rounded-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-300">
                              {msg.sender?.username || 'Unknown User'}
                            </p>
                            <p className="text-white text-sm mt-1 break-words line-clamp-2">
                              {msg.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(msg.createdAt).toLocaleString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            <div className="p-6 flex flex-col flex-1 lg:flex-[0.9] min-w-0 basis-[10%] bg-purple-800 rounded-lg gap-6">

              <div className='flex flex-col items-center gap-4'>

                <img
                  src={selectedUser.profilePic || selectedUser.profilePicURL}
                  alt={selectedUser.username}
                  style={{borderColor:moodColorHandler(selectedUser.moodStatus)}}
                  className='w-20 h-20 rounded-full object-cover border-4 '/>

                <h1 className='text-2xl font-bold text-white'>{selectedUser.username}</h1>

              </div>

              <div className='flex flex-col gap-1 mt-3'>

                <button onClick={() => setIsSearching(true)} className='flex items-center gap-4 rounded-lg py-2 px-5 hover:bg-white hover:text-[#6f2db7] transition-all ease-in text-white text-left cursor-pointer '>
                  <Search size={20} />
                  <span className="font-sm">Search in chat</span>
                </button>

                <button 
                      className={`flex items-center gap-4 rounded-lg py-2 px-5 transition-all text-white text-left ${isBlocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-[#6f2db7] cursor-pointer ease-in'}`} 
                      onClick={isBlocked ? undefined : () => setShowBlockModal(true)}
                      disabled={isBlocked}
                    >
                      <MessageCircleOff size={20} />
                      <span className="font-sm">Block Contact</span>
                    </button>

              </div>
            </div>
          )}
        </>
      ) : null}
    </>
  );
};

export default RightPanel;