import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createChat, sendMessage, getChatMessages } from '../api/services';
import { Send, Brain, User, Calendar, Flame, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const JournalPage = () => {
  const { user } = useAuth();
  const [chatId, setChatId] = useState(localStorage.getItem('currentChatId'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const loadedChatIdRef = useRef(chatId);
  const messagesRef = useRef(messages);

  // Sync refs with state to prevent stale closures in event listeners
  useEffect(() => {
    loadedChatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load chat session messages from backend
  const loadChat = async (force = false) => {
    if (!user?.id) return;
    
    const storedChatId = localStorage.getItem('currentChatId');
    
    if (storedChatId) {
      // Avoid duplicate fetches/reloads if already displaying this chat with messages
      if (storedChatId === loadedChatIdRef.current && messagesRef.current.length > 0 && !force) {
        return;
      }
      
      loadedChatIdRef.current = storedChatId;
      setChatId(storedChatId);
      setIsLoadingChat(true);
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
              content: "Hello! I'm here to listen. How are you feeling right now?",
              id: 'init'
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      } finally {
        setIsLoadingChat(false);
      }
    } else {
      loadedChatIdRef.current = null;
      setChatId(null);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadChat();
    
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

  // Handle creating a new chat session with a title
  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!titleInput.trim() || !user?.id) return;
    
    setIsLoadingChat(true);
    try {
      const data = await createChat(user.id, titleInput.trim());
      const id = data.chatId || data.id || data._id || data.chat?.id || data.chat?._id || 'fallback-id';
      
      loadedChatIdRef.current = id;
      setChatId(id);
      localStorage.setItem('currentChatId', id);
      setMessages([
        { 
          role: 'assistant', 
          content: `Hello! I'm here to listen. You've started the reflection: "${titleInput.trim()}". How are you feeling right now?`,
          id: 'init'
        }
      ]);
      setTitleInput('');
      
      // Notify the Sidebar to update
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to create new chat:', error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to local state immediately
    const userMsgId = Date.now();
    setMessages(prev => [...prev, { role: 'user', content: userMessage, id: userMsgId }]);
    setIsTyping(true);

    try {
      const response = await sendMessage(chatId, userMessage, user.id);
      setIsTyping(false);
      
      const replyText = response?.reply || "I'm sorry, I couldn't process that.";
      const detectedMood = response?.mood;

      // Append assistant message safely to the state
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: replyText, 
          mood: detectedMood,
          streak: response?.streak,
          timestamp: response?.timestamp || new Date().toISOString(),
          id: Date.now() + 1
        }
      ]);
      
      // Dispatch event to refresh sidebars / other pages if needed
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

  // 1. If no active session, show the beautiful Title Setup View
  if (!chatId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-[#e5e7eb] p-8 rounded-2xl shadow-sm text-center"
        >
          <div className="bg-[#e6e6fa] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-[#483d8b]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2f4f4f] mb-2">New Reflection</h2>
          <p className="text-[#64748b] text-sm mb-6">
            Give this reflection session a title to help you locate and track your entries later.
          </p>
          
          <form onSubmit={handleCreateChat} className="space-y-4">
            <input
              type="text"
              required
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Navigating stress, Morning thoughts..."
              className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] outline-none focus:ring-2 focus:ring-[#e6e6fa] focus:border-[#a78bfa] transition-all text-sm text-[#2f4f4f]"
            />
            <button
              type="submit"
              disabled={isLoadingChat || !titleInput.trim()}
              className="w-full py-3 bg-[#483d8b] hover:bg-[#5e50a8] disabled:opacity-50 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isLoadingChat ? 'Starting session...' : 'Begin Session'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Chat interface
  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] relative">
      {isLoadingChat && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#64748b]">
          Loading messages...
        </div>
      ) : (
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
      )}

      {/* Input container at bottom */}
      <div className="fixed bottom-0 left-64 right-0 bg-gradient-to-t from-[#f5f5f5] via-[#f5f5f5] to-transparent pt-10 pb-8 px-8 z-10">
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
              disabled={!chatId || isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || !chatId}
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
