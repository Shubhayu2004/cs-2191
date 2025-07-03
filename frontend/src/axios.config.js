import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}`,  
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
        url: config.url,
        headers: config.headers
    });
    return config;
});

// Add a response interceptor to handle expired tokens
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or unauthorized
            localStorage.removeItem('token');
            // Optionally, clear user context if available
            window.location.href = '/user/logout'; // Redirect to logout or login page
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;