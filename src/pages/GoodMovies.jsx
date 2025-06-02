
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAllMovies } from '../service/api';

const GoodMovies = () => {
    const [movies, setMovies] = useState([]);
    const [moviePage, setMoviePage] = useState(1);
    const [movieTotalPages, setMovieTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const moviesPerPage = 20; // Số phim mỗi trang

    // Hàm để lấy danh sách phim lẻ có rating > 6.5
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const movieData = await getAllMovies();
                // Lọc phim có rating > 6.5
                const highRatedMovies = movieData.filter(movie => movie.rating > 6.5);
                // Chuẩn hóa dữ liệu
                const formattedMovies = highRatedMovies.map(movie => ({
                    id: movie.movieId,
                    title: movie.title,
                    poster_path: movie.imageUrl ? `${import.meta.env.VITE_CDN_URL}/${movie.imageUrl}` : "https://via.placeholder.com/300x450?text=No+Image",
                    vote_average: movie.rating || 0,
                }));
                // Tính tổng số trang
                const totalPages = Math.ceil(formattedMovies.length / moviesPerPage);
                setMovieTotalPages(totalPages || 1);
                // Lấy phim cho trang hiện tại
                const startIndex = (moviePage - 1) * moviesPerPage;
                const endIndex = startIndex + moviesPerPage;
                setMovies(formattedMovies.slice(startIndex, endIndex));
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách phim');
                setLoading(false);
            }
        };
        fetchMovies();
    }, [moviePage]);

    // Hàm để xử lý thay đổi trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= movieTotalPages) {
            setMoviePage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Hàm để render phân trang
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
                    className={`px-4 py-2 rounded ${
                        moviePage === i
                            ? 'bg-red-500 text-white cursor-pointer'
                            : 'bg-gray-700 text-white hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Nếu có trang trước trang đầu tiên, hiển thị nút "1" và dấu "..."
        return (
            <div className="flex justify-center mt-8 gap-2">
                <button
                    onClick={() => handlePageChange(moviePage - 1)}
                    disabled={moviePage === 1}
                    className={`px-4 py-2 rounded bg-gray-700 text-white ${
                        moviePage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    Trang trước
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-4 py-2 text-white">...</span>}
                    </>
                )}

                {pages}

                {endPage < movieTotalPages && (
                    <>
                        {endPage < movieTotalPages - 1 && <span className="px-4 py-2 text-white">...</span>}
                        <button
                            onClick={() => handlePageChange(movieTotalPages)}
                            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            {movieTotalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(moviePage + 1)}
                    disabled={moviePage === movieTotalPages}
                    className={`px-4 py-2 rounded bg-gray-700 text-white ${
                        moviePage === movieTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                    }`}
                >
                    Trang sau
                </button>
            </div>
        );
    };

    // Hiển thị giao diện
    return (
        <div className="min-h-screen !pb-2 !pt-24 !px-4 sm:px-6 md:px-8 bg-[#141414] text-white font-lexend">
            <h1 className="text-2xl font-bold !mb-6">Phim Hay</h1>

            {error ? (
                <p className="text-white/80 text-base !mt-4">{error}</p>
            ) : loading ? (
                <div className="text-center text-lg text-white/80 animate-pulse">Đang tải...</div>
            ) : movies.length > 0 ? (
                <>
                    <p className="text-white/80 text-sm !mb-4">
                        Phim hay bạn sẽ thích
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden transition-transform duration-300"
                            >
                                <NavLink to={`/movie/${movie.id}`}>
                                    <div className="relative">
                                        <img
                                            src={movie.poster_path}
                                            alt={movie.title}
                                            className="w-full h-auto object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="!p-2 text-center">
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-red-500 transition duration-300">
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs text-white/80 !mt-1">
                                            TMDb: {movie.vote_average.toFixed(1)}
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
                    Không tìm thấy phim lẻ nào có rating trên 6.5.
                </p>
            )}
        </div>
    );
};

export default GoodMovies;
