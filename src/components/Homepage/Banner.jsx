import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { getAllMovies } from "../../service/api";

const Banner = () => {
    const [content, setContent] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setIsLoading(true);
                const movies = await getAllMovies();
                const contentWithDetails = movies.map((movie) => ({
                    id: movie.movieId,
                    title: movie.title,
                    backdrop_path: `${import.meta.env.VITE_CDN_URL}/${movie.backdropUrl}`,
                    overview: movie.overviewString,
                    genres: movie.genres.split(",").map((g) => ({ name: g.trim() })),
                    vote_average: movie.rating,
                    release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : null,
                    runtime: movie.duration,
                    status: movie.status,
                }));
                setContent(contentWithDetails);
                setCurrentIndex(0);
            } catch (err) {
                setError("Không thể tải danh sách phim");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    useEffect(() => {
        if (content.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [content]);

    const handlePlayClick = () => {
        const currentItem = content[currentIndex];
        if (currentItem?.id) {
            navigate(`/xem-phim/${currentItem.id}`);
        }
    };

    const handleDetailsClick = () => {
        const currentItem = content[currentIndex];
        if (currentItem?.id) {
            navigate(`/movie/${currentItem.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="relative w-full min-h-screen bg-[#1a1a1a]">
                <div className="relative max-w-xl text-left text-white !px-4 sm:px-12 md:px-24 py-0 mx-auto animate-pulse">
                    <div className="w-3/4 h-10 bg-[#1a1a1a] rounded !mb-2"></div>
                    <div className="w-1/2 h-5 bg-[#1a1a1a] rounded !mb-4"></div>
                    <div className="w-2/5 h-4 bg-[#1a1a1a] rounded !mb-4"></div>
                    <div className="w-full h-16 bg-[#1a1a1a] rounded !mb-5"></div>
                    <div className="flex justify-end gap-4">
                        <div className="w-32 h-10 bg-[#1a1a1a] rounded"></div>
                        <div className="w-32 h-10 bg-[#1a1a1a] rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div>{error}</div>;
    if (content.length === 0) return <div>Không có phim nào để hiển thị</div>;

    const currentItem = content[currentIndex];
    const title = currentItem.title;
    const year = currentItem.release_date?.split("-")[0];
    const runtime = currentItem.runtime ? `${currentItem.runtime} minutes` : "N/A";

    return (
        <div
            className="relative w-full min-h-screen flex justify-start items-center bg-cover bg-center overflow-hidden before:absolute before:inset-0 before:bg-black/50 before:z-10 max-md:min-h-[80vh] max-sm:min-h-[60vh] max-sm:justify-center max-sm:px-5"
            style={{
                backgroundImage: `url(${currentItem.backdrop_path})`,
                transition: "background-image 1s ease-in-out",
            }}
        >
            <div className="relative z-20 max-w-3xl w-full text-white !px-10 sm:px-12 md:px-24 py-8 max-sm:text-center max-sm:max-w-full">
                <h1 className="text-4xl font-bold !mb-2 max-md:text-3xl max-sm:text-2xl truncate">
                    {title}
                </h1>
                <h4 className="flex flex-wrap items-center gap-2 text-lg text-white/80 font-normal max-md:text-base max-sm:text-sm max-sm:justify-center">
                    <span className="!px-4 !py-1 border-r border-white/50 max-md:px-2">
                        {year || "N/A"}
                    </span>
                    <span className="!px-4 !py-1 border-r border-white/50 text-red-600 max-md:px-2">
                        {currentItem.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    <span className="!px-4 !py-1 border-r border-white/50 max-md:px-2">
                        {runtime}
                    </span>
                    <span className="!px-4 !py-1 bg-red-600 text-white rounded max-md:px-2">
                        {currentItem.status || "N/A"}
                    </span>
                </h4>
                <p className="text-base italic font-normal opacity-90 !mb-4 max-md:text-sm max-sm:text-center max-sm:text-xs truncate">
                    {currentItem.genres?.map((g) => g.name).join(" • ") || "N/A"}
                </p>
                <p className="text-base font-light leading-relaxed !mb-4 text-justify max-md:text-sm max-sm:text-xs max-sm:text-center max-sm:line-clamp-4">
                    {currentItem.overview || "Không có mô tả"}
                </p>
                <div className="flex flex-wrap justify-end gap-4 max-sm:justify-center">
                    <button
                        className="flex items-center cursor-pointer gap-2 !px-6 !py-3 text-base font-medium uppercase bg-red-600 text-white rounded hover:bg-white hover:text-red-600 transition-colors max-md:px-5 max-md:py-2 max-md:text-sm max-sm:px-4 max-sm:text-xs"
                        onClick={handlePlayClick}
                    >
                        <FontAwesomeIcon icon={faPlay} /> Xem ngay
                    </button>
                    <button
                        className="flex items-center cursor-pointer gap-2 !px-6 !py-3 text-base font-medium uppercase bg-white/30 text-white border border-white/50 rounded hover:bg-red-600 hover:border-white transition-colors max-md:px-5 max-md:py-2 max-md:text-sm max-sm:px-4 max-sm:text-xs"
                        onClick={handleDetailsClick}
                    >
                        <FontAwesomeIcon icon={faInfoCircle} /> Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Banner;
