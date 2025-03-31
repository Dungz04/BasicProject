import React, { useEffect, useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import tmdbApi from '../service/tmdbApi';

const SearchPage = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    // Lấy query parameter từ URL
    const query = new URLSearchParams(location.search).get('query');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;

            setLoading(true);
            try {
                const response = await tmdbApi.searchContent(query);
                setSearchResults(response.results || []);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    return (
        <div className="search-page" style={{ padding: '80px 20px' }}>
            <h1>Kết quả tìm kiếm cho: "{query}"</h1>
            {loading ? (
                <p>Đang tải...</p>
            ) : searchResults.length > 0 ? (
                <div className="search-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {searchResults.map((movie) => (
                        <div key={movie.id} className="movie-item">
                            <NavLink to={`/phim/${movie.id}`}>
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                    alt={movie.title}
                                    style={{ width: '100%', borderRadius: '8px' }}
                                />
                                <h3 style={{ color: 'white', fontSize: '1rem', marginTop: '8px' }}>{movie.title}</h3>
                            </NavLink>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Không tìm thấy kết quả nào cho "{query}".</p>
            )}
        </div>
    );
};

export default SearchPage;