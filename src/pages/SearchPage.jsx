import React, { useEffect, useState } from 'react';
import { useLocation, NavLink, useSearchParams } from 'react-router-dom';
import tmdbApi from '../service/tmdbApi';

const SearchPage = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

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
                const response = await tmdbApi.searchContent(query, 'multi', page);
                setSearchResults(response.results || []);
                setTotalPages(Math.min(response.total_pages || 1, 500)); // Giới hạn 500 trang theo TMDB
                setTotalResults(response.total_results || 0);
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
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
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
        <div className="min-h-screen !pb-2 !pt-24 !px-4 sm:px-6 md:px-8 bg-[#141414] text-white">
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
                                className="bg-[#1f1f1f] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                            >
                                <NavLink to={`/phim/${item.id}?type=${item.media_type}`}>
                                    <div className="relative">
                                        {(item.media_type === 'movie' || item.media_type === 'tv') && (
                                            <span
                                                className="absolute text-xs font-semibold !px-2 !py-1 rounded bg-red-500 text-white shadow-md"
                                            >
                                                {item.media_type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                                            </span>
                                        )}
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                            alt={item.title || item.name}
                                            className="w-full h-auto object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="p-2 text-center">
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-red-500 transition duration-300">
                                            {item.title || item.name}
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
                    Không tìm thấy kết quả nào cho "<span className="text-red-500">{query}</span>".
                </p>
            )}
        </div>
    );
};

export default SearchPage;