import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/MovieTheater.css";
import { Link } from "react-router-dom";
import staticContent from "../service/staticData"; 

const MovieTheater = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaticMovies = () => {
            setLoading(true);
            const movieDetails = staticContent.map((movie) => ({
                ...movie,
                title: movie.title || movie.name, // Đảm bảo title luôn có giá trị
                releaseYear: (movie.release_date || movie.first_air_date)?.split("-")[0],
                runtime:
                    movie.media_type === "movie"
                        ? movie.runtime
                        : movie.episode_run_time?.[0] || "N/A",
            }));

            setMovies(movieDetails);
            setLoading(false);
        };

        fetchStaticMovies();
    }, []);

    if (loading) {
        return (
            <section className="movie-section">
                <div className="section-header">
                    <h2>Phim Chiếu Rạp</h2>
                </div>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={15}
                    slidesPerView={3}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={true}
                    breakpoints={{
                        320: { slidesPerView: 1, spaceBetween: 10 },
                        768: { slidesPerView: 2, spaceBetween: 15 },
                        1024: { slidesPerView: 3, spaceBetween: 15 },
                    }}
                >
                    {[...Array(3)].map((_, index) => (
                        <SwiperSlide key={index}>
                            <div className="movie skeleton">
                                <div className="movie-bg skeleton-bg"></div>
                                <div className="movie-overlay">
                                    <div className="movie-poster skeleton-poster"></div>
                                    <div className="movie-info">
                                        <h3 className="skeleton-title"></h3>
                                        <p className="skeleton-text"></p>
                                        <p className="skeleton-text"></p>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>
        );
    }

    if (movies.length === 0) {
        return (
            <section className="movie-section">
                <div className="section-header">
                    <h2>Phim Chiếu Rạp</h2>
                </div>
                <div className="no-movies">Không có phim nào để hiển thị.</div>
            </section>
        );
    }

    return (
        <section className="movie-section">
            <div className="section-header">
                <h2>Phim Chiếu Rạp</h2>
            </div>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={15}
                slidesPerView={3}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false,
                }}
                loop={true}
                breakpoints={{
                    320: { slidesPerView: 1, spaceBetween: 10 },
                    768: { slidesPerView: 2, spaceBetween: 15 },
                    1024: { slidesPerView: 3, spaceBetween: 15 },
                }}
            >
                {movies.map((movie) => (
                    <SwiperSlide key={movie.id}>
                        <Link to={`/phim/${movie.id}`} className="movie">
                            <img
                                src={movie.backdrop_path}
                                className="movie-bg"
                                alt={movie.title}
                                loading="lazy"
                            />
                            <div className="movie-overlay">
                                <img
                                    src={movie.poster_path}
                                    className="movie-poster"
                                    alt={movie.title}
                                    loading="lazy"
                                />
                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <p>
                                        {movie.certification} • {movie.releaseYear} •{" "}
                                        {movie.runtime} {movie.runtime !== "N/A" ? "phút" : ""}
                                    </p>
                                    <p className="details-tt">
                                        TMDb{" "}
                                        <span
                                            className={
                                                movie.vote_average >= 7
                                                    ? "text-green-500"
                                                    : "text-yellow-500"
                                            }
                                        >
                                            {movie.vote_average.toFixed(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default MovieTheater;