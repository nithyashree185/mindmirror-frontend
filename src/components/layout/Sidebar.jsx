import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChatSessions, deleteChat } from '../../api/services';
import { 
  LayoutDashboard, 
  BookOpen, 
  LineChart, 
  CalendarDays, 
  UserCircle,
  LogOut,
  Brain,
  Plus,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState([]);

  // Fetch sessions on mount and whenever we hit Journal page or storage updates
  const fetchSessions = async () => {
    if (!user?.id) return;
    try {
      const data = await getChatSessions(user.id);
      setSessions(data);
    } catch (err) {
      console.error("Failed to load chat sessions", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, location.pathname]);

  useEffect(() => {
    // Listen for custom/storage events to keep sidebar in sync
    const handleSync = () => {
      fetchSessions();
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Insights', path: '/insights', icon: LineChart },
    { name: 'Timeline', path: '/timeline', icon: CalendarDays },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const handleNewReflection = () => {
    localStorage.removeItem('currentChatId');
    navigate('/journal');
    // Force a re-render/reload of journal if already there
    window.dispatchEvent(new Event('storage')); 
  };

  const handleSelectChat = (chatId) => {
    localStorage.setItem('currentChatId', chatId);
    if (location.pathname !== '/journal') {
      navigate('/journal');
    } else {
      // Trigger journal to reload
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleDeleteChat = async (e, chatIdToDelete) => {
    e.stopPropagation();
    try {
      await deleteChat(chatIdToDelete);
      
      // Update local state
      setSessions(prev => prev.filter(c => c._id !== chatIdToDelete));
      
      // If deleted active chat, clear it
      const activeChatId = localStorage.getItem('currentChatId');
      if (activeChatId === chatIdToDelete) {
        localStorage.removeItem('currentChatId');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error("Failed to delete chat session", err);
    }
  };

  const groupSessions = () => {
    const today = [];
    const yesterday = [];
    const thisWeek = [];
    const older = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    sessions.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      if (chatDate >= todayStart) today.push(chat);
      else if (chatDate >= yesterdayStart) yesterday.push(chat);
      else if (chatDate >= weekStart) thisWeek.push(chat);
      else older.push(chat);
    });

    return { today, yesterday, thisWeek, older };
  };

  const grouped = groupSessions();

  const renderChatRow = (c) => (
    <div 
      key={c._id} 
      className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#f5f3ff] text-[#64748b] hover:text-[#483d8b] transition-colors"
    >
      <button 
        onClick={() => handleSelectChat(c._id)} 
        className="flex items-center gap-2 truncate text-left text-sm flex-1 mr-2 outline-none"
      >
        <MessageSquare className="w-3.5 h-3.5 shrink-0" /> 
        <span className="truncate">{c.title || 'Untitled Session'}</span>
      </button>
      <button 
        onClick={(e) => handleDeleteChat(e, c._id)} 
        className="opacity-0 group-hover:opacity-100 hover:text-[#ef4444] transition-all p-0.5 rounded shrink-0 outline-none"
        title="Delete Reflection"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#e5e7eb] flex flex-col pt-8 pb-6 px-4 z-20">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="bg-[#e6e6fa] p-2 rounded-xl">
          <Brain className="w-6 h-6 text-[#483d8b]" />
        </div>
        <span className="text-xl font-semibold text-[#2f4f4f] tracking-tight">
          MindMirror
        </span>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6 pr-2">
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive && item.path !== '/journal'
                    ? "bg-[#f5f3ff] text-[#483d8b]" 
                    : "text-[#64748b] hover:bg-[#f9fafb] hover:text-[#2f4f4f]"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="px-1 border-t border-[#f1f5f9] pt-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">Conversations</span>
          </div>
          
          <button 
            onClick={handleNewReflection}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#2f4f4f] hover:border-[#a78bfa] hover:text-[#483d8b] transition-all mb-4 shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Reflection
          </button>

          <div className="flex flex-col gap-4">
            {grouped.today.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase px-2 mb-1">Today</p>
                {grouped.today.map(renderChatRow)}
              </div>
            )}
            {grouped.yesterday.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase px-2 mb-1">Yesterday</p>
                {grouped.yesterday.map(renderChatRow)}
              </div>
            )}
            {grouped.thisWeek.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase px-2 mb-1">This Week</p>
                {grouped.thisWeek.map(renderChatRow)}
              </div>
            )}
            {grouped.older.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#9ca3af] uppercase px-2 mb-1">Older</p>
                {grouped.older.map(renderChatRow)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[#f3f4f6]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#fef2f2] hover:text-[#ef4444] transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
