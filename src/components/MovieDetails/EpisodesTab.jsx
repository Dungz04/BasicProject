import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faBarsStaggered, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import "../../styles/cssMovieDetails/EpisodesTab.css";
import tmdbApi from "../../service/tmdbApi.jsx"; // Đường dẫn đúng

const EpisodesTab = ({ movie, active }) => {
    const [episodes, setEpisodes] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [isSeries, setIsSeries] = useState(false);

    useEffect(() => {
        const fetchEpisodes = async () => {
            if (movie && "number_of_seasons" in movie) {
                setIsSeries(true);
                try {
                    const response = await tmdbApi.getTvSeasonDetails(movie.id, selectedSeason);
                    setEpisodes(response.episodes || []);
                } catch (error) {
                    console.error("Error fetching episodes:", error);
                    setEpisodes([]);
                }
            } else {
                setIsSeries(false);
            }
        };

        if (active) fetchEpisodes();
    }, [movie, active, selectedSeason]);

    const handleSeasonChange = (season) => {
        setSelectedSeason(season);
    };

    if (!movie) return null;

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
                                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                        alt={movie.title}
                                    />
                                </div>
                                <div className="info">
                                    <div className="ver line-center"><span>Phụ đề</span></div>
                                    <div className="media-title">{movie.title}</div>
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
                            <div className="de-eps is-grid is-simple">
                                {episodes.map((episode) => (
                                    <a
                                        key={episode.id}
                                        className="item"
                                        href={`/xem-phim/${movie.id}/season/${selectedSeason}/episode/${episode.episode_number}`}
                                    >
                                        <div className="v-thumbnail h-thumbnail">
                                            <div className="play-button">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                            <img
                                                src={
                                                    episode.still_path
                                                        ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                                                        : "https://via.placeholder.com/300x169?text=No+Image"
                                                }
                                                alt={`Tập ${episode.episode_number}`}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="info">
                                            <div className="play-button">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                            <div className="ep-sort flex-shrink-0">
                                                Tập {episode.episode_number}
                                            </div>
                                            <div className="media-title">{episode.name}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EpisodesTab;