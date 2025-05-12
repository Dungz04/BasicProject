import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faBarsStaggered, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import tmdbApi from "../../service/tmdbApi.jsx";

const EpisodesTab = ({ movie, active }) => {
    const [episodes, setEpisodes] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [isSeries, setIsSeries] = useState(false);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Validate and set the initial selectedSeason based on movie.number_of_seasons
        if (movie && "number_of_seasons" in movie && movie.number_of_seasons > 0) {
            const validSeason = Math.min(Math.max(1, selectedSeason), movie.number_of_seasons);
            if (validSeason !== selectedSeason) {
                setSelectedSeason(validSeason);
            }
        }
    }, [movie]);

    useEffect(() => {
        const fetchEpisodes = async () => {
            if (movie && "number_of_seasons" in movie && movie.number_of_seasons > 0) {
                console.log("Detected as series:", movie);
                setIsSeries(true);
                setLoadingEpisodes(true);
                setError(null);
                try {
                    const response = await tmdbApi.getTvSeasonDetails(movie.id, selectedSeason);
                    console.log("API Response for season details:", response); // Debug log
                    if (response && response.episodes) {
                        setEpisodes(response.episodes);
                    } else {
                        throw new Error("Không tìm thấy tập phim");
                    }
                } catch (error) {
                    console.error("Error fetching episodes:", error);
                    if (error.message.includes("Mùa")) {
                        setError(error.message); // Specific error for invalid season
                    } else {
                        setError("Không thể tải danh sách tập. Vui lòng thử lại sau.");
                    }
                    setEpisodes([]);
                } finally {
                    setLoadingEpisodes(false);
                }
            } else {
                console.log("Not a series or movie is invalid:", movie);
                setIsSeries(false);
                setEpisodes([]);
            }
        };

        if (active) fetchEpisodes();
    }, [movie, active, selectedSeason]);

    if (!movie) {
        return <div className="text-center text-red-500 !py-6">Không có dữ liệu nội dung</div>;
    }

    const title = movie.title || movie.name;

    return (
        <div className={`fade tab-pane ${active ? "active show" : ""}`}>
            <div className="!p-4 max-w-6xl mx-auto bg-[#1a1a1a] rounded-lg">
                <div className="!mb-4">
                    <h2 className="text-white text-3xl font-bold text-center">Các bản chiếu</h2>
                </div>

                {!isSeries ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <a
                            href={`/xem-phim/${movie.id}`}
                            className="flex bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-all duration-300 rounded-xl overflow-hidden shadow-lg group relative translate-y-2"
                        >
                            <div className="w-[50%] max-w-[130px] relative">
                                <img
                                    src={
                                        movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                            : "https://via.placeholder.com/300x450?text=No+Image"
                                    }
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center !px-4 !py-3 text-white w-[60%]">
                                <span className="text-xs text-gray-300 !mb-1">Phụ đề</span>
                                <h3 className="text-base md:text-lg font-semibold leading-snug group-hover:text-red-500 transition-colors">
                                    {title}
                                </h3>
                                <div className="!mt-3 bg-red-600 text-white text-sm !px-3 !py-2 w-30 rounded hover:bg-red-700 transition">
                                    Xem bản này
                                </div>
                            </div>
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="relative inline-block !mb-2">
                            <div
                                className="flex items-center gap-2 !px-3 !py-2 bg-white/10 border border-white rounded cursor-pointer"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <FontAwesomeIcon icon={faBarsStaggered} className="text-red-600" />
                                <span>Phần {selectedSeason}</span>
                                <FontAwesomeIcon
                                    icon={faCaretDown}
                                    className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                                />
                            </div>

                            <div
                                className={`absolute top-full left-0 bg-[#222222f6] text-black-600 border border-gray-300 rounded shadow-lg transition-all duration-200 z-10 ${
                                    showDropdown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                                }`}
                            >
                                {Array.from({ length: movie.number_of_seasons || 1 }, (_, i) => i + 1).map(
                                    (season) => (
                                        <button
                                            key={season}
                                            onClick={() => {
                                                setSelectedSeason(season);
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left !px-4 !py-2 text-white hover:bg-white/20 cursor-pointer"
                                        >
                                            Phần {season}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-white opacity-20 !mt-2 !mb-4"></div>

                        {loadingEpisodes ? (
                            <div className="text-center text-white !py-6">
                                <div className="border-4 border-gray-200 border-t-red-600 rounded-full w-10 h-10 animate-spin !mx-auto !mb-2"></div>
                                Đang tải danh sách tập...
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 !py-6">{error}</div>
                        ) : episodes.length === 0 ? (
                            <div className="text-center text-red-400 !py-6">Không có tập phim nào cho mùa này</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {episodes.map((episode) => (
                                    <a
                                        key={episode.id}
                                        className="flex items-center justify-center gap-2 !px-4 !py-3 bg-gray-800 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all"
                                        href={`/xem-phim/${movie.id}/season/${selectedSeason}/episode/${episode.episode_number}`}
                                    >
                                        <FontAwesomeIcon icon={faPlay} className="text-sm" />
                                        Tập {episode.episode_number}
                                    </a>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EpisodesTab;