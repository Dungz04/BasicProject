import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/Top10Movies.css";
import { Link } from "react-router-dom";
import tmdbApi from "../service/tmdbApi";

const Top10Movies = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true); // Thêm trạng thái loading

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Bắt đầu loading
                const trendingMovies = await tmdbApi.getTrendingDayMovies("day");
                console.log("Trending Movies from API:", trendingMovies.slice(0, 10));

                const moviesWithDetails = await Promise.all(
                    trendingMovies.slice(0, 10).map(async (movie) => {
                        const details = await tmdbApi.getMovieDetails(movie.id);
                        const releaseDates = await tmdbApi.getMovieReleaseDates(movie.id);
                        const certification = releaseDates.find((r) => r.iso_3166_1 === "US")?.release_dates[0]?.certification || "N/A";
                        return { ...movie, ...details, certification };
                    })
                );

                console.log("Movies with Details:", moviesWithDetails);
                setMovies(moviesWithDetails);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            } finally {
                setLoading(false); // Kết thúc loading
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="top-10-section">
                <h2>Top 10 Phim Hot Nhất Hôm Nay</h2>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={5}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                        320: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                    }}
                >
                    {[...Array(5)].map((_, index) => (
                        <SwiperSlide key={index}>
                            <div className="movie-card skeleton">
                                <div className="rank skeleton-rank"></div>
                                <div className="movie-image skeleton-image"></div>
                                <div className="movie-info">
                                    <p className="title skeleton-title"></p>
                                    <p className="details skeleton-text"></p>
                                    <p className="details skeleton-text"></p>
                                    <p className="details skeleton-text"></p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    }

    return (
        <div className="top-10-section">
            <h2>Top 10 Phim Hot Nhất Hôm Nay</h2>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={5}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    320: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 },
                }}
            >
                {movies.map((movie, index) => (
                    <SwiperSlide key={movie.id}>
                        <Link to={`/phim/${movie.id}`} className="movie-card-link">
                            <div className="movie-card">
                                <div className="rank">{index + 1}</div>
                                <div
                                    className="movie-image"
                                    style={{
                                        backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
                                    }}
                                />
                                <div className="movie-info">
                                    <p className="title">{movie.title}</p>
                                    <p className="details">
                                        ⭐ <span className={movie.vote_average >= 7 ? "text-green-500" : "text-yellow-500"}>
                                            {movie.vote_average.toFixed(1)}
                                        </span> ({movie.vote_count} lượt)
                                    </p>
                                    <p className="details">📅 Năm: {movie.release_date?.split("-")[0]}</p>
                                    <p className="details">🔞 Độ tuổi: {movie.certification}</p>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Top10Movies;