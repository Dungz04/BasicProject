import React, { useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import tmdbApi from "../service/tmdbApi";
import "materialize-css/dist/css/materialize.min.css";
import "../styles/cssMovieDetails/MovieDetail.css";
import MovieInfo from "../components/MovieDetails/MovieInfo";
import MovieActions from "../components/MovieDetails/MovieActions";
import TabsContent from "../components/MovieDetails/TabsContent";

const MovieDetail = () => {
    const { movieId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type") || "movie"; // Lấy type từ query

    const [content, setContent] = useState(null);
    const [actors, setActors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeTab, setActiveTab] = useState("episodes");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContentData = async () => {
            if (!movieId) {
                setError("Không tìm thấy ID nội dung");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Lấy chi tiết nội dung (movie hoặc tv)
                const contentDetails = await tmdbApi.getContentDetails(movieId, type);
                if (!contentDetails) {
                    throw new Error("Không tìm thấy nội dung");
                }

                // Lấy thông tin độ tuổi
                const releaseInfo = await tmdbApi.getContentReleaseInfo(movieId, type);
                const certification = releaseInfo.find((r) => r.iso_3166_1 === "US")?.[
                    type === "movie" ? "release_dates" : "rating"
                ]?.[type === "movie" ? 0 : ""]?.[type === "movie" ? "certification" : ""] || "N/A";

                // Lấy danh sách diễn viên
                const credits = await tmdbApi.getContentCredits(movieId, type);
                const actorsList = credits?.cast.slice(0, 8) || [];

                // Lấy danh sách gợi ý
                const recommended = await tmdbApi.getContentRecommendations(movieId, type);
                const recommendedList = recommended?.results.slice(0, 8) || [];

                console.log("Content Details:", contentDetails);
                console.log("Credits:", credits);
                console.log("Actors List:", actorsList);
                console.log("Recommendations:", recommended);
                console.log("Recommended List:", recommendedList);

                setContent({ ...contentDetails, certification, type });
                setActors(actorsList);
                setRecommendations(recommendedList);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
                setError("Không thể tải chi tiết nội dung. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchContentData();
    }, [movieId, type]);

    if (loading) {
        return <div className="base-load">Đang tải...</div>;
    }

    if (error) {
        return <div className="base-load error">{error}</div>;
    }

    if (!content) {
        return <div className="base-load error">Không tìm thấy nội dung</div>;
    }

    const title = content.title || content.name;
    const originalTitle = content.original_title || content.original_name;

    return (
        <div className="base-load">
            <div id="header" />
            <div id="app">
                <h1 style={{ display: "none" }}>{`${title} HD Vietsub - ${originalTitle}`}</h1>
                <div className="top-detail-wrap">
                    <div
                        className="background-fade"
                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${content.backdrop_path || "/default-backdrop.jpg"})` }}
                    />
                    <div className="cover-fade">
                        <div
                            className="cover-image"
                            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${content.backdrop_path || "/default-backdrop.jpg"})` }}
                        />
                    </div>
                </div>
                <div id="wrapper" className="wrapper-w-slide">
                    <div className="detail-container">
                        <div className="dc-side">
                            <MovieInfo movie={content} />
                        </div>
                        <div className="dc-main">
                            <MovieActions movieId={content.id} />
                            <TabsContent
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                movie={content}
                                actors={actors}
                                recommendations={recommendations}
                            />
                        </div>
                    </div>
                </div>
                <div id="footer" />
            </div>
        </div>
    );
};

export default MovieDetail;