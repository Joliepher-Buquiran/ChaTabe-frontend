import React from 'react'
import { LogOut, X } from "lucide-react";

const LogoutConfirmationModal = ({showLogoutModal,setShowLogoutModal,logginOut,Logout}) => {

    if(!showLogoutModal) return null;

    function handleLogout(){
        Logout();
        setShowLogoutModal(false);
    }

  return (
   
       <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          <div className="absolute inset-0  bg-opacity-70 backdrop-blur-[1px] transition-opacity duration-200 ease-out" onClick={() => setShowLogoutModal(false)} style={{ opacity: showLogoutModal ? 1 : 0 }}/>
    
          
          <div className="relative bg-white rounded-xl p-6 w-80 text-white shadow-2xl transition-all duration-200 ease-out" style={{ opacity: setShowLogoutModal ? 1 : 0,transform: showLogoutModal ? "scale(1)" : "scale(0.95)",}}>
            <button onClick={() => setShowLogoutModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
                <X size={18} className='text-[#6f2db7]'/>
            </button>
    
            <div className='flex flex-col gap-1'>
    
                <h3 className="text-xl font-semibold text-[#6f2db7] mb-1 text-center">Logout?</h3>
    
                <div className="border-[#6f2db7] border-1 w-full mt-3 mb-1 "></div>
                <p className='text-center mb-4 text-[#6f2db7] font-semibold'>Do you want to logout?</p>
        
                <div className="flex justify-center gap-4">
                
                <button onClick={handleLogout} className="px-6 py-2 bg-red-600 font-semibold text-white rounded-md  hover:bg-red-700 transition cursor-pointer transition flex items-center justify-center gap-1" disabled={logginOut} ><LogOut size={20}/>Logout</button>
                <button onClick={() => setShowLogoutModal(false)} className="px-6 py-2 font-semibold bg-gray-600 text-white rounded-md  hover:bg-gray-700 transition cursor-pointer transition-all" >Cancel</button>
    
            </div>
    
            </div>
            
          </div>
        </div>



  )
}

export default LogoutConfirmationModal