import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import "../styles/Banner.css";
import tmdbApi from "../service/tmdbApi.jsx";

const Banner = () => {
    const [content, setContent] = useState([]); // Danh sách kết hợp movies và TV shows
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const trendingData = await tmdbApi.getWeeklyTrending();
            const trendingMovies = trendingData.movies || [];
            const trendingTvShows = trendingData.tvShows || [];

            // Kết hợp movies và TV shows thành một danh sách
            const combinedContent = [...trendingMovies, ...trendingTvShows];

            const getCertification = (releaseInfo, type) => {
                if (!releaseInfo) return "N/A";
                const priorityCountries = ["US", "GB", "VN"];
                for (const country of priorityCountries) {
                    const info = releaseInfo.find((r) => r.iso_3166_1 === country);
                    if (info) {
                        if (type === "movie" && info.release_dates?.[0]?.certification) {
                            return info.release_dates[0].certification;
                        } else if (type === "tv" && info.rating) {
                            return info.rating;
                        }
                    }
                }
                return "N/A";
            };

            const contentWithDetails = await Promise.all(
                combinedContent.map(async (item) => {
                    const type = item.media_type || (item.title ? "movie" : "tv"); // Xác định loại nội dung
                    const details = await tmdbApi.getContentDetails(item.id, type);
                    const releaseInfo = await tmdbApi.getContentReleaseInfo(item.id, type);
                    const certification = getCertification(releaseInfo, type);
                    const overview = details.overview ||
                        (await tmdbApi.getContentDetails(item.id, type, { language: "en-US" })).overview ||
                        "Không có mô tả";
                    return {
                        ...item,
                        ...details,
                        overview,
                        certification,
                        type, // Lưu type để xử lý sau
                    };
                })
            );

            if (contentWithDetails.length > 0) {
                setContent(contentWithDetails);
                setCurrentIndex(0);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (content.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [content]);

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

    if (content.length === 0) return <div>Loading...</div>;

    const currentItem = content[currentIndex];

    // Xử lý các thuộc tính khác nhau giữa movie và TV
    const title = currentItem.title || currentItem.name;
    const year = (currentItem.release_date || currentItem.first_air_date)?.split("-")[0];
    const runtime = currentItem.type === "movie" 
        ? currentItem.runtime 
        : (currentItem.episode_run_time?.[0] || "N/A"); // Thời lượng tập đầu tiên cho TV

    return (
        <div
            className="banner"
            style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${currentItem.backdrop_path})`,
                transition: "background-image 1s ease-in-out",
            }}
        >
            <div className="banner-content">
                <h1>{title}</h1>
                <h4>
                    <span>{year || "N/A"}</span>
                    <span>{currentItem.vote_average?.toFixed(1) || "N/A"}</span>
                    <span>{runtime ? `${runtime} phút` : "N/A"}</span>
                    <span>{currentItem.certification}</span>
                </h4>
                <p className="genres">{currentItem.genres?.map((g) => g.name).join(" • ")}</p>
                <p className="overview">{currentItem.overview}</p>
                <div className="button-group">
                    <button className="btn play">
                        <FontAwesomeIcon icon={faPlay} /> Xem ngay
                    </button>
                    <button className="btn list">
                        <FontAwesomeIcon icon={faInfoCircle} /> Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Banner;