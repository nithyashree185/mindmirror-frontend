import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createChat, sendMessage, getChatMessages } from '../api/services';
import { Send, Brain, User, Calendar, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const JournalPage = () => {
  const { user } = useAuth();
  const [chatId, setChatId] = useState(localStorage.getItem('currentChatId'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to load or initialize chat
  const loadChat = async () => {
    if (!user?.id) return;
    
    const storedChatId = localStorage.getItem('currentChatId');
    
    if (storedChatId) {
      setChatId(storedChatId);
      try {
        const history = await getChatMessages(storedChatId);
        if (history && history.length > 0) {
          setMessages(history.map(m => ({
            role: m.role,
            content: m.content,
            mood: m.mood,
            timestamp: m.createdAt,
            id: m._id || Date.now() + Math.random()
          })));
        } else {
          setMessages([
            { 
              role: 'assistant', 
              content: "Hello. I'm here to listen. How are you feeling right now?",
              id: 'init'
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    } else {
      // Create new chat
      try {
        const data = await createChat(user.id);
        const id = data.chatId || data.id || data._id || data.chat?.id || data.chat?._id || 'fallback-id';
        setChatId(id);
        localStorage.setItem('currentChatId', id);
        setMessages([
          { 
            role: 'assistant', 
            content: "Hello. I'm here to listen. How are you feeling right now?",
            id: 'init'
          }
        ]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    }
  };

  useEffect(() => {
    loadChat();
    
    // Listen for custom event from Sidebar
    const handleStorageChange = () => {
      loadChat();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let currentChatId = chatId;
    
    if (!currentChatId) {
      try {
        const data = await createChat(user.id);
        currentChatId = data.chatId || data.id || data._id || data.chat?.id || data.chat?._id || 'fallback-id';
        setChatId(currentChatId);
        localStorage.setItem('currentChatId', currentChatId);
      } catch (err) {
        console.error("Could not create chat ID on send", err);
      }
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, id: Date.now() }]);
    setIsTyping(true);

    try {
      const response = await sendMessage(currentChatId, userMessage, user.id);
      setIsTyping(false);
      
      const replyText = response?.reply || "I'm sorry, I couldn't process that.";
      const detectedMood = response?.mood;

      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: replyText, 
          mood: detectedMood,
          summary: response?.journalSummary,
          streak: response?.streak,
          timestamp: response?.timestamp || new Date().toISOString(),
          id: Date.now() + 1
        }
      ]);
      // Dispatch storage event so sidebar updates the chat title
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      setIsTyping(false);
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "I'm sorry, I couldn't process that right now.", id: Date.now() + 1 }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      <div className="flex-1 overflow-y-auto pb-32 pt-4 px-4 scroll-smooth custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex gap-4",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#e6e6fa] flex flex-shrink-0 items-center justify-center mt-1">
                  <Brain className="w-5 h-5 text-[#483d8b]" />
                </div>
              )}
              
              <div className="flex flex-col max-w-[80%]">
                <div className={cn(
                  "rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm w-full",
                  msg.role === 'user' 
                    ? "bg-[#483d8b] text-white rounded-tr-sm" 
                    : "bg-white text-[#2f4f4f] rounded-tl-sm border border-[#e5e7eb]"
                )}>
                  {msg.content}
                  
                  {msg.role === 'assistant' && msg.id !== 'init' && (
                    <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-wrap gap-2 items-center">
                      {msg.mood && (
                        <div className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 bg-[#f5f3ff] text-[#483d8b] rounded-md border border-[#e6e6fa]">
                          Mood: {msg.mood}
                        </div>
                      )}
                      {msg.streak && (
                        <div className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 bg-orange-50 text-orange-600 rounded-md border border-orange-100 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Streak: {msg.streak}
                        </div>
                      )}
                      {msg.timestamp && (
                        <div className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.summary && (
                  <div className="mt-2 text-xs text-[#64748b] bg-white/50 border border-[#e5e7eb] px-3 py-2 rounded-lg self-start shadow-sm backdrop-blur-sm italic">
                    AI Note: {msg.summary}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#e5e7eb] flex flex-shrink-0 items-center justify-center mt-1">
                  <User className="w-5 h-5 text-[#64748b]" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
             <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex gap-4 justify-start"
           >
             <div className="w-8 h-8 rounded-full bg-[#e6e6fa] flex flex-shrink-0 items-center justify-center mt-1">
               <Brain className="w-5 h-5 text-[#483d8b]" />
             </div>
             <div className="bg-white rounded-2xl rounded-tl-sm border border-[#e5e7eb] px-5 py-4 shadow-sm flex items-center gap-1">
               <motion.div className="w-2 h-2 bg-[#a78bfa] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
               <motion.div className="w-2 h-2 bg-[#8b5cf6] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
               <motion.div className="w-2 h-2 bg-[#7c3aed] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
             </div>
           </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5] to-transparent pt-10 pb-8 px-8">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden focus-within:ring-2 focus-within:ring-[#e6e6fa] focus-within:border-[#a78bfa] transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Reflect on your day..."
              className="w-full py-4 pl-6 pr-14 outline-none text-[#2f4f4f] bg-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 p-2 bg-[#483d8b] text-white rounded-xl hover:bg-[#5e50a8] disabled:opacity-50 disabled:hover:bg-[#483d8b] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-[#9ca3af]">MindMirror AI can make mistakes. Consider verifying important insights.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
