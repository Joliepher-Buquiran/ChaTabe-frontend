// src/components/ConfirmationModal.jsx
import React from "react";
import { X } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div className="absolute inset-0  bg-opacity-70 backdrop-blur-[1px] transition-opacity duration-200 ease-out" onClick={onClose} style={{ opacity: isOpen ? 1 : 0 }}/>

      
      <div className="relative bg-[#2d2d2d] rounded-xl p-6 w-80 text-white shadow-2xl transition-all duration-200 ease-out" style={{ opacity: isOpen ? 1 : 0,transform: isOpen ? "scale(1)" : "scale(0.95)",}}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <X size={18} />
        </button>

        <h3 className="text-lg font-semibold mb-6 text-center">Do you want to delete this message?</h3>

        <div className="flex justify-center gap-4">
            
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md  hover:bg-red-700 transition cursor-pointer transition">Delete</button>
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-md  hover:bg-gray-700 transition cursor-pointer transition">Cancel</button>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;