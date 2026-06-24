import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ShieldBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Salam! I'm ShieldBot. Need help checking a message or a bank transfer?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/chat/message`, {
        message: input,
        history: messages.slice(-5) // Send last few messages for context
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.response?.data?.message || "Oops, I disconnected. Check my API key!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden mb-4 animate-fade-in-up">
          {/* Header */}
          <div className="bg-navy p-5 flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6q-2 0-2 2v2q0 2 2 2 2 0 2-2V8q0-2-2-2z"/><circle cx="12" cy="14" r="1"/></svg>
             </div>
             <div>
                <h4 className="text-white font-bold text-sm">ShieldBot</h4>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                   <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Online Guardian</span>
                </div>
             </div>
             <button 
               onClick={() => setIsOpen(false)}
               className="ml-auto text-white/50 hover:text-white transition-colors"
             >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-navy text-white rounded-tr-none' 
                      : 'bg-gray-100 text-navy rounded-tl-none border border-gray-200'
                  }`}>
                     {m.content}
                  </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none border border-gray-200 flex gap-1">
                     <div className="w-1 h-1 bg-navy/40 rounded-full animate-bounce"></div>
                     <div className="w-1 h-1 bg-navy/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1 h-1 bg-navy/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
               </div>
             )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border bg-gray-50 flex gap-2">
             <input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask me anything..."
               className="flex-1 bg-white border border-border rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-navy transition-all"
             />
             <button 
               type="submit"
               disabled={!input.trim() || isLoading}
               className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
             >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
             </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-navy text-white rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6q-2 0-2 2v2q0 2 2 2 2 0 2-2V8q0-2-2-2z"/><circle cx="12" cy="14" r="1"/></svg>
        )}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </button>
    </div>
  );
};

export default ShieldBot;
