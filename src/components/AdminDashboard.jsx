import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authApi from '../service/authApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaTimes, FaSave, FaFilm, FaUpload, FaImage, FaVideo } from 'react-icons/fa';
import './EditMovie.styles.css';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newActor, setNewActor] = useState('');
  const [uploadResponseJson, setUploadResponseJson] = useState('');
  
  // File upload states
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [backdropFiles, setBackdropFiles] = useState([]);
  const [trailerFiles, setTrailerFiles] = useState([]);
  
  // Movie data state
  const [movie, setMovie] = useState({
    title: '',
    overviewString: '',
    releaseYear: '',
    status: 'RELEASED',
    genres: '',
    movieCast: [], 
    director: '',
    studio: '',
    country: '',
    duration: 0,
    rating: 0
  });
  
  // File types configuration
  const fileTypesConfig = [
    { type: 'image', label: 'Hình ảnh (jpg, png, gif)', accept: 'image/jpeg,image/png,image/gif', files: imageFiles, setFiles: setImageFiles, icon: <FaImage /> },
    { type: 'video', label: 'Video (mp4, avi, mkv)', accept: 'video/mp4,video/avi,video/x-matroska', files: videoFiles, setFiles: setVideoFiles, icon: <FaVideo /> },
    { type: 'backdrop', label: 'Backdrop (jpg, png)', accept: 'image/jpeg,image/png', files: backdropFiles, setFiles: setBackdropFiles, icon: <FaImage /> },
    { type: 'trailer', label: 'Trailer (mp4)', accept: 'video/mp4', files: trailerFiles, setFiles: setTrailerFiles, icon: <FaVideo /> },
  ];
  
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
  }, [isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
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
      // Check if actor already exists in the list
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
  
  // File handling functions
  const handleFileChange = (event, fileType) => {
    const config = fileTypesConfig.find(ft => ft.type === fileType);
    if (config) {
      const newFiles = Array.from(event.target.files).map(file => ({ file, id: Date.now() + Math.random() }));
      config.setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
    event.target.value = null;
  };

  const handleRemoveFile = (fileId, fileType) => {
    const config = fileTypesConfig.find(ft => ft.type === fileType);
    if (config) {
      config.setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    }
  };

  // Create movie DTO from form data
  const createMovieDTO = () => {
    return {
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
      const formData = new FormData();
      
      // Create a blob from the JSON string and add it to the form data
      const dtoBlob = new Blob([movieDTOString], { type: 'application/json' });
      const dtoFile = new File([dtoBlob], "movieDTO.json", { type: 'application/json' });
      formData.append('movieDTO', dtoFile);
      
      // Add all files to the form data
      let fileAttached = false;
      fileTypesConfig.forEach(config => {
        config.files.forEach(fileObject => {
          formData.append(config.type, fileObject.file);
          fileAttached = true;
        });
      });
      
      setUploadProgress(30);

      // Send the form data to the server
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(30 + percentCompleted * 0.7);
          }
        }
      });
      
      console.log('Upload response:', response.data);
      setUploadResponseJson(JSON.stringify(response.data.data, null, 2));
      
      setUploadProgress(100);
      toast.success('Thêm phim mới thành công!');
      
      // Reset form after successful submission
      setMovie({
        title: '',
        overviewString: '',
        releaseYear: '',
        status: 'RELEASED',
        genres: '',
        movieCast: [], 
        director: '',
        studio: '',
        country: '',
        duration: 0,
        rating: 0
      });
      
      // Clear file uploads
      fileTypesConfig.forEach(config => config.setFiles([]));
      
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error(error.response?.data?.error || 'Không thể thêm phim mới');
      setUploadProgress(0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="flex items-center justify-between mb-4">
        <h2>Thêm phim mới</h2>
        <button 
          onClick={() => navigate('/admin/movies')} 
          className="btn btn-secondary"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại
        </button>
      </div>
      
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
          
          {/* File Upload Sections */}
          <div className="upload-section form-group">
            <h3>Tải lên tập tin</h3>
            
            {fileTypesConfig.map(({ type, label, accept, files, icon }) => (
              <div key={type} className="form-group">
                <label>{label}</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    multiple
                    accept={accept}
                    id={`${type}-upload`}
                    onChange={(e) => handleFileChange(e, type)}
                    className="hidden-file-input"
                  />
                  <label htmlFor={`${type}-upload`} className="file-upload-label">
                    {icon} Chọn {label.split('(')[0].trim()}
                  </label>
                  <span className="file-count">{files.length} tập tin được chọn</span>
                </div>
                
                {files.length > 0 && (
                  <div className="file-list">
                    {files.map((fileObj) => (
                      <div key={fileObj.id} className="file-item">
                        <span className="file-name">{fileObj.file.name}</span>
                        <span className="file-size">({(fileObj.file.size / 1024).toFixed(2)} KB)</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile(fileObj.id, type)}
                          className="file-remove-btn"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
                Lưu phim mới
              </>
            )}
          </button>
        </div>
        
        {uploadResponseJson && (
          <div className="response-json-container">
            <h3 className="response-json-title">Server Response:</h3>
            <textarea
              readOnly
              value={uploadResponseJson}
              rows={15}
              className="response-json-textarea"
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminDashboard;