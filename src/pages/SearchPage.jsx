import React, { useEffect, useState } from 'react';
import { useLocation, NavLink, useSearchParams } from 'react-router-dom';
import { getAllMovies } from '../service/api';

const SearchPage = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const moviesPerPage = 20; // Số phim mỗi trang

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setSearchResults([]);
                setTotalPages(1);
                setTotalResults(0);
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const movieData = await getAllMovies();
                // Lọc phim theo query
                const filteredMovies = movieData.filter((movie) =>
                    movie.title.toLowerCase().includes(query.toLowerCase())
                );
                // Chuẩn hóa dữ liệu
                const formattedMovies = filteredMovies.map((movie) => ({
                    id: movie.movieId,
                    title: movie.title,
                    poster_path: movie.imageUrl ? `${import.meta.env.VITE_CDN_URL}/${movie.imageUrl}` : "https://via.placeholder.com/300x450?text=No+Image",

                }));
                // Tính tổng số kết quả và trang
                setTotalResults(formattedMovies.length);
                setTotalPages(Math.ceil(formattedMovies.length / moviesPerPage) || 1);
                // Lấy phim cho trang hiện tại
                const startIndex = (page - 1) * moviesPerPage;
                const endIndex = startIndex + moviesPerPage;
                setSearchResults(formattedMovies.slice(startIndex, endIndex));
            } catch (error) {
                console.error('Lỗi khi tải kết quả tìm kiếm:', error);
                setError('Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams({ query, page: newPage.toString() });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPagination = () => {
        const maxPagesToShow = 5;
        const pages = [];
        const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`!px-4 !py-2 rounded ${page === i
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
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`!px-4 !py-2 rounded bg-gray-700 text-white ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
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

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="!px-4 !py-2 text-white">...</span>}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="!px-4 !py-2 rounded bg-gray-700 text-white hover:bg-red-500 cursor-pointer"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`!px-4 !py-2 rounded bg-gray-700 text-white ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 cursor-pointer'
                        }`}
                >
                    Trang sau
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen !pb-2 !pt-24 !px-4 sm:px-6 md:px-8 bg-[#141414] text-white font-lexend">
            <h1 className="text-2xl font-bold !mb-6">
                Kết quả tìm kiếm cho: <span className="text-red-500">"{query}"</span>
            </h1>

            {error ? (
                <p className="text-white/80 text-base !mt-4">{error}</p>
            ) : loading ? (
                <div className="text-center text-lg text-white/80 animate-pulse">Đang tải...</div>
            ) : searchResults.length > 0 ? (
                <>
                    <p className="text-white/80 text-sm !mb-4">
                        Hiển thị {searchResults.length} trong {totalResults} kết quả
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:!grid-cols-4 lg:grid-cols-5 gap-4">
                        {searchResults.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden transition-transform duration-300"
                            >
                                <NavLink to={`/movie/${item.id}`}>
                                    <div className="relative">
                                        
                                        <img
                                            src={item.poster_path}
                                            alt={item.title}
                                            className="w-full h-auto object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="!p-2 text-center">
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-red-500 transition duration-300">
                                            {item.title}
                                        </h3>
                                    </div>
                                </NavLink>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && renderPagination()}
                </>
            ) : (
                <p className="text-white/80 text-base !mt-4">
                    Không tìm thấy kết quả nào cho "<span className="text-red-500">{query}"</span>".
                </p>
            )}
        </div>
    );
};

export default SearchPage;