import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authApi from '../service/authApi';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaPlus, FaTimes, FaSave, FaFilm } from 'react-icons/fa';
import './EditMovie.styles.css';

const EditMovie = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [movie, setMovie] = useState({
    title: '',
    overviewString: '',
    releaseYear: '',
    status: 'RELEASED',
    imageUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    genres: '',
    movieCast: [], 
    director: '',
    studio: '',
    country: '',
    duration: 0,
    rating: 0
  });

  const [newActor, setNewActor] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }

    const fetchMovie = async () => {  
      try {
        setLoading(true);
        const accessToken = authApi.getAccessToken();
        if (!accessToken) {
          throw new Error('Bạn cần đăng nhập để truy cập trang này');
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/movies/get/${movieId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        console.log('Fetched movie data:', response.data);
        
        const movieData = response.data;
        setMovie({
          title: movieData.title || '',
          overviewString: movieData.overviewString || '',
          releaseYear: movieData.releaseYear || '',
          status: movieData.status || 'RELEASED',
          imageUrl: movieData.imageUrl || '',
          backdropUrl: movieData.backdropUrl || '',
          trailerUrl: movieData.trailerUrl || '',
          genres: movieData.genres || '',
          movieCast: Array.isArray(movieData.movieCast) ? movieData.movieCast : [],
          director: movieData.director || '',
          studio: movieData.studio || '',
          country: movieData.country || '',
          duration: movieData.duration || 0,
          rating: movieData.rating || 0
        });
      } catch (error) {
        console.error('Error fetching movie:', error);
        toast.error('Không thể tải thông tin phim');
        navigate('/admin/movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý đặc biệt cho các trường số
    if (name === 'releaseYear' || name === 'duration') {
      const numValue = value === '' ? '' : parseInt(value, 10);
      setMovie({
        ...movie,
        [name]: numValue
      });
    } else if (name === 'rating') {
      const numValue = value === '' ? '' : parseFloat(value);
      setMovie({
        ...movie,
        [name]: numValue
      });
    } else {
      setMovie({
        ...movie,
        [name]: value
      });
    }
  };
  
  const handleGenresChange = (e) => {
    const genresString = e.target.value;
    setMovie({
      ...movie,
      genres: genresString
    });
  };

  const handleAddActor = () => {
    if (newActor.trim()) {
      // Kiểm tra nếu diễn viên đã tồn tại trong danh sách
      const actorExists = movie.movieCast.some(actor => actor === newActor.trim());
      
      if (!actorExists) {
        setMovie({
          ...movie,
          movieCast: [...movie.movieCast, newActor.trim()]
        });
        setNewActor('');
      }
    }
  };

  const handleRemoveActor = (index) => {
    const newMovieCast = [...movie.movieCast];
    newMovieCast.splice(index, 1);
    setMovie({
      ...movie,
      movieCast: newMovieCast
    });
  };

  // Tạo DTO từ dữ liệu phim theo định nghĩa backend
  const createMovieDTO = () => {
    return {
      movieId: parseInt(movieId, 10),
      title: movie.title || '',
      rating: movie.rating ? parseFloat(movie.rating) : 0,
      overviewString: movie.overviewString || '',
      genres: movie.genres || '',
      status: movie.status || 'RELEASED',
      studio: movie.studio || '',
      director: movie.director || '',
      movieCast: Array.isArray(movie.movieCast) ? movie.movieCast : [],
      releaseYear: movie.releaseYear ? parseInt(movie.releaseYear, 10) : null,
      duration: movie.duration ? parseInt(movie.duration, 10) : 0,
      imageUrl: movie.imageUrl || '',
      videoUrl: movie.videoUrl || '',
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl || '',
      country: movie.country || ''
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setUploadProgress(10);
      const accessToken = authApi.getAccessToken();
      
      if (!accessToken) {
        throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
      }

      const movieDTO = createMovieDTO();
      console.log('Sending movie DTO:', movieDTO);
      
      const movieDTOString = JSON.stringify(movieDTO);
      
      setUploadProgress(30);

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/movies/update`, movieDTOString, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(30 + percentCompleted * 0.7); 
        }
      });
      
      setUploadProgress(100);
      toast.success('Cập nhật phim thành công!');
      setTimeout(() => navigate('/admin/movies'), 1000);
    } catch (error) {
      console.error('Error updating movie:', error);
      toast.error(error.response?.data?.error || 'Không thể cập nhật phim');
      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="flex items-center justify-between mb-4">
        <h2>Chỉnh sửa phim</h2>
        <button 
          onClick={() => navigate('/admin/movies')} 
          className="btn btn-secondary"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại
        </button>
      </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {uploadProgress > 0 && (
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                <div className="progress-text">{Math.round(uploadProgress)}%</div>
              </div>
            )}
            
            <div className="upload-sections-container">
              <div className="upload-section form-group">
                <h3>Thông tin cơ bản</h3>
                
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    name="title"
                    value={movie.title}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Năm phát hành</label>
                  <input
                    type="number"
                    name="releaseYear"
                    value={movie.releaseYear}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={movie.status}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="RELEASED">Phát hành</option>
                    <option value="UPCOMING">Sắp ra mắt</option>
                    <option value="CANCELLED">Hủy</option>
                    <option value="ONGOING">Đang chiếu</option>
                    
                  </select>
                </div>
              </div>
              
              <div className="upload-section form-group">
                <h3>Hình ảnh & Media</h3>
                
                <div className="form-group">
                  <label>URL Poster</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={movie.imageUrl}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nhập URL hình ảnh poster"
                  />
                  {movie.imageUrl && (
                    <div className="image-preview">
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${movie.imageUrl}&nameTag=poster`} 
                        alt="Poster Preview" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>URL Backdrop</label>
                  <input
                    type="text"
                    name="backdropUrl"
                    value={movie.backdropUrl}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nhập URL hình ảnh backdrop"
                  />
                  {movie.backdropUrl && (
                    <div className="image-preview backdrop">
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}/assets/get_assets_web?linkAssets=${movie.backdropUrl}&nameTag=backdrop`} 
                        alt="Backdrop Preview" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/800x450?text=No+Backdrop';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>URL Trailer</label>
                  <input
                    type="text"
                    name="trailerUrl"
                    value={movie.trailerUrl}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Nhập URL trailer"
                  />
                </div>
              </div>
              
              {/* Nội dung & Thể loại */}
              <div className="upload-section form-group">
                <h3>Nội dung & Thể loại</h3>
                
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="overviewString"
                    value={movie.overviewString}
                    onChange={handleChange}
                    rows="4"
                    className="form-control"
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label>Thể loại</label>
                  <input
                    type="text"
                    name="genres"
                    value={movie.genres}
                    onChange={handleGenresChange}
                    placeholder="Hành động, Phiêu lưu, ..."
                    className="form-control"
                  />
                </div>
              </div>
              
              {/* Thông tin sản xuất */}
              <div className="upload-section form-group">
                <h3>Thông tin sản xuất</h3>
                
                <div className="form-group">
                  <label>Diễn viên</label>
                  <div className="actor-input-container">
                    <input
                      type="text"
                      value={newActor}
                      onChange={(e) => setNewActor(e.target.value)}
                      placeholder="Thêm diễn viên"
                      className="form-control"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddActor}
                      className="btn btn-primary"
                    >
                      <FaPlus className="mr-1" /> Thêm
                    </button>
                  </div>
                  <div className="actors-list">
                    {movie.movieCast.map((actor, index) => (
                      <div key={index} className="actor-tag">
                        {actor}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveActor(index)}
                          className="actor-remove-btn"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Đạo diễn</label>
                  <input
                    type="text"
                    name="director"
                    value={movie.director}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Hãng phim</label>
                  <input
                    type="text"
                    name="studio"
                    value={movie.studio}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    value={movie.country}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>Thời lượng (phút)</label>
                    <input
                      type="number"
                      name="duration"
                      value={movie.duration}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label>Đánh giá (0-10)</label>
                    <input
                      type="number"
                      name="rating"
                      value={movie.rating}
                      onChange={handleChange}
                      min="0"
                      max="10"
                      step="0.1"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/admin/movies')}
                className="btn btn-secondary"
                disabled={saving}
              >
                <FaTimes className="mr-2" />
                Hủy
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner-small"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
  );
};

export default EditMovie;
