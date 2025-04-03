import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/Top10Movies.css";
import { Link } from "react-router-dom";
import tmdbApi from "../service/tmdbApi"; // Đường dẫn giữ nguyên nếu đúng

const Top10Movies = () => {
    const [content, setContent] = useState([]); // Đổi tên để phản ánh cả movie và TV
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Lấy trending movies và TV shows trong ngày
                const trendingMovies = await tmdbApi.getTrendingByDay("movie", "day");
                const trendingTvShows = await tmdbApi.getTrendingByDay("tv", "day");

                // Kết hợp và lấy top 10 từ cả hai danh sách
                const combinedTrending = [...trendingMovies,...trendingTvShows]
                    .sort((a, b) => b.popularity - a.popularity) // Sắp xếp theo độ phổ biến
                    .slice(0, 10); // Lấy top 10

                const contentWithDetails = await Promise.all(
                    combinedTrending.map(async (item) => {
                        const type = item.title ? "movie" : "tv"; // Xác định loại nội dung
                        const details = await tmdbApi.getContentDetails(item.id, type);
                        const releaseInfo = await tmdbApi.getContentReleaseInfo(item.id, type);
                        const certification = releaseInfo.find((r) => r.iso_3166_1 === "US")?.[
                            type === "movie" ? "release_dates" : "rating"
                        ]?.[type === "movie" ? 0 : ""]?.[type === "movie" ? "certification" : ""] || "N/A";
                        return { ...item, ...details, certification, type };
                    })
                );

                console.log("Top 10 Content with Details:", contentWithDetails);
                setContent(contentWithDetails);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
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
                {content.map((item, index) => {
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date)?.split("-")[0] || "N/A";
                    return (
                        <SwiperSlide key={item.id}>
                            <Link to={`/phim/${item.id}?type=${item.type}`} className="movie-card-link">
                                <div className="movie-card">
                                    <div className="rank">{index + 1}</div>
                                    <div
                                        className="movie-image"
                                        style={{
                                            backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster_path})`,
                                        }}
                                    />
                                    <div className="movie-info">
                                        <p className="title">{title}</p>
                                        <p className="details">
                                            ⭐ <span className={item.vote_average >= 7 ? "text-green-500" : "text-yellow-500"}>
                                                {item.vote_average.toFixed(1)}
                                            </span> ({item.vote_count} lượt)
                                        </p>
                                        <p className="details">📅 Năm: {year}</p>
                                        <p className="details">🔞 Độ tuổi: {item.certification}</p>
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