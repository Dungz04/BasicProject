import React, { useState, useEffect, useRef } from "react";
// import { auth, db } from "../../service/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import tmdbApi from "../../service/tmdbApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import authApi from "../../service/authApi";
import cdnApi from "../../service/cdnApi";
import Hls from 'hls.js';

const MovieActions = ({ movieId, type }) => {
    const [user, setUser] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [trailerUrl, setTrailerUrl] = useState(null);
    const [showTrailerPopup, setShowTrailerPopup] = useState(false);
    const [trailerLoading, setTrailerLoading] = useState(false);
    const [trailerError, setTrailerError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const popupRef = useRef(null);
    const videoRef = useRef(null);
    const { user: authUser } = useAuth();

    const watchUrl = type === "tv"
        ? `/xem-phim/${movieId}/season/1/episode/1?type=tv`
        : `/xem-phim/${movieId}?type=movie`;

    useEffect(() => {
        if (authUser) {
            checkMovieStatus();
        } else {
            setLoading(false);
        }
    }, [authUser, movieId]);

    const checkMovieStatus = async () => {
        try {
            const [favoriteRes, playlistRes] =
                await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/check_favorite?email=${authUser.email}&movieId=${movieId}`
                        , {
                            headers: {
                                Authorization: `Bearer ${authApi.getAccessToken()}`
                            }
                        }
                    ),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/check_favorite?email=${authUser.email}&movieId=${movieId}`
                        , {
                            headers: {
                                Authorization: `Bearer ${authApi.getAccessToken()}`
                            }
                        }
                    )
                ]);
            console.log("FAVORITE RES", favoriteRes.data);

            console.log("PLAYLIST RES", playlistRes);

            setIsFavorite(favoriteRes.data);
            // setIsInPlaylist(playlistRes.data.isInPlaylist);
        } catch (error) {
            console.error("Error checking movie status:", error);
            toast.error("Không thể kiểm tra trạng thái phim");
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!authUser) {
            toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
            return;
        }

        try {
            const endpoint = isFavorite ? 'delete_favorite' : 'add_favorite';

            console.log("ENDPOINT", endpoint);
            if (endpoint === 'delete_favorite') {
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/movies/delete_favorite?email=${authUser.email}&movieId=${movieId}`, {
                    headers: {
                        Authorization: `Bearer ${authApi.getAccessToken()}`
                    }
                });
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/movies/add_favorite?email=${authUser.email}&movieId=${movieId}`, {
                }, {
                    headers: {
                        Authorization: `Bearer ${authApi.getAccessToken()}`
                    }
                });
            }
            setIsFavorite(!isFavorite);

            toast.success(isFavorite ?
                "Đã xóa khỏi danh sách yêu thích" :
                "Đã thêm vào danh sách yêu thích"
            );
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toast.error("Không thể cập nhật danh sách yêu thích");
        }
    };

    const togglePlaylist = async () => {
        if (!authUser) {
            toast.error("Vui lòng đăng nhập để thêm vào playlist!");
            return;
        }

        try {
            const endpoint = isInPlaylist ? 'remove' : 'add';
            await axios.post(`/api/playlist/${endpoint}`, {
                movieId,
                mediaType: type,
                title: document.title,
                posterPath: document.querySelector('meta[name="poster_path"]')?.content
            });

            setIsInPlaylist(!isInPlaylist);
            toast.success(isInPlaylist ?
                "Đã xóa khỏi playlist" :
                "Đã thêm vào playlist"
            );
        } catch (error) {
            console.error("Error toggling playlist:", error);
            toast.error("Không thể cập nhật playlist");
        }
    };

    useEffect(() => {
        if (!user) {
            setIsFavorite(false);
            setPlaylists([]);
            setTrailerUrl(null);
            return;
        }

        const fetchData = async () => {
            const parsedId = parseInt(movieId, 10);
            if (isNaN(parsedId)) {
                setTrailerError("ID nội dung không hợp lệ");
                setError("ID nội dung không hợp lệ");
                return;
            }

            try {
                setTrailerLoading(true);
                const userDocRef = doc(db, "users", user.uid);

                const [userDoc, videos] = await Promise.all([
                    getDoc(userDocRef),
                    tmdbApi.getContentVideos(parsedId, type),
                ]);

                // Xử lý dữ liệu người dùng
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const favorites = userData.favorites || [];
                    setIsFavorite(favorites.some((item) => item.movieId === parsedId && item.type === type));
                    setPlaylists(userData.playlists || []);
                }

                // Xử lý trailer
                if (process.env.NODE_ENV !== "production") {
                    console.log(`Videos for ${type} ${parsedId}:`, videos.results);
                }
                const video = videos.results.find(
                    (v) => v.type === "Trailer" && v.site === "YouTube"
                ) || videos.results.find(
                    (v) => v.type === "Teaser" && v.site === "YouTube"
                );
                if (video) {
                    setTrailerUrl(`https://www.youtube.com/embed/${video.key}?autoplay=1&modestbranding=1&fs=1&autohide=1`);
                } else {
                    setTrailerError("Không tìm thấy trailer hoặc teaser trên YouTube.");
                }
            } catch (err) {
                console.error(`Lỗi lấy dữ liệu cho ${type} ${movieId}:`, err);
                setError("Không thể tải dữ liệu người dùng hoặc trailer.");
                setTrailerError(err.message || "Không thể tải trailer.");
            } finally {
                setTrailerLoading(false);
            }
        };

        fetchData();
    }, [user, movieId, type]);

    const handleOpenTrailer = async () => {
        setTrailerLoading(true);
        setTrailerError(null);
        try {
            const contentDetails = await cdnApi.getContentDetails(movieId);

            if (!contentDetails?.trailerUrl) {
                throw new Error('Không tìm thấy trailer cho nội dung này');
            }

            const trailerAsset = await cdnApi.getAssets(contentDetails.trailerUrl, "trailer");
            if (!trailerAsset?.url) {
                throw new Error('Không thể tải trailer');
            }

            setShowTrailerPopup(true);

            // Initialize video player after popup is shown
            setTimeout(() => {
                initializeVideoPlayer(trailerAsset.url);
            }, 100);

        } catch (error) {
            console.error('Lỗi tải trailer:', error);
            setTrailerError(error.message || 'Không thể tải trailer');
            toast.error(error.message || 'Không thể tải trailer');
        } finally {
            setTrailerLoading(false);
        }
    };

    const initializeVideoPlayer = (videoUrl) => {
        if (!videoRef.current) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(videoUrl);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.ERROR, function (event, data) {
                console.error('HLS error:', data);
                if (data.fatal) {
                    setTrailerError('Lỗi tải video: ' + data.type);
                    if (hls) {
                        hls.destroy();
                    }
                }
            });

            // Store hls instance for cleanup
            videoRef.current.hlsInstance = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = videoUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
                videoRef.current.play().catch(error => {
                    console.error('Auto-play failed:', error);
                    setTrailerError('Không thể tự động phát video');
                });
            });
        } else {
            setTrailerError('Trình duyệt không hỗ trợ HLS');
        }
    };

    const handleCloseTrailer = () => {
        // Cleanup video player
        if (videoRef.current) {
            if (videoRef.current.hlsInstance) {
                videoRef.current.hlsInstance.destroy();
                delete videoRef.current.hlsInstance;
            }
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
        }
        setShowTrailerPopup(false);
    };

    // Xử lý focus cho pop-up
    useEffect(() => {
        if (showTrailerPopup && popupRef.current) {
            popupRef.current.focus();
        }
    }, [showTrailerPopup]);

    // Đóng pop-up khi nhấn phím Esc
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && showTrailerPopup) {
                handleCloseTrailer();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showTrailerPopup]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex items-center justify-start !p-4 rounded-lg gap-4 flex-wrap !mt-4">
            <div className="flex items-center gap-4 flex-grow flex-wrap">
                
                <a
                    href={watchUrl}
                    className="flex items-center justify-center gap-2 text-base font-bold text-black bg-gradient-to-r from-[#ff3333] to-[#aa0000] !py-3 !px-6 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,51,51,0.7),0_0_25px_rgba(255,51,51,0.5)] min-h-[3rem] !ml-3.5"
                >
                    <i className="fa-solid fa-play text-black group-hover:text-white" />
                    <span>Xem Ngay</span>

                </a>

                {/* Nút trailer */}
                <button
                    onClick={handleOpenTrailer}
                    className={`flex items-center justify-center gap-2 cursor-pointer text-base font-bold text-black bg-gradient-to-r from-[#ff9900] to-[#a57f01bb] !py-3 !px-6 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,153,0,0.7),0_0_25px_rgba(255,153,0,0.5)] min-h-[3rem] ${(!trailerUrl || trailerLoading) ? "" : ""}`}
                >
                    {trailerLoading ? (
                        <i className="fa-solid fa-spinner animate-spin text-black" />
                    ) : (
                        <i className="fa-solid fa-film text-black group-hover:text-white" />
                    )}
                    <span>Xem Trailer</span>
                </button>

                <div className="flex items-center gap-6 justify-start">
                    {/* Nút yêu thích */}
                    <div className="min-w-[4rem] !p-2 rounded-lg">
                        <div
                            className="flex flex-col items-center justify-center gap-1 text-sm transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] rounded !p-2 cursor-pointer"
                            onClick={toggleFavorite}
                        >
                            <div className={`w-5 h-5 ${isFavorite ? "text-[#e50914]" : "text-white"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <g clipPath="url(#clip0_49_76)">
                                        <path
                                            d="M10 18.1432L1.55692 9.82794C0.689275 8.97929 0.147406 7.85276 0.0259811 6.64517C-0.0954433 5.43759 0.211298 4.22573 0.892612 3.22133C4.99987 -2.24739 10 4.10278 10 4.10278C10 4.10278 15.0001 -2.24739 19.1074 3.22133C19.7887 4.22573 20.0954 5.43759 19.974 6.64517C19.8526 7.85276 19.3107 8.97929 18.4431 9.82794L10 18.1432Z"
                                            fill="currentColor"
                                        />
                                    </g>
                                </svg>
                            </div>
                            <span className="text-white text-xs">
                                Yêu thích
                            </span>
                        </div>
                    </div>

                    {/* Nút thêm vào playlist */}
                    
                </div>
            </div>

            {(error || trailerError) && (
                <div className="text-[#e50914] text-sm !mt-2">
                    {error || trailerError}
                </div>
            )}

            {/* Trailer Popup */}
            {showTrailerPopup && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 z-[9999]"
                        onClick={handleCloseTrailer}
                    />

                    {/* Popup Window */}
                    <div
                        className="fixed z-[10000] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1000px] bg-black rounded-lg shadow-lg overflow-hidden"
                        role="dialog"
                        aria-labelledby="trailer_popup_title"
                        ref={popupRef}
                    >
                        {/* Title Bar */}
                        <div className="flex justify-between items-center bg-[#111] text-white p-4">
                            <h3 id="trailer_popup_title" className="text-xl font-semibold">Xem Trailer</h3>
                            <button
                                onClick={handleCloseTrailer}
                                className="text-white hover:text-red-500 transition-colors"
                                aria-label="Đóng trailer"
                            >
                                <i className="fas fa-times text-2xl" />
                            </button>
                        </div>

                        {/* Video Container */}
                        <div className="relative aspect-video bg-black">
                            {trailerError ? (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500">
                                    <p>{trailerError}</p>
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
                </>
            )}
        </div>
    );
};

export default MovieActions;