import { useState,useEffect,useRef } from "react";
import { Search, MessageSquareText, Smile, ThumbsUp,MessageCircleOff,LogOut,X ,SendHorizontal } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";




// // Initialize socket
// const socket = io("http://localhost:3000", {
//     withCredentials: true
// });

let typingTimeout = null;


//Pass the props
export const MessageInputComponent = ({senderId, receiverId,senderUsername,receiverUsername, handleSelectUser,conversationId, editingMessage,   setEditingMessage, isBlocked,blockedBy, setShowUnblockModal,currentUserId,setMessages,loading,setLoading}) => {
  
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
    
    const [message,setMessage] = useState('')
    const [inputText, setInputText] = useState('');
    const [isClose,setIsClose] = useState(true)

    
    const isMeWhoBlocked = isBlocked && blockedBy === currentUserId;
    const isOtherWhoBlocked = isBlocked && blockedBy !== currentUserId;

    useEffect(() =>{

        if(editingMessage){
            setInputText(editingMessage.text)
        }else{
            setInputText('')
        }

    },[editingMessage])


    const sendMessage = async () => {


        try {
            setLoading(true)

            if(!inputText.trim()) return

            if (conversationId) {
                socket.current.emit("joinRoom", conversationId);  
            }

            if(!senderId || !receiverId){
                console.log('Missing sender or receiver ID')
                return
            }

            const response = await axios.post('/send-message',{
                
                senderId: senderId,
                receiverId: receiverId,
                senderUsername: senderUsername,
                receiverUsername: receiverUsername,
                text:inputText,
            }
            ,{withCredentials:true})

              const savedMessage = response.data;

                
              const convId = savedMessage.conversationId ? String(savedMessage.conversationId) : conversationId;

              // Append immediately so the sender sees the message right away
              if (typeof setMessages === 'function') {
                setMessages(prev => {
                  if (prev.some(m => m._id === savedMessage._id)) return prev;
                  return [...prev, savedMessage];
                });
              }
              
              // Ensure sender is in the room (helps with race)
              if (convId) {
                socket.current.emit("joinRoom", convId);
              }
              
              // Broadcast to other participants
              socket.current.emit("sendMessage", {
                conversationId: convId,
                message: savedMessage
              });
              
              // stop typing
              socket.current.emit("stopTyping", { conversationId: convId, senderId });

            console.log('Message sent successfully')

              if (handleSelectUser) {
                await handleSelectUser(receiverId);
            }

            setInputText('')

        } catch (error) {
            
            console.log('Error sending data',error)

        }finally{
            setLoading(false)
        }

    }


    const editExistingMessage = async () => {
        
        if (!inputText.trim() || !editingMessage) return;
        console.log(editingMessage._id)

        try {
        const response = await axios.put(
            `/edit-message/${editingMessage._id}`,
            { text: inputText },
            { withCredentials: true }
        );

        setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === editingMessage._id ? { ...msg, text: inputText } : msg
                )
            );

        socket.current.emit("updateMessage", {
            conversationId,
            messageId: editingMessage._id,
            text: inputText,
        });

        setEditingMessage(null);
        setInputText("");

        
    

        } catch (err) {
        console.error("Error editing message:", err);
        }
    };


    const handleSubmit = () => {
        if (editingMessage) {
        editExistingMessage();
        } else {
        sendMessage();
        }
    };

  

    const cancelEdit = () => {
        setEditingMessage(null);
        setIsClose(true);
        setMessage("");
    };


    const handleTyping = (e) => {
        setInputText(e.target.value);

        socket.current.emit("typing", { conversationId, senderId });

        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
        socket.current.emit("stopTyping", { conversationId, senderId });
        }, 1200);
  };

   
   return (

    <>

     {isBlocked ? (

        <div className="flex flex-col items-center py-4 bg-red-700 px-5 gap-2 rounded-lg">

{/* 
            {loading && (
                <div className="w-full flex justify-center py-2">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300"></div>
                    </div>
                </div>
            )} */}

            {isMeWhoBlocked ? (

            <>

                <h2 className="text-white font-bold text-xl">You block User</h2>

                <div className="border-white border-1 w-full my-2"></div>

                <div className="flex flex-row items-center p-1 gap-5">
                    <p className="text-white">You can't message in this chat, and you won't receive their messages.</p>
                    <button className="bg-red-500 py-2 px-5 text-white cursor-pointer rounded-lg hover:rounded-3xl transition-all ease-in" onClick={() =>setShowUnblockModal(true)}>Unblock</button>
                </div>

            </>    

            ):isOtherWhoBlocked ?(

            <>

                <h2 className="text-white font-bold text-xl">You've been blocked</h2>
                <div className="border-white border-1 w-full my-2"></div>
                <p className="text-white text-sm mt-2">You can't send messages to this user.</p>
         

            </>

            ):null}

            
        </div>

        ):(

        <div className="relative p-1 w-full mt-2">
        
            {editingMessage && (
            <div className="absolute left-0 right-0 -top-10 bg-gray-100 text-black text-sm font-medium px-3 py-2 pr-3 ml-1 mr-14 rounded-t-md flex items-center justify-between z-10 animate-in slide-in-from-top duration-200">
                <span className="text-[#6f2db7]">Edit message</span>
                <X
                size={21}
                className="cursor-pointer hover:bg-[#6f2db7] p-1 hover:text-white hover:rounded-xl transition-all text-[#6f2db7]"
                onClick={cancelEdit}
                />
            </div>
            )}

        
            <div className="flex items-center gap-5">
            <input
                type="text"
                value={inputText}
                onChange={handleTyping}
                onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape" && editingMessage) cancelEdit();
                }}
                placeholder={editingMessage ? "Edit message…" : "Input message here"}
                className={`
                flex-1 p-3 rounded-lg outline-none
                bg-white text-[#6f2db7] placeholder-[#6f2db7]
                border ${editingMessage ? "border-[#6f2db7]" : "border-gray-300"}
                focus:border-purple-700 border-1.7 transition-all ease-in transition-colors
                `}
            />

            <SendHorizontal
                className="text-white cursor-pointer  transition-colors"
                size={30}
                onClick={handleSubmit}
            />
            </div>
        </div>
    )}
    </>
);
}

export default MessageInputComponent