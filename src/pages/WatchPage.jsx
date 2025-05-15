import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import tmdbApi from "../service/tmdbApi.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faAngleLeft, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import cdnApi from "../service/cdnApi.jsx";
import Hls from 'hls.js';

const WatchPage = () => {
    const { movieId, season, episode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    let type = queryParams.get("type") || (season || episode ? "tv" : "movie");

    const [content, setContent] = useState(null);
    const [contentJk, setContentJk] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentSeason, setCurrentSeason] = useState(parseInt(season) || 1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [videoError, setVideoError] = useState(null);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
    const [ageRating, setAgeRating] = useState("");
    const [recommendations, setRecommendations] = useState([]);

    const version = { id: 1, type: "pd", label: "Phụ đề", bgColor: "bg-[#5e6070]" };

    const videoRef = useRef(null);

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

                let contentType = type;
                let contentDetails;
                let contentDetailsJk;
                try {
                    contentDetails = await tmdbApi.getContentDetails(movieId, contentType);
                    contentDetailsJk = await cdnApi.getContentDetails(movieId);
                } catch (err) {
                    const fallbackType = contentType === "movie" ? "tv" : "movie";
                    contentDetails = await tmdbApi.getContentDetails(movieId, fallbackType);
                    contentDetailsJk = await cdnApi.getContentDetails(movieId);
                    contentType = fallbackType;
                }

                if (!contentDetailsJk) throw new Error("Không tìm thấy nội dung");

                const credits = await tmdbApi.getContentCredits(movieId, contentType);

                // if (!contentDetailsJk.videoUrl) {
                //     throw new Error("Không tìm thấy video");
                // }

                const videoUrl = await cdnApi.getAssets(contentDetailsJk.videoUrl, "video");

                const castList = await cdnApi.getCastList(contentDetailsJk.title);

                // console.log("CAST LIST:", castList.data.castData);

                // console.log("CAST LIST:", castList.data.castName);


                console.log("VIDEO URL:", videoUrl.url);

                setContentJk({ ...contentDetailsJk, castList, urlPlayer: videoUrl.url });

                setContent({ ...contentDetails, credits, type: contentType });

                const rating = contentDetailsJk.rating;

                setAgeRating(rating);

                const recs = await tmdbApi.getContentRecommendations(movieId, contentType);
                setRecommendations(recs.results?.slice(0, 3) || []);

                if (contentType === "tv" && season) {
                    try {
                        const seasonDetails = await tmdbApi.getTvSeasonDetails(movieId, currentSeason);
                        if (seasonDetails?.episodes) {
                            setEpisodes(seasonDetails.episodes);
                            const selectedEpisode = seasonDetails.episodes.find(
                                (ep) => ep.episode_number === parseInt(episode)
                            );
                            setCurrentEpisode(selectedEpisode || seasonDetails.episodes[0]);
                        } else {
                            setEpisodes([]);
                            setCurrentEpisode(null);
                            setError("Chưa có thông tin về mùa hoặc tập này.");
                        }
                    } catch (seasonErr) {
                        console.error("Lỗi khi lấy mùa/tập:", seasonErr);
                        setEpisodes([]);
                        setCurrentEpisode(null);
                        setError("Chưa có thông tin về mùa hoặc tập này.");
                    }
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
        let hls = null;

        const initVideo = () => {
            if (!videoError && contentJk?.urlPlayer) {
                const videoUrl = contentJk.urlPlayer;
                console.log("UL PL:", videoUrl);

                if (Hls.isSupported()) {
                    hls = new Hls({
                        debug: false,
                        enableWorker: true,
                        lowLatencyMode: true,
                    });

                    hls.loadSource(videoUrl);
                    hls.attachMedia(videoRef.current);
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        console.error('HLS error:', data);
                        if (data.fatal) {
                            handleVideoError(new Error('Lỗi tải HLS: ' + data.type));
                            if (hls) {
                                hls.destroy();
                                hls = null;
                            }
                        }
                    });
                } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                    videoRef.current.src = videoUrl;
                    const playHandler = () => {
                        videoRef.current?.play().catch(error => {
                            console.error('Auto-play failed:', error);
                            handleVideoError(new Error('Không thể tự động phát video'));
                        });
                    };
                    videoRef.current.addEventListener('loadedmetadata', playHandler);

                    // Store the handler for cleanup
                    videoRef.current.playHandler = playHandler;
                } else {
                    handleVideoError(new Error('Trình duyệt không hỗ trợ HLS'));
                }
            }
        };

        initVideo();

        // Cleanup function
        return () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }

            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.removeAttribute('src');
                videoRef.current.load();

                // Remove stored event listener if it exists
                if (videoRef.current.playHandler) {
                    videoRef.current.removeEventListener('loadedmetadata', videoRef.current.playHandler);
                    delete videoRef.current.playHandler;
                }
            }
        };
    }, [videoRef, contentJk, currentEpisode, videoError]);

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
        return `${minutes} phút`;
    };

    const getAgeRating = async (content, type, id) => {
        try {
            if (content?.adult) return "Adult";

            if (type === "tv") {
                let usRating = content?.content_ratings?.results?.find((r) => r.iso_3166_1 === "US");
                if (!usRating) {
                    const contentRatings = await tmdbApi.getContentReleaseInfo(id, type);
                    // Xử lý cấu trúc dữ liệu linh hoạt
                    const results = contentRatings?.results || contentRatings || [];
                    usRating = Array.isArray(results)
                        ? results.find((r) => r.iso_3166_1 === "US")
                        : null;
                }
                return usRating?.rating || "";
            }

            const releaseInfo = await tmdbApi.getContentReleaseInfo(id, type);
            const usRelease = releaseInfo.find((r) => r.iso_3166_1 === "US");
            if (usRelease?.release_dates?.length > 0) {
                const certification = usRelease.release_dates.find((d) => d.certification)?.certification;
                return certification || "";
            }

            return "";
        } catch (error) {
            console.error(`❌ Error fetching age rating for ${type} ${id}:`, error.message);
            return "";
        }
    };

    const handleVideoError = (e) => {
        console.error('Lỗi video:', e);
        const videoUrl = contentJk && contentJk.trailerUrl
            ? `${import.meta.env.VITE_CDN_URL}/api/get_assets?linkTrailer=${contentJk.trailerUrl}/master.m3u8&nameTag=trailer`
            : type === "tv" && currentEpisode
                ? `${import.meta.env.VITE_CDN_URL}/api/get_assets?linkVideo=${contentJk.videoUrl}/${currentEpisode.episode_number}/master.m3u8&nameTag=video`
                : `${import.meta.env.VITE_CDN_URL}/api/get_assets?linkVideo=${contentJk.videoUrl}/master.m3u8&nameTag=video`;

        setVideoError(`Không thể tải video. URL: ${videoUrl}`);
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

    if (!content) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h3 className="text-lg font-medium">Không tìm thấy thông tin phim</h3>
                </div>
            </div>
        );
    }

    const title = contentJk.title || contentJk.name;
    const runtime = contentJk.duration;
    const year = contentJk.releaseYear;

    const genreList = typeof contentJk.genres === 'string'
        ? contentJk.genres.split(',').map(genre => ({ name: genre.trim() }))
        : Array.isArray(contentJk.genres)
            ? contentJk.genres
            : [];

    const castListName = contentJk?.castList?.data?.castName
        ? (typeof contentJk.castList.data.castName === 'string'
            ? contentJk.castList.data.castName.split(',').map(item => item.trim())
            : Array.isArray(contentJk.castList.data.castName)
                ? contentJk.castList.data.castName
                : [])
        : [];

    console.log("CAST LIST NAME:", castListName);

    const castListData = contentJk?.castList?.data?.castData
        ? (typeof contentJk.castList.data.castData === 'string'
            ? contentJk.castList.data.castData.split(',').map(item => item.trim())
            : Array.isArray(contentJk.castList.data.castData)
                ? contentJk.castList.data.castData
                : [])
        : [];

    console.log("CAST LIST DATA:", castListData);

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
                    ) : (
                        <video
                            ref={videoRef}
                            controls
                            className="w-full h-full"
                            autoPlay
                        />
                    )}
                </div>
            </div>

            {/* Nội dung chính */}
            <div className="flex flex-col xl:flex-row gap-6 rounded-[5px] !mt-6">
                <div className="xl:w-2/3">
                    <div className="p-3">
                        <div className="flex items-start justify-between gap-10 xl:flex !mb-4">
                            {/* Movie Info */}
                            <div className="flex gap-[20px] items-start !ml-2">
                                <img
                                    className="w-[100px] object-cover rounded-lg"
                                    src={
                                        `${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${contentJk.imageUrl}&nameTag=poster`
                                    }
                                    alt={title}
                                />
                                <div className="flex flex-col gap-[5px]">
                                    <p className="text-[19px] text-white font-[600]">{title}</p>
                                    {content.tagline && (
                                        <p className="text-[14px] text-[#e50914]">{content.tagline}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        {content.vote_average && (
                                            <div className="border border-[#e50914] rounded-[5px] !px-2">
                                                <span className="text-[12px] px-1 text-white">
                                                    TMDb {contentJk.rating}
                                                </span>
                                            </div>
                                        )}
                                        <div className="border rounded-[5px]">
                                            <span className="text-[12px] !px-1 text-white">{year}</span>
                                        </div>
                                        {runtime && (
                                            <div className="border rounded-[5px]">
                                                <span className="text-[12px] !px-1 text-white">
                                                    {formatRuntime(runtime)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        {genreList.length > 0 ? (
                                            genreList.map((genre, index) => (
                                                <span key={index} className="bg-neutral-800 text-white text-xs !px-3 !py-2 rounded-md hover:bg-gradient-to-tr hover:from-red-500 hover:to-red-900 transition-transform duration-200 ">
                                                    {genre.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">Không có thông tin thể loại</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-left max-w-[400px] !mr-1">
                                <p className="overflow-hidden text-ellipsis line-clamp-4 text-[#AAAA] text-[14px]">
                                    {contentJk.overviewString || "Không có mô tả."}
                                </p>
                                <button
                                    onClick={() => navigate(`/phim/${movieId}?type=${type}`)}
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
                                    <span className="text-white text-[30px] !px-2">
                                        Bản chiếu
                                    </span>
                                </div>
                                <a
                                    href={`/xem-phim/${movieId}?type=movie&version=${version.type}`}
                                    className={`relative flex rounded-xl overflow-hidden ${version.bgColor} text-white hover:-translate-y-1 transition-transform duration-200 group w-[300px] h-[150px] !mt-2 `}
                                >
                                    <div className=" absolute top-0 bottom-0 right-0 !w-[40%] max-w-[130px] [mask-image:linear-gradient(270deg,#000_0,transparent_95%)]">
                                        <img
                                            src={
                                                `${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${contentJk.imageUrl}&nameTag=poster`
                                            }
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
                                        <div className="font-semibold text-lg leading-tight">
                                            {title}
                                        </div>
                                        <div className="bg-red-600 text-white text-sm !px-3 !py-1 rounded-md group-hover:bg-transparent group-hover:border group-hover:border-red-600 transition-colors">
                                            Đang xem
                                        </div>
                                    </div>
                                </a>
                            </div>
                        )}

                        {/* Phim bộ - Danh sách tập */}
                        {type === "tv" && episodes.length > 0 && (
                            <div className="!mb-6">
                                <div className="flex items-center justify-between !mb-4 !ml-2">

                                    <div className="relative">
                                        {/* Hàng ngang chứa tiêu đề + thanh dọc + nút chọn phần */}
                                        <div className="flex items-center gap-4 !mb-2">
                                            {/* Tiêu đề */}
                                            <h3 className="text-xl font-bold text-white !mt-2 border border-[#ffffff] rounded-[5px] !px-4 !py-1">Danh sách tập</h3>

                                            {/* Thanh dọc ngăn cách */}
                                            <div className="w-[1px] h-9 bg-white opacity-20 !mt-2"></div>

                                            <div className="relative group">
                                                {/* Nút chọn phần */}
                                                <button
                                                    className="flex items-center cursor-pointer !space-x-2 !px-4 !py-2 !mt-2 bg-[#282B3A] rounded-lg hover:bg-[#e50914] hover:!text-black transition-colors"
                                                >
                                                    <span>Phần {currentSeason}</span>
                                                    <FontAwesomeIcon icon={faCaretDown} />
                                                </button>

                                                {/* Dropdown xuất hiện khi hover */}
                                                <div className="absolute top-full !w-25.5 hidden group-hover:block !px-4 !py-2 bg-[#282B3A]  rounded-lg shadow-lg z-10">
                                                    {Array.from({ length: content.number_of_seasons || 1 }, (_, i) => i + 1).map((seasonNum) => (
                                                        <button
                                                            key={seasonNum}
                                                            onClick={() => handleSeasonChange(seasonNum)}
                                                            className="block w-full  !px-2 !py-2 rounded-[5px] cursor-pointer  hover:text-[#e50914] transition-colors"
                                                        >
                                                            Phần {seasonNum}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>

                                <div className="grid lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-4 grid-cols-2 gap-3">
                                    {episodes.map((ep) => (
                                        <button
                                            key={ep.id}
                                            className={`flex items-center justify-center gap-2 cursor-pointer w-full h-[50px] rounded-md text-white text-[14px] group  ${currentEpisode?.episode_number === ep.episode_number
                                                ? "bg-[#e50914]"
                                                : "bg-[#282B3A]"
                                                }`}
                                            onClick={() => handleEpisodeChange(ep.episode_number)}
                                        >
                                            <FontAwesomeIcon
                                                icon={faPlay}
                                                className="text-[15px] text-white group-hover:text-[#e50914]"
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
                <div className="xl:w-1/3 flex !mr-4">
                    <div className="h-full w-[1px] bg-[#aaaaaa52] !ml-2 !mr-3"></div>
                    <div className="p-3 w-full">
                        {castListData.length > 0 && (
                            <>
                                <p className="text-[30px] text-center text-white !mb-4">Diễn viên</p>
                                <div className="mt-[20px] grid lg:grid-cols-3 grid-cols-2 gap-3">
                                    {castListData.slice(0, 5).map((actor, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <img
                                                src={
                                                    `${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${castListData[index]}&nameTag=cast&nameMovie=${title}`
                                                }
                                                alt={castListName[index]}
                                                className="w-16 h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105 hover:brightness-90"
                                            />
                                            <div>
                                                <p className="font-medium hover:text-red-600 text-center">
                                                    {castListName[index]}
                                                </p>
                                                {/* <p className="text-sm text-gray-400 mt-1 text-center">
                                                    {actor.character || "Không có vai diễn"}
                                                </p> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="w-full h-[1px] bg-[#aaaaaa28] !mt-2"></div>

                        {/* gợi ý phim */}
                        {recommendations.length > 0 && (
                            <>
                                <p className="text-center text-[30px] text-white !mt-2 !mb-4">
                                    Có thể bạn muốn xem
                                </p>
                                <div className="space-y-4 px-4">
                                    {recommendations.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 cursor-pointer hover:bg-[#1f2028b2] p-3 rounded-lg transition-colors"
                                            onClick={() =>
                                                navigate(`/phim/${item.id}?type=${item.media_type || type}`)
                                            }
                                        >
                                            <img
                                                src={
                                                    item.poster_path
                                                        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                                                        : "/images/no-poster.jpg"
                                                }
                                                alt={item.title || item.name}
                                                className="w-[100px] object-cover rounded-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-lg !mb-1.25"
                                            />
                                            <div>
                                                <p className="font-medium text-white hover:text-[#e50914]">
                                                    {item.title || item.name}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {item.release_date?.substring(0, 4) ||
                                                        item.first_air_date?.substring(0, 4)}
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