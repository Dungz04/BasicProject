import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// Flag để kiểm tra xem đang trong quá trình logout hay không
let isLoggingOut = false;

const authApi = {
    async register(email, password, name) {
        try {
            const response = await axios.post(`${BASE_URL}/register`, {
                email,
                password,
                name
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    },

    async login(email, password) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password
            });

            // Lưu token vào localStorage
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    },


    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            const response = await axios.post(`${BASE_URL}/refresh-token`, {
                refreshToken
            });

            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Làm mới token thất bại');
        }
    },

    async logout() {
        if (isLoggingOut) return; // Prevent multiple logout calls

        isLoggingOut = true;
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            await axios.post(`${BASE_URL}/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`, null, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Luôn xóa local storage và reset flag
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            isLoggingOut = false;
        }
    },

    getAccessToken() {
        return localStorage.getItem('accessToken');
    },

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },

    isAuthenticated() {
        return !!this.getAccessToken();
    }
};

// Thêm interceptor để tự động refresh token
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Không thử refresh token nếu đang logout hoặc đã thử refresh rồi
        if (error.response?.status === 401 && !originalRequest._retry && !isLoggingOut) {
            originalRequest._retry = true;

            try {
                const response = await authApi.refreshToken();
                if (response.accessToken) {
                    originalRequest.headers['Authorization'] = 'Bearer ' + response.accessToken;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // Chỉ logout nếu không phải đang trong quá trình logout
                if (!isLoggingOut) {
                    await authApi.logout();
                }
                throw refreshError;
            }
        }

        return Promise.reject(error);
    }
);

export default authApi; 