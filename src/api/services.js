import { api } from './axios';

// Auth Services
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async (refreshToken) => {
  const response = await api.post('/auth/logout', { refreshToken });
  return response.data;
};

// Chat Services
export const createChat = async (userId) => {
  const response = await api.post('/chat/create', { userId });
  // Handle backend sometimes returning _id instead of chatId
  return {
    chatId: response.data?.chatId || response.data?.id || response.data?._id || response.data?.chat?.id || response.data?.chat?._id
  };
};

export const sendMessage = async (chatId, message, userId) => {
  const response = await api.post('/chat/message', { chatId, message, userId });
  // Normalizing backend structure which wraps in { success, data }
  return response.data?.data || response.data;
};

export const getChatSessions = async (userId) => {
  const response = await api.get(`/chat/sessions/${userId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getChatMessages = async (chatId) => {
  const response = await api.get(`/chat/messages/${chatId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const getMoods = async (userId) => {
  const response = await api.get(`/chat/moods/${userId}`);
  // Returns array directly: [ { mood, message, createdAt } ]
  return Array.isArray(response.data) ? response.data : [];
};

export const getMoodStats = async (userId) => {
  const response = await api.get(`/chat/mood-stats/${userId}`);
  return response.data || {};
};

// Insights Services
export const getInsightsMood = async (userId) => {
  const response = await api.get(`/insights/mood`, { params: { userId } });
  // Returns: { moodCount, dominantMood, summary, causes, suggestion } directly
  return response.data;
};

export const getInsightsWeekly = async (userId) => {
  const response = await api.get(`/insights/weekly`, { params: { userId } });
  // Returns: { success, data: { moodCount, dominantMood, percentages, summary, causes, suggestion } }
  return response.data?.data || response.data || {};
};

export const getInsightsTimeline = async (userId) => {
  const response = await api.get(`/insights/timeline`, { params: { userId } });
  // Returns: { success, data: [ { date, fullDate, mood, intensity, color } ] }
  return response.data?.data || (Array.isArray(response.data) ? response.data : []);
};

export const getInsightsTriggers = async (userId) => {
  const response = await api.get(`/insights/triggers`, { params: { userId } });
  // Returns: { success, data: { triggers: { [name]: emotion }, insight, suggestion } }
  return response.data?.data || response.data || { triggers: {} };
};

export const getInsightsProfile = async (userId) => {
  const response = await api.get(`/insights/profile`, { params: { userId } });
  // Returns: { success, data: { stressLevel, positivity, emotionalStability, dominantMood } }
  return response.data?.data || response.data || {};
};

// Streak Service
export const getStreak = async (userId) => {
  const response = await api.get(`/streak/${userId}`);
  // Returns: { success, currentStreak, longestStreak, totalJournalDays, badge }
  return response.data || {};
};
