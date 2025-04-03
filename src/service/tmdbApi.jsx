import axios from "axios";

const tmdbApi = {
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: "https://api.themoviedb.org/3",

    // API: Tìm kiếm cả movie và TV shows
    searchContent: async (query, type = "multi") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            throw new Error("API Key is missing");
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/search/${type}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    query: query,
                    language: "vi-VN",
                    page: 1,
                },
            });
            return response.data || { results: [] };
        } catch (error) {
            console.error("❌ Failed to search content:", error.response?.data || error.message);
            throw new Error("Failed to search content");
        }
    },

    // API: Lấy danh sách trending tuần này (movie và TV shows)
    getWeeklyTrending: async () => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { movies: [], tvShows: [] };
        }

        try {
            const moviesResponse = await axios.get(`${tmdbApi.baseUrl}/trending/movie/week`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });

            const tvResponse = await axios.get(`${tmdbApi.baseUrl}/trending/tv/week`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });

            return {
                movies: moviesResponse.data.results || [],
                tvShows: tvResponse.data.results || [],
            };
        } catch (error) {
            console.error("❌ Error fetching weekly trending content:", error.response?.data || error.message);
            return { movies: [], tvShows: [] };
        }
    },

    // API: Lấy danh sách trending theo ngày (movie hoặc TV)
    getTrendingByDay: async (type = "movie", timeWindow = "day") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return [];
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/trending/${type}/${timeWindow}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data.results || [];
        } catch (error) {
            console.error(`❌ Error fetching trending ${type}:`, error.response?.data || error.message);
            return [];
        }
    },

    // API: Lấy chi tiết nội dung (movie hoặc TV)
    getContentDetails: async (id, type = "movie", params = { language: "vi-VN" }) => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return null;
        }

        try {
            let response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    ...params,
                },
            });

            let data = response.data;
            // Nếu không có overview (mô tả) bằng ngôn ngữ "vi-VN", thử lại với "en-US"
            if (!data.overview) {
                response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}`, {
                    params: {
                        api_key: tmdbApi.apiKey,
                        language: "en-US",
                    },
                });
                data = response.data;
            }

            return data || null;
        } catch (error) {
            console.error(`❌ Error fetching details for ${type} ${id}:`, error.response?.data || error.message);
            return null;
        }
    },

    // API: Lấy thông tin độ tuổi (release dates cho movie, content rating cho TV)
    getContentReleaseInfo: async (id, type = "movie") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return [];
        }

        try {
            const endpoint = type === "movie" ? `movie/${id}/release_dates` : `tv/${id}/content_ratings`;
            const response = await axios.get(`${tmdbApi.baseUrl}/${endpoint}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                },
            });
            return response.data.results || [];
        } catch (error) {
            console.error(`❌ Error fetching release info for ${type} ${id}:`, error.response?.data || error.message);
            return [];
        }
    },

    // API: Lấy danh sách phim/TV đang chiếu
    getNowPlayingContent: async (type = "movie") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return [];
        }

        const endpoint = type === "movie" ? "movie/now_playing" : "tv/airing_today";
        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/${endpoint}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                    page: 1,
                },
            });
            return response.data.results || [];
        } catch (error) {
            console.error(`❌ Error fetching now playing ${type}:`, error.response?.data || error.message);
            return [];
        }
    },

    // API: Lấy danh sách diễn viên (credits cho cả movie và TV)
    getContentCredits: async (id, type = "movie") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { cast: [] };
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}/credits`, {
                params: {
                    api_key: tmdbApi.apiKey,
                },
            });
            return response.data || { cast: [] };
        } catch (error) {
            console.error(`❌ Error fetching credits for ${type} ${id}:`, error.response?.data || error.message);
            return { cast: [] };
        }
    },

    // API: Lấy danh sách gợi ý (recommendations cho cả movie và TV)
    getContentRecommendations: async (id, type = "movie") => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { results: [] };
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}/recommendations`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data || { results: [] };
        } catch (error) {
            console.error(`❌ Error fetching recommendations for ${type} ${id}:`, error.response?.data || error.message);
            return { results: [] };
        }
    },

    // API: Lấy chi tiết mùa của series (TV only)
    getTvSeasonDetails: async (seriesId, seasonNumber) => {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            return { episodes: [] };
        }

        try {
            let response = await axios.get(`${tmdbApi.baseUrl}/tv/${seriesId}/season/${seasonNumber}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });

            let data = response.data;
            // Nếu không có episode overview bằng "vi-VN", thử lại với "en-US"
            if (data.episodes && data.episodes.some(episode => !episode.overview)) {
                response = await axios.get(`${tmdbApi.baseUrl}/tv/${seriesId}/season/${seasonNumber}`, {
                    params: {
                        api_key: tmdbApi.apiKey,
                        language: "en-US",
                    },
                });
                data = response.data;
            }

            return data || { episodes: [] };
        } catch (error) {
            console.error(`❌ Error fetching season ${seasonNumber} for series ${seriesId}:`, error.response?.data || error.message);
            return { episodes: [] };
        }
    },
};

export default tmdbApi;