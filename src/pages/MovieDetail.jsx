import React, { useState, useEffect } from "react";
import { useParams, useLocation } from 'react-router-dom';
import tmdbApi from "../service/tmdbApi";
import "../styles/cssMovieDetails/MovieDetail.css";
import MovieInfo from "../components/MovieDetails/MovieInfo";
import MovieActions from "../components/MovieDetails/MovieActions";
import TabsContent from "../components/MovieDetails/TabsContent";

const MovieDetail = () => {
    const { movieId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get("type") || "movie";

    const [content, setContent] = useState(null);
    const [actors, setActors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeTab, setActiveTab] = useState("episodes");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [type, setType] = useState(initialType);

    useEffect(() => {
        const fetchContentData = async () => {
            if (!movieId || isNaN(movieId)) {
                setError("ID nội dung không hợp lệ");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log("Đang lấy chi tiết:", { movieId, type });

                let contentDetails = await tmdbApi.getContentDetails(movieId, type);
                let finalType = type;

                if (!contentDetails) {
                    console.log("Thử loại nội dung khác...");
                    finalType = type === "movie" ? "tv" : "movie";
                    contentDetails = await tmdbApi.getContentDetails(movieId, finalType);
                    if (!contentDetails) {
                        throw new Error("Không tìm thấy nội dung");
                    }
                }

                const releaseInfo = await tmdbApi.getContentReleaseInfo(movieId, finalType);
                let certification = "N/A";
                if (finalType === "movie") {
                    const usRelease = releaseInfo.find((r) => r.iso_3166_1 === "US");
                    certification = usRelease?.release_dates?.[0]?.certification || "N/A";
                } else {
                    const usRating = releaseInfo.find((r) => r.iso_3166_1 === "US");
                    certification = usRating?.rating || "N/A";
                }

                const credits = await tmdbApi.getContentCredits(movieId, finalType);
                const actorsList = credits?.cast.slice(0, 8) || [];

                const recommended = await tmdbApi.getContentRecommendations(movieId, finalType);
                const recommendedList = recommended?.results.slice(0, 8) || [];

                setContent({ ...contentDetails, certification, type: finalType });
                setActors(actorsList);
                setRecommendations(recommendedList);
                setType(finalType);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
                setError(`Không tìm thấy nội dung với ID ${movieId}. Vui lòng kiểm tra lại.`);
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
                            <MovieActions movieId={content.id} type={type} />
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