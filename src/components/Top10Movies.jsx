import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/Top10Movies.css";
import { Link } from "react-router-dom";
import staticContent from "../service/staticData"; // Import dữ liệu tĩnh

const Top10Movies = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaticData = () => {
            setLoading(true);

            // Sắp xếp theo popularity và lấy top 10
            const top10Content = staticContent
                .sort((a, b) => b.popularity - a.popularity) // Sắp xếp giảm dần
                .slice(0, 10) // Lấy 10 mục đầu tiên
                .map((item) => ({
                    ...item,
                    type: item.media_type || (item.title ? "movie" : "tv"),
                }));

            setContent(top10Content);
            setLoading(false);
        };

        fetchStaticData();
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
                                            backgroundImage: `url(${item.poster_path})`, // Dùng ảnh từ assets
                                        }}
                                    />
                                    <div className="movie-info">
                                        <p className="title">{title}</p>
                                        <p className="details">
                                            ⭐{" "}
                                            <span
                                                className={
                                                    item.vote_average >= 7
                                                        ? "text-green-500"
                                                        : "text-yellow-500"
                                                }
                                            >
                                                {item.vote_average.toFixed(1)}
                                            </span>
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