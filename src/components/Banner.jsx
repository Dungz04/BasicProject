import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import "../styles/Banner.css";
import tmdbApi from "../service/tmdbApi.jsx";

const Banner = () => {
    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // Sử dụng API mới getWeeklyTrending
            const trendingData = await tmdbApi.getWeeklyTrending();
            const trendingWeekMovies = trendingData.movies; // Chỉ lấy movies

            const getCertification = (releaseDates) => {
                const priorityCountries = ["US", "GB", "VN"];
                for (const country of priorityCountries) {
                    const release = releaseDates.find((r) => r.iso_3166_1 === country);
                    if (release && release.release_dates[0]?.certification) {
                        return release.release_dates[0].certification;
                    }
                }
                return "N/A";
            };

            const moviesWithDetails = await Promise.all(
                trendingWeekMovies.map(async (movie) => {
                    const details = await tmdbApi.getMovieDetails(movie.id);
                    const releaseDates = await tmdbApi.getMovieReleaseDates(movie.id);
                    const certification = getCertification(releaseDates);

                    // Lấy overview, fallback sang tiếng Anh nếu không có
                    const overview = details.overview ||
                        (await tmdbApi.getMovieDetails(movie.id, { language: "en-US" })).overview ||
                        "Không có mô tả";

                    return { ...movie, ...details, overview, certification };
                })
            );

            if (moviesWithDetails.length > 0) {
                setMovies(moviesWithDetails);
                setCurrentIndex(0);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (movies.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [movies]);

    if (movies.length === 0) return <div>Loading...</div>;

    const movie = movies[currentIndex];

    return (
        <div
            className="banner"
            style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                transition: "background-image 1s ease-in-out",
            }}
        >
            <div className="banner-content">
                <h1>{movie.title}</h1>
                <h4>
                    <span>{movie.release_date?.split("-")[0]}</span>
                    <span>{movie.vote_average.toFixed(1)}</span>
                    <span>{movie.runtime} phút</span>
                    <span>{movie.certification}</span>
                </h4>
                <p className="genres">{movie.genres?.map((g) => g.name).join(" • ")}</p>
                <p className="overview">{movie.overview}</p>
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