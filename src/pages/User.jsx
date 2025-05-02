import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaPlus, FaClockRotateLeft, FaUser, FaRightFromBracket } from "react-icons/fa6";
import { auth, db, retryOperation } from "../service/firebase";
import { doc, onSnapshot, updateDoc, arrayRemove, setDoc, writeBatch } from "firebase/firestore";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import tmdbApi from "../service/tmdbApi";
import Navbar from "../components/Navbar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";

const User = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [movieDetails, setMovieDetails] = useState({});
    const [error, setError] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const getInitialTab = () => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        return tab || "profile";
    };
    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Kiểm tra cookie
    useEffect(() => {
        if (!navigator.cookieEnabled) {
            toast.error("Cookie bị tắt. Vui lòng bật cookie để sử dụng ứng dụng.", {
                toastId: "cookie-error",
                autoClose: false,
            });
        }
    }, []);

    // Theo dõi trạng thái mạng
    useEffect(() => {
        console.log("Trạng thái mạng:", navigator.onLine ? "Online" : "Offline");
        const handleOnline = () => {
            setIsOnline(true);
            console.log("Mạng đã online");
        };
        const handleOffline = () => {
            setIsOnline(false);
            console.log("Mạng đã offline");
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Theo dõi trạng thái xác thực và dữ liệu người dùng
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(
            auth,
            (user) => {
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    const unsubscribeSnapshot = onSnapshot(
                        userRef,
                        { includeMetadataChanges: false },
                        (doc) => {
                            if (doc.exists()) {
                                const data = doc.data();
                                setCurrentUser({
                                    name: user.displayName || "Người dùng",
                                    email: user.email,
                                    avatar: user.photoURL || "https://via.placeholder.com/150",
                                    gender: data.gender || "other",
                                });
                                setFavorites(data.favorites || []);
                                setPlaylists(data.playlists || []);
                                setError(null);
                            } else {
                                retryOperation(() =>
                                    setDoc(userRef, { favorites: [], playlists: [], gender: "other" })
                                )
                                    .then(() => {
                                        setCurrentUser({
                                            name: user.displayName || "Người dùng",
                                            email: user.email,
                                            avatar: user.photoURL || "https://via.placeholder.com/150",
                                            gender: "other",
                                        });
                                        setFavorites([]);
                                        setPlaylists([]);
                                        setError(null);
                                    })
                                    .catch((err) => {
                                        console.error("Lỗi khởi tạo tài liệu người dùng:", {
                                            message: err.message,
                                            code: err.code,
                                            stack: err.stack,
                                        });
                                        setError("Không thể khởi tạo dữ liệu người dùng.");
                                        toast.error("Không thể khởi tạo dữ liệu người dùng.", {
                                            toastId: "init-user-error",
                                        });
                                        console.log("Toast triggered: init-user-error");
                                    });
                            }
                        },
                        (err) => {
                            console.error("Lỗi Firestore:", {
                                message: err.message,
                                code: err.code,
                                stack: err.stack,
                            });
                            setError(
                                err.code === "unavailable"
                                    ? "Bạn đang ngoại tuyến."
                                    : "Lỗi tải dữ liệu người dùng."
                            );
                            toast.error(
                                err.code === "unavailable"
                                    ? "Bạn đang ngoại tuyến."
                                    : "Lỗi tải dữ liệu người dùng.",
                                { toastId: "firestore-error" }
                            );
                            console.log("Toast triggered: firestore-error");
                        }
                    );
                    return () => unsubscribeSnapshot();
                } else {
                    setCurrentUser(null);
                    setFavorites([]);
                    setPlaylists([]);
                    navigate("/login");
                }
            },
            (authError) => {
                console.error("Lỗi xác thực:", {
                    message: authError.message,
                    code: authError.code,
                    stack: authError.stack,
                });
                setError("Lỗi xác thực. Vui lòng thử lại.");
                toast.error("Lỗi xác thực. Vui lòng thử lại.", { toastId: "auth-error" });
                console.log("Toast triggered: auth-error");
            }
        );
        return () => unsubscribeAuth();
    }, [navigate]);

    // Lấy thông tin phim từ TMDB API
    useEffect(() => {
        const fetchMovieDetails = async () => {
            const allMovies = [
                ...favorites,
                ...playlists.flatMap((playlist) => playlist.movies || []),
            ];

            if (allMovies.length === 0) return;

            setLoading(true);
            try {
                const details = {};
                for (const { movieId, type } of allMovies) {
                    const key = `${movieId}-${type}`;
                    if (!details[key]) {
                        const data = await tmdbApi.getContentDetails(movieId, type);
                        details[key] = {
                            title: type === "movie" ? data.title : data.name,
                            poster: data.poster_path
                                ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
                                : null,
                            year: type === "movie" ? data.release_date?.slice(0, 4) : data.first_air_date?.slice(0, 4),
                            type: type === "movie" ? "Phim" : "TV Show",
                        };
                    }
                }
                setMovieDetails(details);
                setError(null);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu TMDB:", {
                    message: err.message,
                    code: err.code,
                    stack: err.stack,
                });
                setError("Không thể tải thông tin phim.");
                toast.error("Không thể tải thông tin phim.", { toastId: "tmdb-error" });
                console.log("Toast triggered: tmdb-error");
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [favorites, playlists]);

    // Xóa phim khỏi favorites
    const handleRemoveFavorite = async (movieData) => {
        if (!auth.currentUser) return;

        setLoading(true);
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            await retryOperation(() => updateDoc(userRef, { favorites: arrayRemove(movieData) }));
            toast.success("Đã xóa phim khỏi danh sách yêu thích!", { toastId: "remove-favorite" });
            console.log("Toast triggered: remove-favorite");
        } catch (err) {
            console.error("Lỗi xóa yêu thích:", {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });
            setError("Không thể xóa phim khỏi yêu thích.");
            toast.error("Không thể xóa phim khỏi yêu thích.", { toastId: "remove-favorite-error" });
            console.log("Toast triggered: remove-favorite-error");
        } finally {
            setLoading(false);
        }
    };

    // Xóa phim khỏi playlist
    const handleRemoveFromPlaylist = async (playlistId, movieData) => {
        if (!auth.currentUser) return;

        setLoading(true);
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            const updatedPlaylists = playlists.map((playlist) =>
                playlist.id === playlistId
                    ? {
                          ...playlist,
                          movies: (playlist.movies || []).filter(
                              (m) => m.movieId !== movieData.movieId || m.type !== movieData.type
                          ),
                      }
                    : playlist
            );
            const batch = writeBatch(db);
            batch.update(userRef, { playlists: updatedPlaylists });
            await retryOperation(() => batch.commit());
            toast.success("Đã xóa phim khỏi playlist!", { toastId: "remove-playlist" });
            console.log("Toast triggered: remove-playlist");
        } catch (err) {
            console.error("Lỗi xóa khỏi playlist:", {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });
            setError("Không thể xóa phim khỏi playlist.");
            toast.error("Không thể xóa phim khỏi playlist.", { toastId: "remove-playlist-error" });
            console.log("Toast triggered: remove-playlist-error");
        } finally {
            setLoading(false);
        }
    };

    // Xóa playlist
    const handleDeletePlaylist = async (playlistId) => {
        if (!auth.currentUser) return;

        setLoading(true);
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            const updatedPlaylists = playlists.filter((playlist) => playlist.id !== playlistId);
            const batch = writeBatch(db);
            batch.update(userRef, { playlists: updatedPlaylists });
            await retryOperation(() => batch.commit());
            toast.success("Đã xóa playlist!", { toastId: "delete-playlist" });
            console.log("Toast triggered: delete-playlist");
        } catch (err) {
            console.error("Lỗi xóa playlist:", {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });
            setError("Không thể xóa playlist.");
            toast.error("Không thể xóa playlist.", { toastId: "delete-playlist-error" });
            console.log("Toast triggered: delete-playlist-error");
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật hồ sơ
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await retryOperation(() => updateProfile(auth.currentUser, { displayName: currentUser.name }));
            await retryOperation(() =>
                updateDoc(userRef, {
                    name: currentUser.name,
                    gender: currentUser.gender || "other",
                })
            );
            setError(null);
            toast.success("Cập nhật thông tin thành công!", { toastId: "profile-update" });
            console.log("Toast triggered: profile-update");
        } catch (err) {
            console.error("Lỗi cập nhật hồ sơ:", {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });
            setError("Không thể cập nhật hồ sơ.");
            toast.error("Không thể cập nhật hồ sơ.", { toastId: "profile-update-error" });
            console.log("Toast triggered: profile-update-error");
        }
    };

    // Đăng xuất
    const handleSignOut = async () => {
        try {
            await retryOperation(() => signOut(auth));
            navigate("/login");
            toast.success("Đã đăng xuất thành công!", { toastId: "sign-out" });
            console.log("Toast triggered: sign-out");
        } catch (err) {
            console.error("Lỗi đăng xuất:", {
                message: err.message,
                code: err.code,
                stack: err.stack,
            });
            setError("Lỗi đăng xuất. Vui lòng thử lại.");
            toast.error("Lỗi đăng xuất. Vui lòng thử lại.", { toastId: "sign-out-error" });
            console.log("Toast triggered: sign-out-error");
        }
    };

    // Cập nhật tab trong URL
    useEffect(() => {
        navigate(`/user?tab=${activeTab}`, { replace: true });
    }, [activeTab, navigate]);

    // Hiển thị khi ngoại tuyến
    if (!isOnline) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
                Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng.
            </div>
        );
    }

    // Hiển thị khi đang tải
    if (!currentUser && !error) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
                <Skeleton circle width={100} height={100} />
                <Skeleton width={200} height={20} className="ml-4" />
            </div>
        );
    }

    // Hiển thị lỗi
    if (error && !currentUser) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">
                {error}
            </div>
        );
    }

    return (
        <div>
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex min-h-screen !pt-16">
                <div className="w-72 bg-gray-800 text-white !p-0 rounded-[20px]">
                    <div className="!p-5">
                        <h2 className="text-xl font-semibold !mb-4">Quản lý tài khoản</h2>
                        <nav className="!space-y-2">
                            <button
                                onClick={() => setActiveTab("favorites")}
                                className={`flex items-center !p-3 w-full text-left rounded cursor-pointer ${
                                    activeTab === "favorites"
                                        ? "text-white bg-gray-700"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <FaHeart className="!mr-3 w-5 text-center" />
                                <span>Yêu thích</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("playlist")}
                                className={`flex items-center !p-3 w-full text-left rounded cursor-pointer ${
                                    activeTab === "playlist"
                                        ? "text-white bg-gray-700"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <FaPlus className="!mr-3 w-5 text-center" />
                                <span>Danh sách</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`flex items-center !p-3 w-full text-left rounded cursor-pointer ${
                                    activeTab === "history"
                                        ? "text-white bg-gray-700"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <FaClockRotateLeft className="!mr-3 w-5 text-center" />
                                <span>Xem tiếp</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`flex items-center !p-3 w-full text-left rounded cursor-pointer ${
                                    activeTab === "profile"
                                        ? "text-white bg-gray-700"
                                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <FaUser className="!mr-3 w-5 text-center" />
                                <span>Tài khoản</span>
                            </button>
                        </nav>
                    </div>
                    <div className="!p-5 border-t border-gray-500 !mt-5 rounded-[20px]">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full overflow-hidden !mb-4">
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-semibold truncate w-full text-center">
                                {currentUser.name}
                            </h3>
                            <p className="text-gray-400 text-sm truncate w-full text-center !mb-4">
                                {currentUser.email}
                            </p>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center text-gray-400 hover:text-white cursor-pointer"
                            >
                                <FaRightFromBracket className="!mr-2" />
                                <span>Thoát</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 !p-6 bg-gray-200 rounded-[20px]">
                    {/* Tab Thông tin tài khoản */}
                    {activeTab === "profile" && (
                        <div className="bg-white rounded-[20px] shadow overflow-hidden">
                            <div className="!p-6 border-b border-gray-200">
                                <h1 className="text-xl font-semibold !mb-2">Tài khoản</h1>
                                <p className="text-gray-600">Cập nhật thông tin tài khoản</p>
                            </div>
                            <div className="!p-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0 text-center">
                                        <div className="w-32 h-32 rounded-lg overflow-hidden mx-auto !mb-4">
                                            <img
                                                src={currentUser.avatar}
                                                alt={currentUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button className="text-sm text-red-500 hover:text-red-700 cursor-pointer">
                                            Đổi ảnh đại diện
                                        </button>
                                    </div>
                                    <form onSubmit={handleProfileUpdate} className="flex-1">
                                        <div className="!mb-6">
                                            <label className="block text-sm font-medium text-gray-700 !mb-2">
                                                Email :
                                            </label>
                                            <input
                                                type="text"
                                                value={currentUser.email}
                                                disabled
                                                className="w-full !px-4 !py-3 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="!mb-6">
                                            <label className="block text-sm font-medium text-gray-700 !mb-2">
                                                Tên hiển thị :
                                            </label>
                                            <input
                                                type="text"
                                                value={currentUser.name}
                                                onChange={(e) =>
                                                    setCurrentUser((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="w-full !px-4 !py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                        <div className="!mb-8">
                                            <label className="block text-sm font-medium text-gray-700 !mb-3">
                                                Giới tính
                                            </label>
                                            <div className="!space-x-6">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="male"
                                                        checked={currentUser.gender === "male"}
                                                        onChange={() =>
                                                            setCurrentUser((prev) => ({
                                                                ...prev,
                                                                gender: "male",
                                                            }))
                                                        }
                                                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                    />
                                                    <span className="!ml-2">Nam</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="female"
                                                        checked={currentUser.gender === "female"}
                                                        onChange={() =>
                                                            setCurrentUser((prev) => ({
                                                                ...prev,
                                                                gender: "female",
                                                            }))
                                                        }
                                                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                    />
                                                    <span className="!ml-2">Nữ</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="other"
                                                        checked={currentUser.gender === "other"}
                                                        onChange={() =>
                                                            setCurrentUser((prev) => ({
                                                                ...prev,
                                                                gender: "other",
                                                            }))
                                                        }
                                                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                    />
                                                    <span className="!ml-2">Không xác định</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="submit"
                                                className="!px-6 !py-2 cursor-pointer bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                Cập nhật
                                            </button>
                                        </div>
                                        <p className="!mt-8 text-gray-600">
                                            Đổi mật khẩu, nhấn vào{" "}
                                            <a href="#" className="text-red-500 hover:text-red-700">
                                                đây
                                            </a>
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Yêu thích */}
                    {activeTab === "favorites" && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="!p-6 border-b border-gray-200">
                                <h1 className="text-xl font-semibold !mb-2">Phim Yêu Thích</h1>
                                <p className="text-gray-600">Danh sách phim bạn đã yêu thích</p>
                            </div>
                            <div className="!p-6">
                                {loading && <p className="text-gray-600">Đang tải...</p>}
                                {error && <p className="text-red-500">{error}</p>}
                                {favorites.length === 0 && !loading && (
                                    <div className="text-center !py-10">
                                        <i className="fa-solid fa-heart-broken text-red-500 text-5xl !mb-4"></i>
                                        <p className="text-gray-600 text-lg">
                                            Bạn chưa có phim yêu thích nào. Hãy khám phá và thêm phim ngay!
                                        </p>
                                        <button
                                            onClick={() => navigate("/")}
                                            className="!mt-4 !px-6 !py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        >
                                            Khám phá phim
                                        </button>
                                    </div>
                                )}
                                {favorites.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {favorites.map((item) => {
                                            const key = `${item.movieId}-${item.type}`;
                                            const movie = movieDetails[key] || {};
                                            return (
                                                <div
                                                    key={key}
                                                    className="group relative flex flex-col items-center"
                                                >
                                                    {movie.poster ? (
                                                        <img
                                                            src={movie.poster}
                                                            alt={movie.title}
                                                            className="w-full h-60 object-cover rounded-md transition-all duration-300 group-hover:shadow-xl"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-60 bg-gray-700 flex items-center justify-center rounded-md">
                                                            Không có ảnh
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                                                        <button
                                                            onClick={() => handleRemoveFavorite(item)}
                                                            disabled={loading}
                                                            className="!px-3 !py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                    <div className="!mt-3 text-center">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                                            {movie.title || "Đang tải..."}
                                                        </p>
                                                        <p className="text-xs text-gray-500 !mt-1">
                                                            {movie.year || "N/A"} • {movie.type || "Phim"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Danh sách */}
                    {activeTab === "playlist" && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="!p-6 border-b border-gray-200">
                                <h1 className="text-xl font-semibold !mb-2">Danh Sách</h1>
                                <p className="text-gray-600">Danh sách phim bạn đã tạo</p>
                            </div>
                            <div className="!p-6">
                                {loading && <p className="text-gray-600">Đang tải...</p>}
                                {error && <p className="text-red-500">{error}</p>}
                                {playlists.length === 0 && !loading && (
                                    <div className="text-center !py-10">
                                        <i className="fa-solid fa-list-ul text-red-500 text-5xl !mb-4"></i>
                                        <p className="text-gray-600 text-lg">
                                            Chưa có danh sách nào. Tạo danh sách mới trong trang chi tiết phim!
                                        </p>
                                        <button
                                            onClick={() => navigate("/")}
                                            className="!mt-4 !px-6 !py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        >
                                            Khám phá phim
                                        </button>
                                    </div>
                                )}
                                {playlists.map((playlist) => (
                                    <div key={playlist.id} className="!mb-8">
                                        <div className="flex items-center justify-between !mb-4">
                                            <h3 className="text-lg font-semibold">{playlist.name}</h3>
                                            <button
                                                onClick={() => handleDeletePlaylist(playlist.id)}
                                                disabled={loading}
                                                className="!px-3 !py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                Xóa Playlist
                                            </button>
                                        </div>
                                        {playlist.movies && playlist.movies.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {playlist.movies.map((item) => {
                                                    const key = `${item.movieId}-${item.type}`;
                                                    const movie = movieDetails[key] || {};
                                                    return (
                                                        <div
                                                            key={key}
                                                            className="group relative flex flex-col items-center"
                                                        >
                                                            {movie.poster ? (
                                                                <img
                                                                    src={movie.poster}
                                                                    alt={movie.title}
                                                                    className="w-full h-60 object-cover rounded-md transition-all duration-300 group-hover:shadow-xl"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-60 bg-gray-700 flex items-center justify-center rounded-md">
                                                                    Không có ảnh
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveFromPlaylist(playlist.id, item)
                                                                    }
                                                                    disabled={loading}
                                                                    className="!px-3 !py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed cursor-pointer"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                            <div className="!mt-3 text-center">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                                    {movie.title || "Đang tải..."}
                                                                </p>
                                                                <p className="text-xs text-gray-500 !mt-1">
                                                                    {movie.year || "N/A"} • {movie.type || "Phim"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-600">Danh sách này chưa có phim.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab Xem tiếp */}
                    {activeTab === "history" && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="!p-6 border-b border-gray-200">
                                <h1 className="text-xl font-semibold !mb-2">Xem Tiếp</h1>
                                <p className="text-gray-600">Danh sách phim bạn đang xem dở</p>
                            </div>
                            <div className="!p-6">
                                <p className="text-gray-600 text-center">
                                    Chưa có phim nào trong danh sách xem tiếp.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default User;