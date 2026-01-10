import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';
import { chatWithAssistant } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I can help you choose events. Ask me anything like “What’s happening this weekend?”' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatWithAssistant(input);
      // chatWithAssistant returns { reply: string } directly
      const assistantMessage = { role: 'assistant', text: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
        <FaRobot className="text-blue-500" />
        <h3 className="text-lg font-semibold">Event Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg whitespace-pre-wrap text-sm ${msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                }`}
            >
              {msg.role === 'user' ? (
                msg.text
              ) : (
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg text-sm">
              Typing…
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about events..."
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white rounded-lg transition-colors"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}