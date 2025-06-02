import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { getAllMovies } from "../../service/api";
import { FaStar, FaCalendarAlt } from "react-icons/fa";

const Top10Movies = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const movies = await getAllMovies();
                const top10Content = movies
                    .map((movie) => ({
                        id: movie.movieId,
                        title: movie.title,
                        poster_path: `${import.meta.env.VITE_CDN_URL}/${movie.imageUrl}`,
                        vote_average: movie.rating || 0,
                        release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : null,
                    }))
                    .sort((a, b) => b.vote_average - a.vote_average)
                    .slice(0, 10);

                setContent(top10Content);
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
            <div className="w-full max-w-screen-2xl mx-auto !p-4 font-['Lexend'] text-white bg-[#1a1a1a]">
                <h2 className="text-2xl md:text-4xl !mb-6 border-l-4 border-red-600 !pl-4">
                    Top 10 Phim Hot
                </h2>
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
                            <div className="relative overflow-hidden rounded-lg bg-[#1a1a1a]  h-[550px] flex flex-col w-full animate-pulse">
                                <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-lg md:text-xl font-bold rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"></div>
                                <div className="w-full h-[400px] bg-[#1a1a1a] rounded-t-lg"></div>
                                <div className="!p-4 flex flex-col justify-between flex-grow">
                                    <p className="w-4/5 h-5 bg-[#1a1a1a] !mb-2"></p>
                                    <p className="w-3/5 h-4 bg-[#1a1a1a] !mb-2"></p>
                                    <p className="w-3/5 h-4 bg-[#1a1a1a]"></p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (content.length === 0) {
        return <div>Không có phim nào để hiển thị</div>;
    }

    return (
        <div className="w-full max-w-screen-2xl mx-auto !p-4 font-['Lexend'] text-white bg-[#1a1a1a]">
            <h2 className="text-2xl md:text-4xl !mb-6 !mt-5 border-l-4 border-red-600 !pl-4">
                Top 10 Phim Hot
            </h2>
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
                className="[&_.swiper-button-prev]:!text-red-600 [&_.swiper-button-prev]:!bg-black/50 [&_.swiper-button-prev]:!w-10 [&_.swiper-button-prev]:!h-13 [&_.swiper-button-prev]:rounded-full [&_.swiper-button-prev::after]:!text-2xl 
                [&_.swiper-button-next]:!text-red-600 [&_.swiper-button-next]:!bg-black/50 [&_.swiper-button-next]:!w-10 [&_.swiper-button-next]:!h-13 [&_.swiper-button-next]:rounded-full [&_.swiper-button-next]:justify-center 
                [&_.swiper-button-next::after]:!text-2xl "
            >
                {content.map((item, index) => {
                    const title = item.title;
                    const year = item.release_date?.split("-")[0] || "N/A";
                    return (
                        <SwiperSlide key={item.id}>
                            <Link to={`/movie/${item.id}`} className="block text-inherit no-underline !mb-4">
                                <div className="relative overflow-hidden rounded-lg bg-[#1a1a1a] h-[550px] flex flex-col w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg active:scale-95 max-[1280px]:h-[500px] max-[1024px]:h-[450px] max-[768px]:h-[400px] max-[480px]:h-[350px] min-[1600px]:h-[600px]">
                                    <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-lg md:text-xl font-bold rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center z-10 max-[1024px]:w-11 max-[1024px]:h-11 max-[1024px]:text-base max-[768px]:w-10 max-[768px]:h-10 max-[768px]:text-sm max-[480px]:w-9 max-[480px]:h-9 max-[480px]:text-xs max-[320px]:w-8 max-[320px]:h-8 max-[320px]:text-[0.8rem]">
                                        {index + 1}
                                    </div>
                                    <div
                                        className="w-full h-[400px] bg-cover bg-center bg-no-repeat cursor-pointer max-[1280px]:h-[350px] max-[1024px]:h-[300px] max-[768px]:h-[250px] max-[480px]:h-[200px] max-[320px]:h-[180px] min-[1600px]:h-[450px]"
                                        style={{ backgroundImage: `url(${item.poster_path})` }}
                                    />
                                    <div className="!p-4 flex flex-col justify-between flex-grow max-[480px]:p-3">
                                        <p className="text-base md:text-lg font-bold text-white line-clamp-2 overflow-hidden text-ellipsis cursor-pointer max-[1024px]:text-sm max-[768px]:text-[0.9rem] max-[480px]:text-[0.85rem] max-[320px]:text-[0.8rem] min-[1600px]:text-xl">
                                            {title}
                                        </p>
                                        <p className="text-sm text-gray-300  max-[1024px]:text-xs max-[768px]:text-[0.75rem] max-[480px]:text-[0.7rem] max-[320px]:text-[0.65rem] min-[1600px]:text-base flex items-center gap-1">
                                            <FaStar className="text-yellow-400" />
                                            <span className={item.vote_average >= 7 ? "text-green-500" : "text-yellow-500"}>
                                                {item.vote_average.toFixed(1)}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-300 !mb-5 max-[1024px]:text-xs max-[768px]:text-[0.75rem] max-[480px]:text-[0.7rem] max-[320px]:text-[0.65rem] min-[1600px]:text-base flex items-center gap-1">
                                            <FaCalendarAlt className="text-gray-400" /> {year}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default Top10Movies;