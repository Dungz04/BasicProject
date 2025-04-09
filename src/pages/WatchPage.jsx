import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import tmdbApi from "../service/tmdbApi.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faAngleLeft,
    faHeart,
    faBookmark,
    faTheaterMasks,
    faShare,
    faFlag,
    faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import {
    faHeart as farHeart,
    faBookmark as farBookmark,
} from "@fortawesome/free-regular-svg-icons";

const WatchPage = () => {
    const { movieId, season, episode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type") || "movie";

    const [content, setContent] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentSeason, setCurrentSeason] = useState(parseInt(season) || 1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoError, setVideoError] = useState(null);
    const [isLiked, setIsLiked] = useState(() => localStorage.getItem(`liked-${movieId}`) === "true");
    const [isBookmarked, setIsBookmarked] = useState(() => localStorage.getItem(`bookmarked-${movieId}`) === "true");
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

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
                setVideoError(null);

                const contentDetails = await tmdbApi.getContentDetails(movieId, type);
                if (!contentDetails) throw new Error("Không tìm thấy nội dung");

                const credits = await tmdbApi.getContentCredits(movieId, type); // Thêm lấy dữ liệu diễn viên
                setContent({ ...contentDetails, credits }); // Gộp credits vào content

                const recs = await tmdbApi.getContentRecommendations(movieId, type);
                setRecommendations(recs.results?.slice(0, 3) || []);

                if (type === "tv" && season) {
                    const seasonDetails = await tmdbApi.getTvSeasonDetails(movieId, currentSeason);
                    if (seasonDetails?.episodes) {
                        setEpisodes(seasonDetails.episodes);
                        const selectedEpisode = seasonDetails.episodes.find(
                            (ep) => ep.episode_number === parseInt(episode)
                        );
                        setCurrentEpisode(selectedEpisode || seasonDetails.episodes[0]);
                    } else {
                        throw new Error("Không tìm thấy tập phim");
                    }
                }
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
                setError(err.message || "Không thể tải nội dung. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchContentData();
    }, [movieId, type, currentSeason, episode]);

    useEffect(() => {
        localStorage.setItem(`liked-${movieId}`, isLiked);
        localStorage.setItem(`bookmarked-${movieId}`, isBookmarked);
    }, [isLiked, isBookmarked, movieId]);

    const handleEpisodeChange = (episodeNumber) => {
        const selectedEpisode = episodes.find((ep) => ep.episode_number === episodeNumber);
        if (selectedEpisode) {
            setCurrentEpisode(selectedEpisode);
            navigate(`/xem-phim/${movieId}/season/${currentSeason}/episode/${episodeNumber}?type=tv`);
        }
    };

    const handleSeasonChange = (seasonNumber) => {
        setCurrentSeason(seasonNumber);
        setIsSeasonDropdownOpen(false);
        navigate(`/xem-phim/${movieId}/season/${seasonNumber}/episode/1?type=tv`);
    };

    const formatRuntime = (minutes) => {
        if (!minutes) return "";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours > 0 ? `${hours}h ` : ""}${mins}m`;
    };

    const getAgeRating = () => {
        if (content?.adult) return "18+";
        if (type === "tv") {
            const usRating = content?.content_ratings?.results?.find((r) => r.iso_3166_1 === "US");
            return usRating?.rating || "13+";
        }
        return "13+";
    };

    const handleVideoError = () => {
        setVideoError("Không thể phát video. Vui lòng thử lại sau.");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F4CE70]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen rounded-[5px]">
                <div className="text-center p-4 bg-red-100 rounded-lg max-w-md">
                    <h3 className="text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
                    <p className="text-red-600 mt-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-[#F4CE70] text-white rounded hover:bg-[#e6b800] transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h3 className="text-lg font-medium">Không tìm thấy thông tin phim</h3>
                </div>
            </div>
        );
    }

    const title = content.title || content.name;
    const episodeTitle = currentEpisode ? currentEpisode.name : null;
    const runtime = type === "movie" ? content.runtime : currentEpisode?.runtime;
    const ageRating = getAgeRating();
    const year = content.release_date?.substring(0, 4) || content.first_air_date?.substring(0, 4);

    return (
        <div className="lg:px-4 px-2 bg-[#0f0f0f] min-h-screen text-white ">
            {/* Header */}
            <div className="flex items-center gap-3 md:flex mt-2">
                <button
                    onClick={() => navigate(-1)}
                    className="w-[30px] h-[30px] flex items-center justify-center rounded-full border group hover:bg-white"
                >
                    <FontAwesomeIcon icon={faAngleLeft} className="text-white group-hover:text-black" />
                </button>
                <h1 className="text-white">
                    {type === "tv" && currentEpisode
                        ? `${title} - Tập ${currentEpisode.episode_number}`
                        : title}
                </h1>
            </div>

            {/* Video Player */}
            <div className="mt-[30px]">
                <div className="relative aspect-video w-full bg-black">
                    {videoError ? (
                        <div className="w-full h-full flex justify-center items-center bg-black text-red-500">
                            <p>{videoError}</p>
                        </div>
                    ) : (
                        <video
                            controls
                            className="w-full h-full"
                            autoPlay
                            onError={handleVideoError}
                        >
                            <source
                                src={
                                    type === "tv" && currentEpisode
                                        ? `https://www.example.com/stream?videoId=${movieId}&season=${season}&episode=${currentEpisode.episode_number}`
                                        : `https://www.example.com/stream?videoId=${movieId}`
                                }
                                type="video/mp4"
                            />
                            Trình duyệt của bạn không hỗ trợ video.
                        </video>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between p-3 bg-[#282B3A] rounded-b-lg">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className="cursor-pointer flex items-center space-x-1 hover:text-[#F4CE70] transition-colors"
                        title={isLiked ? "Bỏ thích" : "Thích"}
                    >
                        <FontAwesomeIcon
                            icon={isLiked ? faHeart : farHeart}
                            className={isLiked ? "text-[#F4CE70]" : "text-gray-300"}
                        />
                        <span className="text-sm">Yêu thích</span>
                    </button>

                    <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className="cursor-pointer flex items-center space-x-1 hover:text-[#F4CE70] transition-colors"
                        title={isBookmarked ? "Bỏ lưu" : "Lưu lại"}
                    >
                        <FontAwesomeIcon
                            icon={isBookmarked ? faBookmark : farBookmark}
                            className={isBookmarked ? "text-[#F4CE70]" : "text-gray-300"}
                        />
                        <span className="text-sm">Lưu lại</span>
                    </button>

                    <button
                        onClick={() => setIsTheaterMode(!isTheaterMode)}
                        className="cursor-pointer flex items Степер-centerspace-x-1 hover:text-[#F4CE70] transition-colors"
                        title={isTheaterMode ? "Thoát chế độ rạp phim" : "Chế độ rạp phim"}
                    >
                        <FontAwesomeIcon
                            icon={faTheaterMasks}
                            className={isTheaterMode ? "text-[#F4CE70]" : "text-gray-300"}
                        />
                        <span className="text-sm">Rạp phim</span>
                    </button>

                    <button
                        className="cursor-pointer flex items-center space-x-1 hover:text-[#F4CE70] transition-colors"
                        title="Chia sẻ"
                        onClick={() => alert("Tính năng chia sẻ đang được phát triển!")}
                    >
                        <FontAwesomeIcon icon={faShare} className="text-gray-300" />
                        <span className="text-sm">Chia sẻ</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col xl:flex-row gap-4 rounded-[5px] ">
                <div className="xl:w-2/3">
                    <div className="p-3">
                        <div className="flex items-start justify-between gap-10 xl:flex ">
                            {/* Movie Info bên trái */}
                            <div className="flex gap-[20px] items-start">
                                <img
                                    className="w-[100px] object-cover rounded-lg"
                                    src={
                                        content.poster_path
                                            ? `https://image.tmdb.org/t/p/w300${content.poster_path}`
                                            : "/images/no-poster.jpg"
                                    }
                                    alt={title}
                                />
                                <div className="flex flex-col gap-[2px]">
                                    <p className="text-[19px] text-white font-[600]">{title}</p>
                                    {content.tagline && (
                                        <p className="text-[14px] text-[#F4CE70]">{content.tagline}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        {content.vote_average && (
                                            <div className="bg-[#e50914] rounded-[5px]">
                                                <span className="text-[12px] px-1 text-white">TMDb {content.vote_average.toFixed(1)}</span>
                                            </div>
                                        )}
                                        <div className="border rounded-[5px]">
                                            <span className="text-[12px] px-1 text-white">{getAgeRating()}</span>
                                        </div>
                                        <div className="border rounded-[5px]">
                                            <span className="text-[12px] px-1 text-white">{year}</span>
                                        </div>
                                        {runtime && (
                                            <div className="border rounded-[5px]">
                                                <span className="text-[12px] px-1 text-white">{formatRuntime(runtime)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        {content.genres?.map((genre) => (
                                            <div key={genre.id} className="bg-[#272931] rounded-[4px]">
                                                <span className="p-2 text-[12px] text-white hover:text-[#F4CE70]">
                                                    {genre.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Overview bên phải */}
                            <div className="text-left max-w-[500px]">
                                <p className="overflow-hidden text-ellipsis line-clamp-4 text-[#AAAA] text-[14px]">
                                    {content.overview || "Không có mô tả."}
                                </p>
                                <button
                                    onClick={() => navigate(`/phim/${movieId}?type=${type}`)}
                                    className="flex items-center gap-1 text-[#F4CE70] text-[14px] mt-[10px] cursor-pointer hover:text-white transition-colors duration-200"
                                >
                                    Thông tin phim&gt;
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-[#aaaaaa62] my-[1em] xl:block hidden"></div>

                        {/* Episode List */}
                        {type === "tv" && episodes.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold">Danh sách tập</h3>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                                            className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-[#282B3A] rounded-lg hover:bg-[#F4CE70] hover:text-black transition-colors"
                                        >
                                            <span>Phần {currentSeason}</span>
                                            <FontAwesomeIcon icon={faCaretDown} />
                                        </button>
                                        {isSeasonDropdownOpen && (
                                            <div className="cursor-pointer absolute top-full right-0 mt-2 w-40 bg-[#282B3A] rounded-lg shadow-lg z-10">
                                                {Array.from({ length: content.number_of_seasons || 1 }, (_, i) => i + 1).map((seasonNum) => (
                                                    <button
                                                        key={seasonNum}
                                                        onClick={() => handleSeasonChange(seasonNum)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-[#F4CE70] hover:text-black transition-colors"
                                                    >
                                                        Phần {seasonNum}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-3">
                                    {episodes.map((ep) => (
                                        <button
                                            key={ep.id}
                                            className={`flex items-center justify-center gap-2 px-2 py-1 w-full h-[50px] rounded-md text-white text-[14px] group hover:text-[#F2CE71] ${currentEpisode?.episode_number === ep.episode_number
                                                ? "bg-[#5aac5aa8]"
                                                : "bg-[#282B3A]"
                                                }`}
                                            onClick={() => handleEpisodeChange(ep.episode_number)}
                                        >
                                            <FontAwesomeIcon
                                                icon={faPlay}
                                                className="text-[15px] text-white group-hover:text-[#F2CE71]"
                                            />
                                            Tập {ep.episode_number}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Cast and Recommendations */}
                <div className="xl:w-1/3 flex">
                    <div className="h-full w-[1px] bg-[#aaaaaa52]"></div>
                    <div className="p-3 w-full">
                        {/* Cast */}
                        {content?.credits?.cast?.length > 0 && (
                            <>
                                <p className="text-[30px] center text-white mb-4">Diễn viên</p>
                                <div className="mt-[20px] grid lg:grid-cols-3 grid-cols-2 gap-3">
                                    {content.credits.cast.slice(0, 9).map((actor) => (
                                        <div
                                            key={actor.id}

                                            className="flex flex-col items-center gap-1"
                                            onClick={() => navigate(`/actor/${actor.id}`)} // Điều hướng đến trang diễn viên nếu có
                                        >
                                            <img
                                                src={
                                                    actor.profile_path
                                                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                                                        : "/images/no-profile.jpg"
                                                }
                                                alt={actor.name}
                                                className="w-16 h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105 hover:brightness-90"
                                            />
                                            <div>
                                                <p className="center font-medium hover:text-red-600 ">{actor.name}</p>
                                                <p className="center text-sm text-gray-400 mt-1">
                                                    {actor.character || "Không có vai diễn"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </>
                        )}

                        <div className="w-full h-[1px] bg-[#aaaaaa28] my-[1em]"></div>

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <>
                                <p className="text-center text-[30px] text-white mb-4">Có thể bạn muốn xem</p>
                                <div className="space-y-4 px-4"> {/* Thêm padding ngang để ảnh không dính lề */}
                                    {recommendations.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 cursor-pointer hover:bg-[#1f2028b2] p-3 rounded-lg transition-colors"
                                            onClick={() => navigate(`/xem-phim/${item.id}?type=${item.media_type || type}`)}
                                        >
                                            <img
                                                src={
                                                    item.poster_path
                                                        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                                                        : "/images/no-poster.jpg"
                                                }
                                                alt={item.title || item.name}
                                                className="w-24 h-24 object-cover rounded-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                                            />
                                            <div>
                                                <p className="font-medium text-white">
                                                    {item.title || item.name}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full h-[1px] bg-[#aaaaaa28] my-[1em]"></div>
                            </>
                        )}


                    </div>
                </div>

            </div>
        </div>
    );
};

export default WatchPage;