import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const getAllMovies = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/movies/all`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phim:', error);
        throw error;
    }
};

export const getMovieById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/movies/get/${id}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết phim:', error);
        throw error;
    }
};