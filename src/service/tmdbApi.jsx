import axios from "axios";

const tmdbApi = {
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: "https://api.themoviedb.org/3",

    searchMovies: async (query) => {
        try {
            const response = await axios.get(`${BASE_URL}/search/movie`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    query: query,
                    language: 'en-US',
                    page: 1,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to search movies');
        }
    },

    // 📈 API: Lấy danh sách phim thịnh hành tuần này (Trending This Week)
    getWeeklyTrending: async () => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { movies: [], tvShows: [] };
        }

        try {
            // Lấy trending movies
            const moviesResponse = await axios.get(`${tmdbApi.baseUrl}/trending/movie/week`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });

            // Lấy trending TV shows
            const tvResponse = await axios.get(`${tmdbApi.baseUrl}/trending/tv/week`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });

            return {
                movies: moviesResponse.data.results,
                tvShows: tvResponse.data.results
            };
        } catch (error) {
            console.error("❌ Error fetching weekly trending content:", error.response?.data || error.message);
            return { movies: [], tvShows: [] };
        }
    },


    getTrendingDayMovies: async (timeWindow = "day") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return [];
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/trending/movie/${timeWindow}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data.results;
        } catch (error) {
            console.error("❌ Error fetching trending movies:", error.response?.data || error.message);
            return [];
        }
    },

    // 🔥 API: Lấy chi tiết phim
    getMovieDetails: async (movieId, params = { language: "vi-VN" }) => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return null;
        }
        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/movie/${movieId}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching details for movie ${movieId}:`, error.response?.data || error.message);
            return null;
        }
    },

    // 🔥 API mới: Lấy thông tin độ tuổi (certification)
    getMovieReleaseDates: async (movieId) => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return [];
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/movie/${movieId}/release_dates`, {
                params: {
                    api_key: tmdbApi.apiKey,
                },
            });
            return response.data.results; // Trả về mảng release dates
        } catch (error) {
            console.error(`❌ Error fetching release dates for movie ${movieId}:`, error.response?.data || error.message);
            return [];
        }
    },

    // 📌 API: Lấy danh sách phim đang chiếu rạp
    getNowPlayingMovies: async () => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return [];
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/movie/now_playing`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                    page: 1
                },
            });
            return response.data.results;
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách phim đang chiếu:", error.response?.data || error.message);
            return [];
        }
    },

    // 🔥 API mới: Lấy danh sách diễn viên (credits)
    getMovieCredits: async (movieId) => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { cast: [] };
        }
        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/movie/${movieId}/credits`, {
                params: {
                    api_key: tmdbApi.apiKey,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching credits for movie ${movieId}:`, error.response?.data || error.message);
            return { cast: [] };
        }
    },

    // 🔥 API mới: Lấy danh sách phim gợi ý (recommendations)
    getMovieRecommendations: async (movieId) => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { results: [] };
        }
        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/movie/${movieId}/recommendations`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching recommendations for movie ${movieId}:`, error.response?.data || error.message);
            return { results: [] };
        }
    },
};

export default tmdbApi;