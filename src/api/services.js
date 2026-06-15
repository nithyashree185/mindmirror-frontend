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
export const createChat = async (userId, title) => {
  const response = await api.post('/chat/create', { userId, title });
  // Handle backend sometimes returning _id instead of chatId
  return {
    chatId: response.data?.chatId || response.data?.id || response.data?._id || response.data?.chat?.id || response.data?.chat?._id
  };
};

export const deleteChat = async (chatId) => {
  // Try multiple endpoint patterns to match the backend
  const attempts = [
    () => api.delete(`/chat/${chatId}`),
    () => api.delete(`/chat/delete/${chatId}`),
    () => api.post('/chat/delete', { chatId }),
    () => api.post(`/chat/delete/${chatId}`),
  ];

  for (const attempt of attempts) {
    try {
      const response = await attempt();
      return response.data;
    } catch (err) {
      // 404 means endpoint doesn't exist, try next pattern
      // 400/500 means endpoint exists but failed — still try next
      continue;
    }
  }

  // If no endpoint worked, throw so the UI knows deletion failed
  throw new Error('Could not delete chat — no working delete endpoint found on backend');
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
