import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/MovieTheater.css";
import { Link } from "react-router-dom";
import tmdbApi from "../service/tmdbApi";

const MovieTheater = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const nowPlaying = await tmdbApi.getNowPlayingContent();
                const movieDetails = await Promise.all(
                    nowPlaying.map(async (movie) => {
                        const details = await tmdbApi.getContentDetails(movie.id);
                        const releaseDates = await tmdbApi.getContentReleaseInfo(movie.id);
                        const certificationData = releaseDates.find(item => item.iso_3166_1 === "US");
                        const certification = certificationData?.release_dates?.[0]?.certification || "N/A";

                        return {
                            ...movie,
                            runtime: details.runtime,
                            releaseYear: movie.release_date?.split("-")[0],
                            certification: certification,
                        };
                    })
                );

                setMovies(movieDetails);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
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

    // Nếu không có phim, hiển thị thông báo
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
                    delay: 3000, // Trượt mỗi 3 giây
                    disableOnInteraction: false, // Không dừng khi người dùng tương tác
                    pauseOnMouseEnter: false, // Không dừng khi hover (tùy chọn)
                }}
                loop={true} // Trượt không giới hạn
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
                                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                                className="movie-bg"
                                alt={movie.title}
                                loading="lazy"
                            />
                            <div className="movie-overlay">
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    className="movie-poster"
                                    alt={movie.title}
                                    loading="lazy"
                                />
                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <p>{movie.certification} • {movie.releaseYear} • {movie.runtime} phút</p>
                                    <p className="details-tt">
                                    TMDb <span className={movie.vote_average >= 7 ? "text-green-500" : "text-yellow-500"}>
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