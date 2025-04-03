import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faBarsStaggered, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import "../../styles/cssMovieDetails/EpisodesTab.css";
import tmdbApi from "../../service/tmdbApi.jsx";

const EpisodesTab = ({ movie, active }) => {
    const [episodes, setEpisodes] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [isSeries, setIsSeries] = useState(false);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEpisodes = async () => {
            if (movie && "number_of_seasons" in movie) {
                setIsSeries(true);
                setLoadingEpisodes(true);
                setError(null);
                try {
                    const response = await tmdbApi.getTvSeasonDetails(movie.id, selectedSeason);
                    if (response && response.episodes) {
                        setEpisodes(response.episodes);
                    } else {
                        throw new Error("Không tìm thấy tập phim");
                    }
                } catch (error) {
                    console.error("Error fetching episodes:", error);
                    setError("Không thể tải danh sách tập. Vui lòng thử lại sau.");
                    setEpisodes([]);
                } finally {
                    setLoadingEpisodes(false);
                }
            } else {
                setIsSeries(false);
                setEpisodes([]);
            }
        };

        if (active) fetchEpisodes();
    }, [movie, active, selectedSeason]);

    const handleSeasonChange = (season) => {
        setSelectedSeason(season);
    };

    if (!movie) {
        return <div className="error-message">Không có dữ liệu nội dung</div>;
    }

    const title = movie.title || movie.name;

    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="cg-body-box is-eps">
                <div className="box-header">
                    <div className="heading-md">Các bản chiếu</div>
                </div>
                <div className="box-body">
                    {!isSeries && (
                        <div className="de-type">
                            <a className="item pd" href={`/xem-phim/${movie.id}`}>
                                <div className="m-thumbnail">
                                    <img
                                        src={
                                            movie.poster_path
                                                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                                : "https://via.placeholder.com/300x450?text=No+Image"
                                        }
                                        alt={title}
                                    />
                                </div>
                                <div className="info">
                                    <div className="ver line-center"><span>Phụ đề</span></div>
                                    <div className="media-title">{title}</div>
                                    <div className="btn btn-sm btn-light">Xem bản này</div>
                                </div>
                            </a>
                        </div>
                    )}
                    {isSeries && (
                        <>
                            <div className="box-header">
                                <div className="season-dropdown dropdown">
                                    <div className="line-center">
                                        <FontAwesomeIcon icon={faBarsStaggered} className="text-primary" />
                                        <span>Phần {selectedSeason}</span>
                                        <FontAwesomeIcon icon={faCaretDown} />
                                    </div>
                                    <div className="dropdown-menu">
                                        {Array.from({ length: movie.number_of_seasons || 1 }, (_, i) => i + 1).map(
                                            (season) => (
                                                <button
                                                    key={season}
                                                    className="dropdown-item"
                                                    onClick={() => handleSeasonChange(season)}
                                                >
                                                    Phần {season}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            {loadingEpisodes ? (
                                <div className="loading-message">
                                    <div className="spinner"></div>
                                    Đang tải danh sách tập...
                                </div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : episodes.length === 0 ? (
                                <div className="error-message">Không có tập phim nào cho mùa này</div>
                            ) : (
                                <div className="episode-list">
                                    {episodes.map((episode) => (
                                        <a
                                            key={episode.id}
                                            className="episode-btn"
                                            href={`/xem-phim/${movie.id}/season/${selectedSeason}/episode/${episode.episode_number}`}
                                        >
                                            <FontAwesomeIcon icon={faPlay} className="play-icon" />
                                            Tập {episode.episode_number}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EpisodesTab;