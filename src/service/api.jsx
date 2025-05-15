import axios from "axios";

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // URL backend: http://localhost:8080/api/v1
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để thêm token vào header (nếu cần xác thực)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor xử lý lỗi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Lấy danh sách tất cả phim
export const getAllMovies = async () => {
    const response = await api.get("/movies/all");
    return response.data; // Trả về List<MovieDTO>
};

// Lấy chi tiết phim theo ID
export const getMovieById = async (movieId) => {
    const response = await api.get(`/movies/get/${movieId}`);
    return response.data; // Trả về MovieDTO
};

export default api;