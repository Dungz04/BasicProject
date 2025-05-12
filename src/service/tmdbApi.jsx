import axios from "axios";

const tmdbApi = {
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    baseUrl: "https://api.themoviedb.org/3",

    ensureApiKey() {
        if (!tmdbApi.apiKey) {
            console.error("⚠️ API Key is missing. Please set VITE_TMDB_API_KEY in .env");
            throw new Error("API Key is missing");
        }
    },

    // API: Tìm kiếm cả movie và TV shows
    searchContent: async (query, type = "multi", page = 1) => {
        tmdbApi.ensureApiKey();

        if (!query || typeof query !== "string" || query.trim() === "") {
            console.error("⚠️ Invalid search query");
            throw new Error("Từ khóa tìm kiếm không hợp lệ");
        }

        if (!["multi", "movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid search type");
            throw new Error("Loại tìm kiếm không hợp lệ");
        }

        if (page < 1 || page > 500) {
            console.error("⚠️ Invalid page number. Must be between 1 and 500");
            throw new Error("Số trang không hợp lệ");
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/search/${type}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    query: query.trim(),
                    language: "vi-VN",
                    page,
                },
            });
            return response.data || { results: [], total_pages: 1, total_results: 0 };
        } catch (error) {
            console.error("❌ Failed to search content:", error.response?.data || error.message);
            throw new Error("Không thể tìm kiếm nội dung");
        }
    },

    // API: Lấy danh sách trending tuần này (movie và TV shows)
    getWeeklyTrending: async () => {
        tmdbApi.ensureApiKey();

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
            throw new Error("Không thể lấy danh sách trending");
        }
    },

    // API: Lấy danh sách trending theo ngày (movie hoặc TV)
    getTrendingByDay: async (type = "movie", timeWindow = "day") => {
        tmdbApi.ensureApiKey();

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type");
            throw new Error("Loại nội dung không hợp lệ");
        }

        if (!["day", "week"].includes(timeWindow)) {
            console.error("⚠️ Invalid time window");
            throw new Error("Thời gian không hợp lệ");
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
            throw new Error(`Không thể lấy danh sách trending ${type}`);
        }
    },

    // API: Lấy chi tiết nội dung (movie hoặc TV)
    getContentDetails: async (id, type = "movie", params = { language: "vi-VN" }) => {
        tmdbApi.ensureApiKey();

        if (!id || isNaN(id)) {
            console.error("⚠️ Invalid content ID");
            throw new Error("ID nội dung không hợp lệ");
        }

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type. Must be 'movie' or 'tv'");
            throw new Error("Loại nội dung không hợp lệ");
        }

        try {
            let response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    ...params,
                },
            });

            let data = response.data;
            // Fallback to en-US if no overview
            if (!data.overview) {
                response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}`, {
                    params: {
                        api_key: tmdbApi.apiKey,
                        language: "en-US",
                    },
                });
                data = response.data;
            }

            return data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.error(`❌ Content with ID ${id} not found for type ${type}`);
                throw new Error(`Nội dung với ID ${id} không tồn tại`);
            }
            console.error(`❌ Error fetching details for ${type} ${id}:`, error.response?.data || error.message);
            throw new Error(`Không thể lấy chi tiết nội dung: ${error.message}`);
        }
    },

    // API: Lấy thông tin độ tuổi (release dates cho movie, content rating cho TV)
    getContentReleaseInfo: async (id, type = "movie") => {
        tmdbApi.ensureApiKey();

        if (!id || isNaN(id)) {
            console.error("⚠️ Invalid content ID");
            throw new Error("ID nội dung không hợp lệ");
        }

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type");
            throw new Error("Loại nội dung không hợp lệ");
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
            throw new Error(`Không thể lấy thông tin độ tuổi cho ${type} ${id}`);
        }
    },

    // API: Lấy danh sách phim/TV đang chiếu
    getNowPlayingContent: async (type = "movie") => {
        tmdbApi.ensureApiKey();

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type");
            throw new Error("Loại nội dung không hợp lệ");
        }

        try {
            const endpoint = type === "movie" ? "movie/now_playing" : "tv/airing_today";
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
            throw new Error(`Không thể lấy danh sách ${type} đang chiếu`);
        }
    },

    // API: Lấy danh sách diễn viên (credits cho cả movie và TV)
    getContentCredits: async (id, type = "movie") => {
        tmdbApi.ensureApiKey();

        if (!id || isNaN(id)) {
            console.error("⚠️ Invalid content ID");
            throw new Error("ID nội dung không hợp lệ");
        }

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type");
            throw new Error("Loại nội dung không hợp lệ");
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
            throw new Error(`Không thể lấy danh sách diễn viên cho ${type} ${id}`);
        }
    },

    // API: Lấy danh sách gợi ý (recommendations cho cả movie và TV)
    getContentRecommendations: async (id, type = "movie") => {
        tmdbApi.ensureApiKey();

        if (!id || isNaN(id)) {
            console.error("⚠️ Invalid content ID");
            throw new Error("ID nội dung không hợp lệ");
        }

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type");
            throw new Error("Loại nội dung không hợp lệ");
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
            throw new Error(`Không thể lấy danh sách gợi ý cho ${type} ${id}`);
        }
    },

    // API: Lấy danh sách video (trailers, teasers, etc.) cho movie hoặc TV
    getContentVideos: async (id, type = "movie") => {
        tmdbApi.ensureApiKey();

        if (!id || isNaN(id)) {
            console.error("⚠️ Invalid content ID");
            throw new Error("ID nội dung không hợp lệ");
        }

        if (!["movie", "tv"].includes(type)) {
            console.error("⚠️ Invalid content type");
            throw new Error("Loại nội dung không hợp lệ");
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/${type}/${id}/videos`, {
                params: {
                    api_key: tmdbApi.apiKey,
                },
            });
            if (process.env.NODE_ENV !== "production") {
                console.log(`API response for ${type}/${id}/videos:`, response.data);
            }
            return response.data || { results: [] };
        } catch (error) {
            console.error(`❌ Error fetching videos for ${type} ${id}:`, error.response?.data || error.message);
            throw new Error(`Không thể lấy danh sách video cho ${type} ${id}`);
        }
    },

    // API: Lấy chi tiết mùa của series (TV only)
    getTvSeasonDetails: async (seriesId, seasonNumber) => {
        tmdbApi.ensureApiKey();

        if (!seriesId || isNaN(seriesId)) {
            console.error("⚠️ Invalid series ID");
            throw new Error("ID series không hợp lệ");
        }

        if (!seasonNumber || isNaN(seasonNumber) || seasonNumber < 0) {
            console.error("⚠️ Invalid season number");
            throw new Error("Số mùa không hợp lệ");
        }

        try {
            let response = await axios.get(`${tmdbApi.baseUrl}/tv/${seriesId}/season/${seasonNumber}`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });

            let data = response.data;
            // Fallback to en-US if episodes lack overview
            if (data.episodes && data.episodes.some(episode => !episode.overview)) {
                response = await axios.get(`${tmdbApi.baseUrl}/tv/${seriesId}/season/${seasonNumber}`, {
                    params: {
                        api_key: tmdbApi.apiKey,
                        language: "en-US",
                    },
                });
                data = response.data;
            }

            return data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.error(`❌ Season ${seasonNumber} for series ${seriesId} not found`);
                throw new Error(`Mùa ${seasonNumber} của series ${seriesId} không tồn tại`);
            }
            console.error(`❌ Error fetching season ${seasonNumber} for series ${seriesId}:`, error.response?.data || error.message);
            throw new Error(`Không thể lấy chi tiết mùa: ${error.message}`);
        }
    },

    // API: Lấy danh sách phim mới ra mắt (upcoming movies)
    getUpcomingMovies: async (page = 1, region = "VN") => {
        tmdbApi.ensureApiKey();

        if (page < 1 || page > 500) {
            console.error("⚠️ Invalid page number. Must be between 1 and 500");
            throw new Error("Số trang không hợp lệ");
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/movie/upcoming`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                    page,
                    region,
                },
            });
            return response.data || { results: [], total_pages: 1, total_results: 0 };
        } catch (error) {
            console.error("❌ Error fetching upcoming movies:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách phim mới ra mắt");
        }
    },

    // API: Lấy danh sách phim bộ phổ biến (popular TV series)
    getPopularSeries: async (page = 1, region = "VN") => {
        tmdbApi.ensureApiKey();

        if (page < 1 || page > 500) {
            console.error("⚠️ Invalid page number. Must be between 1 and 500");
            throw new Error("Số trang không hợp lệ");
        }

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/tv/popular`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                    page,
                    region,
                },
            });
            return response.data || { results: [], total_pages: 1, total_results: 0 };
        } catch (error) {
            console.error("❌ Error fetching popular series:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách phim bộ phổ biến");
        }
    },

    // API: Lấy danh sách thể loại phim bộ (TV genres)
    getTvGenres: async () => {
        tmdbApi.ensureApiKey();

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/genre/tv/list`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data.genres || [];
        } catch (error) {
            console.error("❌ Error fetching TV genres:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách thể loại phim bộ");
        }
    },

    // API: Lấy danh sách quốc gia
    getCountries: async () => {
        tmdbApi.ensureApiKey();

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/configuration/countries`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data || [];
        } catch (error) {
            console.error("❌ Error fetching countries:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách quốc gia");
        }
    },

    // API: Lấy danh sách phim bộ theo bộ lọc (genre, country, year, age rating)
    getFilteredSeries: async (page = 1, filters = {}) => {
        tmdbApi.ensureApiKey();

        if (page < 1 || page > 500) {
            console.error("⚠️ Invalid page number. Must be between 1 and 500");
            throw new Error("Số trang không hợp lệ");
        }

        const { genreId, country, year, ageRating } = filters;

        try {
            const params = {
                api_key: tmdbApi.apiKey,
                language: "vi-VN",
                page,
                sort_by: "popularity.desc",
            };

            if (genreId) params.with_genres = genreId;
            if (country) params.with_origin_country = country;
            if (year) {
                params["first_air_date.gte"] = `${year}-01-01`;
                params["first_air_date.lte"] = `${year}-12-31`;
            }
            if (ageRating) {
                params.certification_country = "US"; // Age ratings are US-based
                params.certification = ageRating;
            }

            const response = await axios.get(`${tmdbApi.baseUrl}/discover/tv`, {
                params,
            });
            return response.data || { results: [], total_pages: 1, total_results: 0 };
        } catch (error) {
            console.error("❌ Error fetching filtered series:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách phim bộ theo bộ lọc");
        }
    },

    // API: Lấy danh sách thể loại phim lẻ (movie genres)
    getMovieGenres: async () => {
        tmdbApi.ensureApiKey();

        try {
            const response = await axios.get(`${tmdbApi.baseUrl}/genre/movie/list`, {
                params: {
                    api_key: tmdbApi.apiKey,
                    language: "vi-VN",
                },
            });
            return response.data.genres || [];
        } catch (error) {
            console.error("❌ Error fetching movie genres:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách thể loại phim lẻ");
        }
    },

    // API: Lấy danh sách phim lẻ theo bộ lọc (genre, country, year, age rating)
    getFilteredMovies: async (page = 1, filters = {}) => {
        tmdbApi.ensureApiKey();

        if (page < 1 || page > 500) {
            console.error("⚠️ Invalid page number. Must be between 1 and 500");
            throw new Error("Số trang không hợp lệ");
        }

        const { genreId, country, year, ageRating } = filters;

        try {
            const params = {
                api_key: tmdbApi.apiKey,
                language: "vi-VN",
                page,
                sort_by: "popularity.desc",
                "primary_release_date.lte": new Date().toISOString().split("T")[0], // Chỉ lấy phim đã phát hành
            };

            if (genreId) params.with_genres = genreId;
            if (country) params.with_origin_country = country;
            if (year) {
                params["primary_release_date.gte"] = `${year}-01-01`;
                params["primary_release_date.lte"] = `${year}-12-31`;
            }
            if (ageRating) {
                params.certification_country = "US"; // Age ratings are US-based
                params.certification = ageRating;
            }

            const response = await axios.get(`${tmdbApi.baseUrl}/discover/movie`, {
                params,
            });

            // Lọc phim không thuộc bộ sưu tập (standalone movies)
            const filteredResults = response.data.results.filter(
                (movie) => !movie.belongs_to_collection
            );

            return {
                results: filteredResults,
                total_pages: Math.min(response.data.total_pages || 1, 500),
                total_results: filteredResults.length,
            };
        } catch (error) {
            console.error("❌ Error fetching filtered movies:", error.response?.data || error.message);
            throw new Error("Không thể lấy danh sách phim lẻ theo bộ lọc");
        }
    },
};

export default tmdbApi;