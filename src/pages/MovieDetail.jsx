import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom'; // Thêm useParams
import tmdbApi from "../service/tmdbApi";
import "materialize-css/dist/css/materialize.min.css";
import "../styles/cssMovieDetails/MovieDetail.css";
import MovieInfo from "../components/MovieDetails/MovieInfo";
import MovieActions from "../components/MovieDetails/MovieActions";
import TabsContent from "../components/MovieDetails/TabsContent";

const MovieDetail = () => {
    const { movieId } = useParams(); // Lấy movieId từ URL
    const [movie, setMovie] = useState(null);
    const [actors, setActors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeTab, setActiveTab] = useState("episodes");

    useEffect(() => {
        const fetchMovieData = async () => {
            if (!movieId) return; // Kiểm tra nếu movieId không tồn tại

            const movieDetails = await tmdbApi.getContentDetails(movieId);
            const releaseDates = await tmdbApi.getContentReleaseInfo(movieId);
            const certification = releaseDates.find((r) => r.iso_3166_1 === "US")?.release_dates[0]?.certification || "N/A";
            const credits = await tmdbApi.getContentCredits(movieId);
            const actorsList = credits?.cast.slice(0, 5) || [];
            const recommended = await tmdbApi.getContentRecommendations(movieId);
            const recommendedList = recommended?.results.slice(0, 5) || [];

            console.log("Movie Details:", movieDetails);
            console.log("Credits:", credits);
            console.log("Actors List:", actorsList);
            console.log("Recommendations:", recommended);
            console.log("Recommended List:", recommendedList);

            setMovie({ ...movieDetails, certification });
            setActors(actorsList);
            setRecommendations(recommendedList);
        };
        fetchMovieData();
    }, [movieId]);

    if (!movie) return <div className="base-load">Loading...</div>;

    return (
        <div className="base-load">
            <div id="header" />
            <div id="app">
                <h1 style={{ display: "none" }}>{`${movie.title} HD Vietsub - ${movie.original_title}`}</h1>
                <div className="top-detail-wrap">
                    <div
                        className="background-fade"
                        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
                    />
                    <div className="cover-fade">
                        <div
                            className="cover-image"
                            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
                        />
                    </div>
                </div>
                <div id="wrapper" className="wrapper-w-slide">
                    <div className="detail-container">
                        <div className="dc-side">
                            <MovieInfo movie={movie} />
                        </div>
                        <div className="dc-main">
                            <MovieActions movieId={movie.id} />
                            <TabsContent
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                movie={movie}
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