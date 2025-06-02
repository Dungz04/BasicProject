import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { getAllMovies } from "../../service/api";
import { FaStar } from "react-icons/fa";

const MovieTheater = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const movieData = await getAllMovies();
                const movieDetails = movieData.map((movie) => ({
                    id: movie.movieId,
                    title: movie.title || movie.name,
                    backdrop_path: `${import.meta.env.VITE_CDN_URL}/${movie.backdropUrl}`,
                    poster_path: `${import.meta.env.VITE_CDN_URL}/${movie.imageUrl}`,
                    vote_average: movie.rating || 0,
                    releaseYear: movie.releaseYear ? `${movie.releaseYear}` : "N/A",
                    runtime: movie.duration ? `${movie.duration} minutes` : "N/A",
                }));

                setMovies(movieDetails);
            } catch (err) {
                setError("Không thể tải danh sách phim");
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <section className="w-full max-w-screen-2xl mx-auto !p-4 font-['Lexend'] text-white bg-[#1a1a1a]">
                <div className="!mb-6">
                    <h2 className="text-4xl md:text-4xl border-l-4 border-red-600 !pl-4">
                        Mãn nhãn với phim hay
                    </h2>
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
                    className="[&_.swiper-button-prev]:!text-red-600 [&_.swiper-button-prev]:!bg-black/50 [&_.swiper-button-prev]:!w-10 [&_.swiper-button-prev]:!h-13 [&_.swiper-button-prev]:rounded-full [&_.swiper-button-prev::after]:!text-2xl [&_.swiper-button-next]:!text-red-600 [&_.swiper-button-next]:!bg-black/50 [&_.swiper-button-next]:!w-10 [&_.swiper-button-next]:!h-13 [&_.swiper-button-next]:rounded-full [&_.swiper-button-next::after]:!text-2xl [&_.swiper-pagination]:!mt-4 [&_.swiper-pagination-bullet]:!bg-white [&_.swiper-pagination-bullet]:!w-2.5 [&_.swiper-pagination-bullet]:!h-2.5 [&_.swiper-pagination-bullet-active]:!bg-red-600"
                >
                    {[...Array(3)].map((_, index) => (
                        <SwiperSlide key={index}>
                            <div className="relative overflow-hidden rounded-lg bg-[#1a1a1a] h-[400px] flex flex-col animate-pulse">
                                <div className="w-full h-[300px] bg-[#2a2a2a]"></div>
                                <div className="absolute inset-0 flex items-end">
                                    <div className="w-1/3 h-2/3 bg-[#2a2a2a] rounded-lg !m-4"></div>
                                    <div className="!p-4 flex flex-col justify-end flex-grow">
                                        <h3 className="w-4/5 h-6 bg-[#2a2a2a] !mb-2"></h3>
                                        <p className="w-3/5 h-4 bg-[#2a2a2a] !mb-2"></p>
                                        <p className="w-3/5 h-4 bg-[#2a2a2a]"></p>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full max-w-screen-2xl mx-auto !p-4 font-['Lexend'] text-white bg-[#1a1a1a]">
                <div className="!mb-6">
                    <h2 className="text-4xl md:text-4xl border-l-4 border-red-600 !pl-4">
                        Mãn nhãn với phim hay
                    </h2>
                </div>
                <div className="text-center text-gray-300">{error}</div>
            </section>
        );
    }

    if (movies.length === 0) {
        return (
            <section className="w-full max-w-screen-2xl mx-auto !p-4 font-['Lexend'] text-white bg-[#1a1a1a]">
                <div className="!mb-6">
                    <h2 className="text-4xl md:text-4xl border-l-4 border-red-600 !pl-4">
                        Mãn nhãn với phim hay
                    </h2>
                </div>
                <div className="text-center text-gray-300">Không có phim nào để hiển thị.</div>
            </section>
        );
    }

    return (
        <section className="w-full max-w-screen-2xl mx-auto !p-4 font-['Lexend'] text-white bg-[#1a1a1a]">
            <div className="!mb-6">
                <h2 className="text-4xl md:text-4xl border-l-4 border-red-600 !pl-4">
                    Mãn nhãn với phim hay
                </h2>
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
                className="[&_.swiper-button-prev]:!text-red-600 [&_.swiper-button-prev]:!bg-black/50 [&_.swiper-button-prev]:!w-10 [&_.swiper-button-prev]:!h-13 [&_.swiper-button-prev]:rounded-full [&_.swiper-button-prev::after]:!text-2xl [&_.swiper-button-next]:!text-red-600 [&_.swiper-button-next]:!bg-black/50 [&_.swiper-button-next]:!w-10 [&_.swiper-button-next]:!h-13 [&_.swiper-button-next]:rounded-full [&_.swiper-button-next::after]:!text-2xl 
                [&_.swiper-pagination]:!mt-4 [&_.swiper-pagination-bullet]:!bg-white [&_.swiper-pagination-bullet]:!w-2.5 [&_.swiper-pagination-bullet]:!h-2.5 [&_.swiper-pagination-bullet-active]:!bg-red-600"
            >
                {movies.map((movie) => (
                    <SwiperSlide key={movie.id}>
                        <Link
                            to={`/movie/${movie.id}`}
                            className="text-inherit no-underline relative overflow-hidden rounded-lg bg-[#1a1a1a] h-[400px] flex flex-col !mb-4"
                        >
                            <img
                                src={movie.backdrop_path}
                                className="w-full h-[300px] object-cover"
                                alt={movie.title}
                                loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-end rounded-2xl">
                                <img
                                    src={movie.poster_path}
                                    className="w-1/3 h-1/2 !m-4 object-cover rounded-2xl"
                                    alt={movie.title}
                                    loading="lazy"
                                />
                                <div className="!p-3 flex flex-col justify-end flex-grow">
                                    <h3 className="text-lg font-bold !mb-2 text-white">{movie.title}</h3>
                                    <p className="text-sm text-gray-300 !mb-2">
                                        {movie.releaseYear} • {movie.runtime}
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center gap-1">
                                        <FaStar className="text-yellow-400" />
                                        <span
                                            className={movie.vote_average >= 7 ? "text-green-500" : "text-yellow-500"}
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