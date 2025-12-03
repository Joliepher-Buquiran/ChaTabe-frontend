import React from 'react'
import { X } from "lucide-react";

const BlockConfirmationModal = ({showBlockModal,setShowBlockModal,blockContact,isBlocking}) => {
    if(!showBlockModal) return null;

    function handleBlock(){
        blockContact();
        setShowBlockModal(false);
    }

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div className="absolute inset-0  bg-opacity-70 backdrop-blur-[1px] transition-opacity duration-200 ease-out" onClick={() => setShowBlockModal(false)} style={{ opacity: showBlockModal ? 1 : 0 }}/>

      
      <div className="relative bg-[#2d2d2d] rounded-xl p-6 w-80 text-white shadow-2xl transition-all duration-200 ease-out" style={{ opacity: showBlockModal ? 1 : 0,transform: showBlockModal ? "scale(1)" : "scale(0.95)",}}>
        <button onClick={() => setShowBlockModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <X size={18} />
        </button>

        <div className='flex flex-col gap-1'>

            <h3 className="text-xl font-semibold mb-1 text-center">Block this contact?</h3>

            <div className="border-gray-400 border-1 w-full mb-2 "></div>
    
            <p className='text-white text-center text-sm mb-5'>You won't receive messages from this contact</p>

            <div className="flex justify-center gap-4">
            
            <button onClick={handleBlock} className="px-6 py-2 bg-red-600 text-white rounded-md  hover:bg-red-700 transition cursor-pointer transition" disabled={isBlocking}>Block</button>
            <button onClick={() => setShowBlockModal(false)} className="px-6 py-2 bg-gray-600 text-white rounded-md  hover:bg-gray-700 transition cursor-pointer transition-all" >Cancel</button>

        </div>

        </div>
        
      </div>
    </div>
  )
}

export default BlockConfirmationModal