import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../service/authApi';
import { useAuth } from '../context/AuthContext';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }

    const fetchMovies = async () => {
      try {
        const accessToken = authApi.getAccessToken();
        if (!accessToken) {
          throw new Error('Bạn cần đăng nhập để truy cập trang này');
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/all`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        console.log('Movie data:', response.data);
        // Log the first movie to see its structure
        if (response.data && response.data.length > 0) {
          console.log('First movie structure:', response.data[0]);
          console.log('Image URL for first movie:', response.data[0].imageUrl);
        }
        setMovies(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
        setLoading(false);
        toast.error(error.response?.data?.message || 'Không thể tải danh sách phim');
      }
    };

    fetchMovies();
  }, [isAdmin, navigate]);


  const handleDeleteMovie = async (movieId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      return;
    }

    try {
      const accessToken = authApi.getAccessToken();
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/movies/delete/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setMovies(movies.filter(movie => movie.movieId !== movieId));
      toast.success('Xóa phim thành công!');
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error(error.response?.error || 'Không thể xóa phim');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="admin-movie-management p-4">
      <h2 className="text-2xl font-bold mb-6">Quản lý phim</h2>
      
      {movies.length === 0 ? (
        <p className="text-center py-5">Không có phim nào trong cơ sở dữ liệu.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.movieId} 
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate(`/admin/edit-movie/${movie.movieId}`)}
            >
              <div className="relative group">
                <div className="h-64 w-full">
                  {movie.imageUrl ? (
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${movie.imageUrl}&nameTag=poster`}
                      alt={movie.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      Không có ảnh
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 flex items-center justify-center transition-all duration-300">
                  <div 
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking delete
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMovie(movie.movieId);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                    >
                      <i className="fas fa-trash-alt mr-1"></i> Xóa
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="text-white font-semibold truncate">{movie.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-400 mt-1">
                  <span>{movie.year || 'N/A'}</span>
                  <span>{movie.type === 'MOVIE' ? 'Phim lẻ' : 'Phim bộ'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieManagement;
