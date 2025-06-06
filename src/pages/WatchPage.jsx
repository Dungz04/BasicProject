import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faAngleLeft, faCaretDown, faCog, faPause } from "@fortawesome/free-solid-svg-icons";
import cdnApi from "../service/cdnApi.jsx";
import Hls from "hls.js";

const WatchPage = () => {
    const { movieId, season, episode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    let type = queryParams.get("type") || (season || episode ? "tv" : "movie");

    const [contentJk, setContentJk] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentSeason, setCurrentSeason] = useState(parseInt(season) || 1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoError, setVideoError] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
    const [ageRating, setAgeRating] = useState("");
    const [qualityLevels, setQualityLevels] = useState(() => []);
    const [selectedQuality, setSelectedQuality] = useState(-1); // -1 for auto
    const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
    const [isVideoHovered, setIsVideoHovered] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const position = queryParams.get("position");

    const version = { id: 1, type: "pd", label: "Phụ đề", bgColor: "bg-[#5e6070]" };

    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const hideControlsTimeoutRef = useRef(null);

    const stableContentJk = useMemo(() => contentJk, [contentJk?.urlPlayer]);

    useEffect(() => {
        const fetchContentData = async () => {
            if (!movieId || isNaN(movieId) || movieId <= 0) {
                setError("ID nội dung không hợp lệ");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setVideoError(null);
                setIsVideoReady(false);

                const contentDetailsJk = await cdnApi.getContentDetails(movieId);
                if (!contentDetailsJk) {
                    throw new Error("Không tìm thấy nội dung");
                }

                const videoUrl = await cdnApi.getAssets(contentDetailsJk.videoUrl, "video");
                if (!videoUrl?.url) {
                    throw new Error("Không tìm thấy URL video hợp lệ");
                }

                const castList = await cdnApi.getCastList(contentDetailsJk.title);

                console.log("VIDEO URL:", videoUrl.url);

                setContentJk({ ...contentDetailsJk, castList, urlPlayer: videoUrl.url });

                const rating = contentDetailsJk.rating;
                setAgeRating(rating);

                setIsVideoReady(true);

                if (contentDetailsJk.status === "UPCOMING") {
                    setVideoError("UPCOMING");
                    setIsVideoReady(false);
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu:", err);
                setError(
                    err.message.includes("không tồn tại")
                        ? "Nội dung bạn tìm không có trong hệ thống."
                        : err.message || "Không thể tải nội dung. Vui lòng thử lại sau."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContentData();
    }, [movieId, type, currentSeason, episode]);

    useEffect(() => {
        let hls = hlsRef.current;

        const initVideo = () => {
            if (!videoRef.current) {
                console.warn("videoRef.current is null, retrying...");
                const timeout = setTimeout(initVideo, 100);
                return () => clearTimeout(timeout);
            }

            if (!stableContentJk?.urlPlayer || !isVideoReady) {
                console.warn("Skipping video init: contentJk.urlPlayer or isVideoReady not ready");
                return;
            }

            const videoUrl = stableContentJk.urlPlayer;
            console.log("Initializing video with URL:", videoUrl);

            if (Hls.isSupported()) {
                if (hls) {
                    console.warn("HLS instance already exists, destroying previous instance");
                    hls.destroy();
                }

                hls = new Hls({
                    debug: false,
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hlsRef.current = hls;

                hls.loadSource(videoUrl);
                hls.attachMedia(videoRef.current);

                hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    console.log("HLS manifest parsed", data.levels);
                    setQualityLevels(
                        data.levels.map((level, index) => ({
                            height: level.height,
                            bitrate: level.bitrate,
                            index: index,
                        }))
                    );
                    setSelectedQuality(hls.currentLevel);

                    if (position) {
                        videoRef.current.currentTime = Number(position);
                    }
                });

                hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                    setSelectedQuality(data.level);
                    console.log(`HLS quality switched to level index: ${data.level}`);
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error("HLS error:", data);
                    if (data.fatal) {
                        setVideoError(`Lỗi tải HLS: ${data.type}`);
                        if (hlsRef.current) {
                            hlsRef.current.destroy();
                            hlsRef.current = null;
                        }
                    }
                });
            } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
                videoRef.current.src = videoUrl;
                const playHandler = () => {
                    videoRef.current?.play().catch((error) => {
                        console.warn("Native HLS auto-play failed:", error);
                        if (error.name !== "NotAllowedError") {
                            setVideoError("Không thể tự động phát video");
                        }
                    });
                };
                videoRef.current.addEventListener("loadedmetadata", playHandler);
                videoRef.current.playHandler = playHandler;
            } else {
                setVideoError("Trình duyệt không hỗ trợ HLS");
            }
        };

        initVideo();

        return () => {
            if (hlsRef.current) {
                console.log("Destroying HLS instance on cleanup");
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (videoRef.current && videoRef.current.playHandler) {
                videoRef.current.removeEventListener("loadedmetadata", videoRef.current.playHandler);
            }
        };
    }, [stableContentJk, isVideoReady, position]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            const handlePlay = () => setIsVideoPlaying(true);
            const handlePause = () => setIsVideoPlaying(false);

            videoElement.addEventListener("play", handlePlay);
            videoElement.addEventListener("pause", handlePause);

            setIsVideoPlaying(!videoElement.paused);

            return () => {
                videoElement.removeEventListener("play", handlePlay);
                videoElement.removeEventListener("pause", handlePause);
            };
        }
    }, [videoRef.current]);

    useEffect(() => {
        return () => {
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
        };
    }, []);

    const handleQualityChange = (qualityIndex) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = qualityIndex;
            console.log(
                `Attempting to change HLS quality to: ${qualityIndex === -1
                    ? "Auto"
                    : qualityLevels.find((q) => q.index === qualityIndex)?.height + "p"
                }`
            );
        }
        setIsQualityMenuOpen(false);
    };

    const handleMouseEnterVideo = () => {
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
            hideControlsTimeoutRef.current = null;
        }
        setIsVideoHovered(true);
    };

    const handleMouseLeaveVideo = () => {
        hideControlsTimeoutRef.current = setTimeout(() => {
            setIsVideoHovered(false);
        }, 500);
    };

    const handleEpisodeClick = (ep) => {
        setVideoError(null);
        const selectedEpisode = episodes.find((e) => e.episode_number === ep.episode_number);
        if (selectedEpisode) {
            setCurrentEpisode(selectedEpisode);
            navigate(`/xem-phim/${movieId}/season/${currentSeason}/episode/${ep.episode_number}?type=tv`);
        }
    };

    const handleSeasonChange = (seasonNumber) => {
        setVideoError(null);
        setCurrentSeason(seasonNumber);
        setIsSeasonDropdownOpen(false);
        navigate(`/xem-phim/${movieId}/season/${seasonNumber}/episode/1?type=tv`);
    };

    const formatRuntime = (minutes) => {
        if (!minutes) return "";
        return `${minutes} phút`;
    };

    const handleVideoError = (error) => {
        console.error("Lỗi video:", error);
        setVideoError(error.message);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen rounded-[5px]">
                <div className="text-center p-4 bg-red-100 rounded-lg max-w-md">
                    <h3 className="text-lg font-medium text-red-800">Không tìm thấy nội dung</h3>
                    <p className="text-red-600 mt-2">
                        {error || "Nội dung bạn tìm không có trong hệ thống. Hãy thử lại hoặc quay về trang chủ!"}
                    </p>
                    <div className="mt-4 flex justify-center gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="px-4 py-2 bg-[#F4CE70] text-white rounded hover:bg-[#e50914] transition-colors"
                        >
                            Về trang chủ
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 !px-4 !py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!contentJk) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h3 className="text-lg font-medium">Không tìm thấy thông tin phim</h3>
                </div>
            </div>
        );
    }

    const title = contentJk?.title || contentJk?.name;
    const runtime = contentJk?.duration;
    const year = contentJk?.releaseYear;

    const genreList = typeof contentJk?.genres === "string"
        ? contentJk.genres.split(",").map((genre) => ({ name: genre.trim() }))
        : Array.isArray(contentJk?.genres)
            ? contentJk.genres
            : [];

    const castListName = contentJk?.castList?.data?.castName
        ? (typeof contentJk.castList.data.castName === "string"
            ? contentJk.castList.data.castName.split(",").map((item) => item.trim())
            : Array.isArray(contentJk.castList.data.castName)
                ? contentJk.castList.data.castName
                : [])
        : [];

    const castListData = contentJk?.castList?.data?.castData
        ? (typeof contentJk.castList.data.castData === "string"
            ? contentJk.castList.data.castData.split(",").map((item) => item.trim())
            : Array.isArray(contentJk.castList.data.castData)
                ? contentJk.castList.data.castData
                : [])
        : [];

    return (
        <div className="lg:px-4 px-2 bg-[#0f0f0f] min-h-screen text-white">
            {/* Header */}
            <div className="flex items-center gap-4 md:flex !mt-11">
                <button
                    onClick={() => navigate(-1)}
                    className="w-[36px] h-[36px] flex items-center justify-center rounded-full border border-white hover:bg-white duration-300 cursor-pointer"
                >
                    <FontAwesomeIcon icon={faAngleLeft} className="text-white hover:text-black" />
                </button>
                <h1 className="text-white !text-[28px] md:text-[48px] mt-[100px]">
                    Xem phim{" "}
                    {type === "tv" && currentEpisode
                        ? `${title} - Tập ${currentEpisode.episode_number}`
                        : title}
                </h1>
            </div>

            {/* Video Player */}
            <div className="!mt-[30px]">
                <div className="relative aspect-video w-full bg-black">
                    {videoError ? (
                        <div className="w-full h-full flex justify-center items-center bg-black text-red-500">
                            <p>{videoError}</p>
                        </div>
                    ) : isVideoReady ? (
                        <div
                            className="relative w-full h-full"
                            onMouseEnter={handleMouseEnterVideo}
                            onMouseLeave={handleMouseLeaveVideo}
                        >
                            <video ref={videoRef} className="w-full h-full object-contain" controls={true} />

                            {/* Custom Settings Button Overlay */}
                            {qualityLevels.length > 0 && (isVideoHovered || isQualityMenuOpen || !isVideoPlaying) && (
                                <div className="absolute bottom-12 right-[100px] md:bottom-11 md:right-[220px] z-20">
                                    <div className="relative inline-block">
                                        <button
                                            onClick={() => setIsQualityMenuOpen(!isQualityMenuOpen)}
                                            className="text-white !p-2 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-opacity focus:outline-none"
                                            title="Cài đặt chất lượng"
                                        >
                                            <FontAwesomeIcon icon={faCog} size="xl" />
                                        </button>
                                        {isQualityMenuOpen && (
                                            <div className="absolute bottom-full right-0 !mb-2 w-36 bg-black bg-opacity-80 !p-2 rounded shadow-lg">
                                                <div className="text-white text-sm !mb-1 border-b border-gray-600 !pb-1">
                                                    Chất lượng
                                                </div>
                                                <button
                                                    onClick={() => handleQualityChange(-1)}
                                                    className={`block w-full text-left !px-2 !py-1 text-xs rounded ${selectedQuality === -1 || hlsRef.current?.autoLevelEnabled
                                                        ? "bg-red-600"
                                                        : "hover:bg-gray-700"
                                                        } text-white mb-1`}
                                                >
                                                    Tự động{" "}
                                                    {selectedQuality === -1 || hlsRef.current?.autoLevelEnabled
                                                        ? `(${qualityLevels.find(
                                                            (q) => q.index === hlsRef.current?.currentLevel
                                                        )?.height
                                                        }p)`
                                                        : ""}
                                                </button>
                                                {qualityLevels.map((level) => (
                                                    <button
                                                        key={level.index}
                                                        onClick={() => handleQualityChange(level.index)}
                                                        className={`block w-full text-left !px-2 !py-1 text-xs rounded ${selectedQuality === level.index &&
                                                            !hlsRef.current?.autoLevelEnabled
                                                            ? "bg-red-600"
                                                            : "hover:bg-gray-700"
                                                            } text-white mb-0.5 last:mb-0`}
                                                    >
                                                        {level.height}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex justify-center items-center bg-black">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nội dung chính */}
            <div className="flex flex-col xl:flex-row gap-6 rounded-[5px] !mt-6">
                <div className="xl:w-2/3">
                    <div className="!p-3">
                        <div className="flex flex-col lg:flex-row justify-between gap-6 !mb-6 !px-4 sm:px-6 lg:px-8">
                            {/* Movie Info */}
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                                <img
                                    className="w-24 sm:w-32 lg:w-30 h-auto object-cover rounded-lg shadow-md"
                                    src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${contentJk.imageUrl
                                        }&nameTag=poster`}
                                    alt={`Poster for ${title}`}
                                />
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-semibold">{title}</h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {ageRating && (
                                            <span className="border border-red-600 text-white text-xs font-medium !px-2 !py-1 rounded-md hover:bg-red-600/30 transition duration-200">
                                                TMDb {ageRating}
                                            </span>
                                        )}
                                        <span className="bg-white/10 text-white text-xs font-medium !px-2 !py-1 rounded-md hover:bg-white/20 transition duration-200">
                                            {year}
                                        </span>
                                        {runtime && (
                                            <span className="bg-white/10 text-white text-xs font-medium !px-2 !py-1 rounded-md hover:bg-white/20 transition duration-200">
                                                {formatRuntime(runtime)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {genreList.length > 0 ? (
                                            genreList.map((genre, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-neutral-800 text-white text-xs font-medium !px-3 !py-1.5 rounded-md hover:bg-gradient-to-tr hover:from-red-500 hover:to-red-900 transition duration-200"
                                                >
                                                    {genre.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">Không có thông tin thể loại</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left max-w-[400px]">
                                <p className="overflow-hidden text-ellipsis line-clamp-4 text-[#AAAA] text-[14px]">
                                    {contentJk.overviewString || "Không có mô tả."}
                                </p>
                                <button
                                    onClick={() => navigate(`/movie/${movieId}`)}
                                    className="flex items-center gap-1 text-[#e50914] text-[14px] cursor-pointer hover:text-white transition-colors duration-200 !mt-2.5"
                                >
                                    Thông tin phim &gt;
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-[#aaaaaa62] my-[1em] xl:block hidden"></div>

                        {/* Phim lẻ - Bản chiếu (chỉ phụ đề) */}
                        {type === "movie" && (
                            <div className="!mt-2 !ml-2">
                                <div className="text-center">
                                    <span className="text-white text-[30px] !px-2">Bản chiếu</span>
                                </div>
                                <a
                                    href={`/xem-phim/${movieId}?type=movie&version=${version.type}`}
                                    className={`relative flex rounded-xl overflow-hidden ${version.bgColor} text-white hover:-translate-y-1 transition-transform duration-200 group w-[300px] h-[150px] !mt-2 `}
                                >
                                    <div className="absolute top-0 bottom-0 right-0 !w-[40%] max-w-[130px] [mask-image:linear-gradient(270deg,#000_0,transparent_95%)]">
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${contentJk.imageUrl
                                                }&nameTag=poster`}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10 w-[90%] !p-4 flex flex-col items-start justify-center gap-2 !mt-2">
                                        <div className="flex items-center">
                                            <span className="text-xs bg-gray-800/50 !px-2 !py-1 rounded">
                                                {version.label}
                                            </span>
                                        </div>
                                        <div className="font-semibold text-lg leading-tight">{title}</div>
                                        <div className="bg-red-600 text-white text-sm !px-3 !py-1 rounded-md group-hover:bg-transparent group-hover:border group-hover:border-red-600 transition-colors">
                                            Đang xem
                                        </div>
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Cast */}
                <div className="xl:w-1/3 flex !mr-4">
                    <div className="h-full w-[1px] bg-[#aaaaaa52] !ml-2 !mr-3"></div>
                    <div className="p-3 w-full">
                        {castListData.length > 0 && (
                            <>
                                <p className="text-[30px] text-center text-white !mb-4">Diễn viên</p>
                                <div className="mt-[20px] grid lg:grid-cols-3 grid-cols-2 gap-3">
                                    {castListData.slice(0, 5).map((actor, index) => (
                                        <div key={index} className="flex flex-col items-center gap-1">
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${castListData[index]
                                                    }&nameTag=cast&nameMovie=${title}`}
                                                alt={castListName[index]}
                                                className="w-16 h-24 object-cover rounded-lg transition-transform duration-300  hover:brightness-90"
                                            />
                                            <div>
                                                <p className="font-medium hover:text-red-600 text-center">
                                                    {castListName[index]}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="w-full h-[1px] bg-[#aaaaaa28] !mt-2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchPage;