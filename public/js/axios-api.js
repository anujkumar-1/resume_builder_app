// api.js
const api = axios.create({
    baseURL: 'http://localhost:3000', // Your backend URL
    headers: {
        'Content-Type': 'application/json'
    }
});

// REQUEST Interceptor: Attach token to every outgoing call
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// RESPONSE Interceptor: Global error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
        return Promise.reject(error);
    }
);

// Export it if using modules, or just let it be global
window.api = api; 
