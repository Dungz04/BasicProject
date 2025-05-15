import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import tmdbApi from '../service/tmdbApi';

const NewMovies = () => {
    const [movies, setMovies] = useState([]);
    const [moviePage, setMoviePage] = useState(1);
    const [movieTotalPages, setMovieTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewMovies = async () => {
            setLoading(true);
            try {
                const movieData = await tmdbApi.getUpcomingMovies(moviePage, "VN");
                setMovies(movieData.results || []);
                setMovieTotalPages(Math.min(movieData.total_pages || 1, 500)); // Giới hạn 500 trang theo TMDB
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchNewMovies();
    }, [moviePage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= movieTotalPages) {
            setMoviePage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
        }
    };

    const renderPagination = () => {
        const maxPagesToShow = 5;
        const pages = [];
        const startPage = Math.max(1, moviePage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(movieTotalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`!px-4 !py-2 rounded ${
                        moviePage === i
                            ? 'bg-red-500 text-white cursor-pointer'
                            : 'bg-gray-700 text-white hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex justify-center !mt-8 gap-2">
                <button
                    onClick={() => handlePageChange(moviePage - 1)}
                    disabled={moviePage === 1}
                    className={`!px-4 !py-2 rounded bg-gray-700 text-white ${
                        moviePage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    Trang trước
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="!px-4 !py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="!px-4 !py-2 text-white">...</span>}
                    </>
                )}

                {pages}

                {endPage < movieTotalPages && (
                    <>
                        {endPage < movieTotalPages - 1 && <span className="!px-4 !py-2 text-white">...</span>}
                        <button
                            onClick={() => handlePageChange(movieTotalPages)}
                            className="!px-4 !py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            {movieTotalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(moviePage + 1)}
                    disabled={moviePage === movieTotalPages}
                    className={`!px-4 !py-2 rounded bg-gray-700 text-white ${
                        moviePage === movieTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    Trang sau
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen !pb-2 !pt-24 !px-4 sm:px-6 md:px-8 bg-[#141414] text-white">
            <h1 className="text-2xl font-bold !mb-6">Phim Mới Sắp Ra Mắt</h1>

            {error ? (
                <p className="text-white/80 text-base !mt-4">{error}</p>
            ) : loading ? (
                <div className="text-center text-lg text-white/80 animate-pulse">Đang tải...</div>
            ) : movies.length > 0 ? (
                <>
                    <p className="text-white/80 text-sm !mb-4">
                        Hiển thị {movies.length} phim mới
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:!grid-cols-4 lg:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                            >
                                <NavLink to={`/phim/${movie.id}?type=movie`}>
                                    <div className="relative">
                                        <img
                                            src={
                                                movie.poster_path
                                                    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                                                    : "https://via.placeholder.com/300x450?text=No+Image"
                                            }
                                            alt={movie.title}
                                            className="w-full h-auto object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="p-2 text-center">
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-red-500 transition duration-300">
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs text-white/80 mt-1">
                                            Phát hành: {movie.release_date || "Chưa có thông tin"}
                                        </p>
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>

                    {movieTotalPages > 1 && renderPagination()}
                </>
            ) : (
                <p className="text-white/80 text-base !mt-4">
                    Không tìm thấy phim mới nào.
                </p>
            )}
        </div>
    );
};

export default NewMovies;