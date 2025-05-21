import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "../styles/Banner.css";
import { getAllMovies } from "../service/api"; // Import API service

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
                const movies = await getAllMovies(); // Gọi API lấy danh sách phim
                console.log(movies);
                // Chuẩn hóa dữ liệu để phù hợp với component
                const contentWithDetails = movies.map((movie) => ({
                    id: movie.movieId,
                    title: movie.title,
                    backdrop_path: `${import.meta.env.VITE_CDN_URL}/${movie.backdropUrl}`,
                    poster_path: `${import.meta.env.VITE_CDN_URL}/${movie.imageUrl}`,
                    video_path: `${import.meta.env.VITE_CDN_URL}/${movie.videoUrl}`,
                    overview: movie.overviewString,
                    genres: movie.genres.split(",").map((g) => ({ name: g.trim() })), // Chuyển genres thành mảng
                    vote_average: movie.rating,
                    release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : null,
                    runtime: movie.duration,
                    type: "movie", // Giả sử tất cả là movie, có thể mở rộng cho TV Series
                    certification: movie.status, // Dùng status làm certification
                    movieCast: movie.movieCast ? Array.from(movie.movieCast) : [],
                    director: movie.director,
                    studio: movie.studio,
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

    // Logic cho nút "Xem ngay"
    const handlePlayClick = () => {
        const currentItem = content[currentIndex];
        if (currentItem && currentItem.id) {
            navigate(`/xem-phim/${currentItem.id}?type=${currentItem.type}`);
        } else {
            console.error("Không có dữ liệu để phát video");
        }
    };

    // Logic cho nút "Chi tiết"
    const handleDetailsClick = () => {
        const currentItem = content[currentIndex];
        if (currentItem && currentItem.id) {
            navigate(`/phim/${currentItem.id}`);
        } else {
            console.error("Không có dữ liệu để xem chi tiết");
        }
    };

    // Skeleton UI khi đang tải
    if (isLoading) {
        return (
            <div className="banner skeleton-banner">
                <div className="banner-content">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-info"></div>
                    <div className="skeleton skeleton-genres"></div>
                    <div className="skeleton skeleton-overview"></div>
                    <div className="button-group">
                        <div className="skeleton skeleton-button"></div>
                        <div className="skeleton skeleton-button"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (content.length === 0) {
        return <div>Không có phim nào để hiển thị</div>;
    }

    const currentItem = content[currentIndex];

    // Xử lý các thuộc tính
    const title = currentItem.title;
    const year = currentItem.release_date?.split("-")[0];
    const runtime = currentItem.runtime ? `${currentItem.runtime} phút` : "N/A";

    return (
        <div
            className="banner"
            style={{
                backgroundImage: `url(${currentItem.backdrop_path})`,
                transition: "background-image 1s ease-in-out",
            }}
        >
            <div className="banner-content">
                <h1>{title}</h1>
                <h4>
                    <span>{year || "N/A"}</span>
                    <span>{currentItem.vote_average?.toFixed(1) || "N/A"}</span>
                    <span>{runtime}</span>
                    <span>{currentItem.certification || "N/A"}</span>
                </h4>
                <p className="genres">
                    {currentItem.genres?.map((g) => g.name).join(" • ") || "N/A"}
                </p>
                <p className="overview">{currentItem.overview || "Không có mô tả"}</p>
                <div className="button-group">
                    <button className="btn play" onClick={handlePlayClick}>
                        <FontAwesomeIcon icon={faPlay} /> Xem ngay
                    </button>
                    <button className="btn list" onClick={handleDetailsClick}>
                        <FontAwesomeIcon icon={faInfoCircle} /> Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Banner;