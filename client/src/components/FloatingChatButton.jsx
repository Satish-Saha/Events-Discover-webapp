import React, { useState } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import ChatBot from './ChatBot';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Open chat"
      >
        <FaComments className="text-xl" />
      </button>

      {/* Chat popup overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md h-[600px] flex flex-col">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Chat window */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700">
              <ChatBot />
            </div>
          </div>
        </div>
      )}
    </>
  );
}