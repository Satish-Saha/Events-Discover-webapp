import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const fetchEvents = async () => {
    const response = await api.get('/events');
    return response.data;
};

export const subscribeEmail = async (email) => {
    const response = await api.post('/subscribe', { email });
    return response.data;
};

export const chatWithAssistant = async (message) => {
    const response = await api.post('/chat', { message });
    return response.data;
};

export default api;