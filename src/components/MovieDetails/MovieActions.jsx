import React, { useState, useEffect } from "react";
import { auth, db } from "../../service/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const MovieActions = ({ movieId, type }) => {
    const [user] = useAuthState(auth);
    const [isFavorite, setIsFavorite] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const watchUrl = type === "tv" 
        ? `/xem-phim/${movieId}/season/1/episode/1?type=tv`
        : `/xem-phim/${movieId}?type=movie`;

    useEffect(() => {
        if (!user) {
            setIsFavorite(false);
            setPlaylists([]);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const favorites = userData.favorites || [];
                    setIsFavorite(favorites.some((item) => item.movieId === movieId && item.type === type));
                    setPlaylists(userData.playlists || []);
                }
            } catch (err) {
                console.error("Lỗi lấy dữ liệu người dùng:", err);
                setError("Không thể tải dữ liệu người dùng.");
            }
        };

        fetchUserData();
    }, [user, movieId, type]);

    const handleToggleFavorite = async () => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm vào yêu thích!");
            return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const movieData = { movieId, type };

        // Đổi trạng thái ngay lập tức
        const previousState = isFavorite;
        setIsFavorite(!previousState);

        try {
            if (previousState) {
                await updateDoc(userDocRef, { favorites: arrayRemove(movieData) });
            } else {
                await updateDoc(userDocRef, { favorites: arrayUnion(movieData) });
            }
        } catch (err) {
            console.error("Lỗi cập nhật yêu thích:", err);
            setError("Không thể cập nhật danh sách yêu thích.");
            // Nếu lỗi thì rollback lại trạng thái ban đầu
            setIsFavorite(previousState);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm vào playlist!");
            return;
        }

        setLoading(true);
        setError(null);
        const userDocRef = doc(db, "users", user.uid);
        const movieData = { movieId, type };

        try {
            const updatedPlaylists = playlists.map((playlist) =>
                playlist.id === playlistId
                    ? { ...playlist, movies: [...(playlist.movies || []), movieData] }
                    : playlist
            );
            await updateDoc(userDocRef, { playlists: updatedPlaylists });
            setPlaylists(updatedPlaylists);
            setShowDropdown(false);
        } catch (err) {
            console.error("Lỗi thêm vào playlist:", err);
            setError("Không thể thêm vào playlist.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!user) {
            alert("Vui lòng đăng nhập để tạo playlist!");
            return;
        }

        if (!newPlaylistName.trim()) {
            setError("Tên playlist không được để trống.");
            return;
        }

        setLoading(true);
        setError(null);
        const userDocRef = doc(db, "users", user.uid);
        const newPlaylist = {
            id: Date.now().toString(),
            name: newPlaylistName,
            movies: [{ movieId, type }],
        };

        try {
            await updateDoc(userDocRef, { playlists: arrayUnion(newPlaylist) });
            setPlaylists([...playlists, newPlaylist]);
            setNewPlaylistName("");
            setShowDropdown(false);
        } catch (err) {
            console.error("Lỗi tạo playlist:", err);
            setError("Không thể tạo playlist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-start !p-4 rounded-lg gap-4 flex-wrap !mt-4">
            <div className="flex items-center gap-4 flex-grow flex-wrap">
                <a
                    href={watchUrl}
                    className="flex items-center justify-center gap-2 text-base font-bold text-black bg-gradient-to-r from-[#ff3333] to-[#aa0000] !py-3 !px-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,51,51,0.7),0_0_25px_rgba(255,51,51,0.5)] min-h-[3rem] !ml-3.5"
                >
                    <i className="fa-solid fa-play text-black group-hover:text-white" />
                    <span>Xem Ngay</span>
                </a>

                <div className="flex items-center gap-6 justify-start">
                    {/* Nút yêu thích */}
                    <div className="min-w-[4rem] !p-2 rounded-lg">
                        <div
                            className="flex flex-col items-center justify-center gap-1 text-sm transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] rounded !p-2 cursor-pointer"
                            onClick={handleToggleFavorite}
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
                    <div className="relative min-w-[4rem] !p-2 rounded-lg">
                        <div
                            className="flex flex-col items-center justify-center gap-1 text-white text-sm transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] rounded !p-2 cursor-pointer"
                            onClick={() => setShowDropdown(!showDropdown)}
                            disabled={loading}
                        >
                            <div className="w-5 h-5 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100" fill="none">
                                    <path
                                        d="M89.7273 41.6365H58.3635V10.2727C58.3635 6.81018 55.5534 4 52.0908 4H47.9092C44.4466 4 41.6365 6.81018 41.6365 10.2727V41.6365H10.2727C6.81018 41.6365 4 44.4466 4 47.9092V52.0908C4 55.5534 6.81018 58.3635 10.2727 58.3635H41.6365V89.7273C41.6365 93.1898 44.4466 96 47.9092 96H52.0908C55.5534 96 58.3635 93.1898 58.3635 89.7273V58.3635H89.7273C93.1898 58.3635 96 55.5534 96 52.0908V47.9092C96 44.4466 93.1898 41.6365 89.7273 41.6365Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <span className="text-white text-xs">Thêm vào</span>
                        </div>

                        {/* Dropdown playlist */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 bg-[#222] rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.3)] min-w-[220px] z-[1000] py-2">
                                {playlists.length > 0 ? (
                                    playlists.map((playlist) => (
                                        <div
                                            key={playlist.id}
                                            className="!px-4 !py-2 text-white cursor-pointer hover:bg-[#333] transition-colors"
                                            onClick={() => handleAddToPlaylist(playlist.id)}
                                        >
                                            {playlist.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="!px-4 !py-2 text-gray-500 cursor-not-allowed">
                                        Chưa có playlist
                                    </div>
                                )}
                                <div className="h-px bg-[#444] !my-2"></div>
                                <div className="flex items-center gap-2 !px-4 !py-2">
                                    <input
                                        type="text"
                                        placeholder="Tên playlist mới"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        disabled={loading}
                                        className="flex-1 bg-[#333] border-none text-white !py-1.5 !px-2 rounded-md text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCreatePlaylist}
                                        disabled={loading || !newPlaylistName.trim()}
                                        className="bg-[#e50914] text-white border-none !py-1.5 !px-3 rounded-md text-sm disabled:bg-[#666] disabled:cursor-not-allowed"
                                    >
                                        Tạo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="text-[#e50914] text-sm !mt-2">{error}</div>}
        </div>
    );
};

export default MovieActions;
