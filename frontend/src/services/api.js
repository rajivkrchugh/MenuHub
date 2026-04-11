import axios from 'axios';
import { getUserId } from '../utils/userId';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
});

// Attach user ID to every request
API.interceptors.request.use((config) => {
  config.headers['x-user-id'] = getUserId();
  return config;
});

export async function sendChatMessage(message, conversationId = null) {
  const body = { message };
  if (conversationId) body.conversationId = conversationId;
  const { data } = await API.post('/chat', body);
  return data;
}

export async function fetchHistory(page = 1, limit = 20) {
  const userId = getUserId();
  const { data } = await API.get(`/chat/history/${userId}`, { params: { page, limit } });
  return data;
}

export async function fetchConversation(id) {
  const { data } = await API.get(`/chat/conversation/${id}`);
  return data;
}

export async function fetchAds() {
  const { data } = await API.get('/ads');
  return data;
}
