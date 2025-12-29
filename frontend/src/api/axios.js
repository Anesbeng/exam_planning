import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});


export default api;
