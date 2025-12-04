import { useEffect,useRef } from 'react';
import {Trash,Pencil} from 'lucide-react'
import { io } from 'socket.io-client';



const ChatBox = ({messages,messagesEndRef,userData,moodColorHandler,setEditingMessage, handleSelectUser,conversationId,isBlocked,isBlockedBy,openDeleteModal,loading}) => {

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Fallback for safety

  // Initialize socket inside component with dynamic URL
  const socket = useRef(null);
  useEffect(() => {
    socket.current = io(API_URL, {
      withCredentials: true
    });

    // Cleanup on unmount
    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [API_URL]);
  
  useEffect(() => {
    if (!conversationId) return;
  
    socket.current.emit("joinRoom", conversationId);
  
  }, [conversationId]);
  

    
  const handleEdit = (msg) => {
    setEditingMessage(msg); 
  };


   
    return (


        <div className="flex-1 overflow-y-auto p-2 mb-3 rounded-md sm:h-[70vh] md:h-[80vh] max-h-[70vh] bg-transparent">
          
          {loading ? (

            <div className="flex justify-center mt-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#6f2db7] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#6f2db7] font-semibold">Loading messages...</p>
              </div>
            </div>

            ) : messages.length > 0 ? (
              
            messages.map((msg, index) => {
              const isOwnMessage =
                (msg?.sender?._id && msg.sender._id === userData?.user?._id) ||
                msg.sender === userData?.user?._id;

            
              
              return (
                <>

                <div
                  key={msg._id || index}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                  className={`group p-2 my-1 rounded-lg w-fit max-w-[70%] break-words overflow-hidden ${
                    isOwnMessage
                      ? 'ml-auto text-white p-1.5 rounded-b-xl rounded-tr-none rounded-tl-xl my-2'
                      : 'mr-auto text-black flex flex-row items-center gap-2 my-2'
                  }`}
                >
                  {!isOwnMessage && (msg.sender?.profilePic || msg.sender?.profilePicURL) ? (
                    <>
                      <img
                        src={msg.sender.profilePic || msg.sender.profilePicURL}
                        alt={msg.sender.username}
                        style={{
                          borderColor: moodColorHandler(msg.sender.moodStatus),
                        }}
                        className="w-10 h-10 rounded-full object-cover border-2 shrink-0"
                      />
                      <div className={`${msg.isDeleted ? " bg-transparent ring-2 ring-white " : "bg-red-400 text-white"} px-3 py-2 rounded-b-xl rounded-tl-none rounded-tr-xl break-words overflow-hidden`}>

                        <p className={`break-words ${msg.isDeleted ? "italic text-white" : ""}`}>
                          {msg.isDeleted ? "This message was deleted" : msg.text}
                        </p>

                      </div>
                    </>
                  ) : (
                    <div className="group flex flex-row gap-2">
  
                      {!isBlocked && !msg.isDeleted && (  // INSERTED: Added !isBlocked condition to hide icons when blocked
                          <div className="hidden group-hover:flex p-1.5 flex flex-row gap-5 items-center">
                            <Trash
                              size={18.5}
                              className="cursor-pointer text-white"
                              onClick={() => {openDeleteModal(msg)}}
                            />
                            <Pencil
                              size={18.5}
                              className="cursor-pointer text-white"
                              onClick={() => handleEdit(msg)}
                            />
                          </div>
                        )}

                      <div
                        className={`${msg.isDeleted ? "bg-transparent ring-2 ring-white" : "bg-blue-600"} px-3 py-2 rounded-b-xl rounded-tl-none rounded-tr-xl break-words overflow-hidden`}
                      >
                        <p className={`break-words ${msg.isDeleted ? "italic text-white " : ""}`}>
                          {msg.isDeleted ? "This message was deleted" : msg.text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>);
            })
          ) : (
            <p className="text-[#6f2db7] text-lg text-center mt-5">No messages yet</p>
          )}
        </div>


  
  )
}

export default ChatBox