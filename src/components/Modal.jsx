import React from "react";
import Btn from "./Btn";

function Modal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/15 bg-opacity-40 backdrop-blur">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700 border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl">
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-scroll max-h-96">
                    {children}
                </div>

                {/* Footer (optional) */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-300 flex gap-5 justify-end">
                   {footer}
                </div>
            </div>
        </div>
    );
}

export default Modal;
