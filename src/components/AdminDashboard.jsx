import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authApi from '../service/authApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [backdropFiles, setBackdropFiles] = useState([]);
  const [trailerFiles, setTrailerFiles] = useState([]);
  const [movieDTOText, setMovieDTOText] = useState('');
  const [uploadResponseJson, setUploadResponseJson] = useState('');

  const [uploadStatus, setUploadStatus] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);
  
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const fileTypesConfig = [
    { type: 'image', label: 'Images (jpg, png, gif)', accept: 'image/jpeg,image/png,image/gif', files: imageFiles, setFiles: setImageFiles },
    { type: 'video', label: 'Videos (mp4, avi, mkv)', accept: 'video/mp4,video/avi,video/x-matroska', files: videoFiles, setFiles: setVideoFiles },
    { type: 'backdrop', label: 'Backdrops (jpg, png)', accept: 'image/jpeg,image/png', files: backdropFiles, setFiles: setBackdropFiles },
    { type: 'trailer', label: 'Trailers (mp4)', accept: 'video/mp4', files: trailerFiles, setFiles: setTrailerFiles },
  ];

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

  const handleConfirmUpload = async () => {
    setUploadStatus('Uploading...');
    setOverallProgress(0);
    setUploadResponseJson('');

    const formData = new FormData();
    let fileAttached = false;

    fileTypesConfig.forEach(config => {
      config.files.forEach(fileObject => {
        formData.append(config.type, fileObject.file);
        fileAttached = true;
      });
    });

    if (movieDTOText.trim() !== '') {
      const dtoBlob = new Blob([movieDTOText.trim()], { type: 'application/json' });
      const dtoFile = new File([dtoBlob], "movieDTO.json", { type: 'application/json' });
      formData.append('movieDTO', dtoFile);
      fileAttached = true; 
    }

    if (!fileAttached) {
      setUploadStatus('No files or DTO text selected for upload.');
      return;
    }

    try {
      const accessToken = authApi.getAccessToken();
      if (!accessToken) {
        setUploadStatus('Error: Not authenticated. Please log in.');
        return;
      }

      console.log('Uploading files...');

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setOverallProgress(percentCompleted);
          }
        }
      });

      console.log('Upload response:', response.data);

      setUploadStatus(`Success ! \n${response.data || 'All items uploaded successfully.'}`);
      setUploadResponseJson(JSON.stringify(response.data.data, null, 2));
      fileTypesConfig.forEach(config => config.setFiles([]));
      setMovieDTOText('');
      setOverallProgress(100);

    } catch (error) {
      console.error('Upload error:', error.response ? error.response.data : error.message);
      let errorMessage = 'Error uploading items. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      setUploadStatus(errorMessage);
      setUploadResponseJson(JSON.stringify(error.response ? error.response.data : { error: error.message }, null, 2));
      setOverallProgress(0);
    }
  };

  const filesExistInQueues = fileTypesConfig.some(config => config.files.length > 0);
  const dtoTextExists = movieDTOText.trim() !== '';
  const showConfirmButton = true; // FOR DEBUGGING: ALWAYS SHOW

  return (
    <div className="admin-dashboard">
      <h2>Admin Asset Upload</h2>
      <div className="upload-sections-container">
        {fileTypesConfig.map(({ type, label, accept, files }) => (
          <div key={type} className="upload-section form-group">
            <h3>{label}</h3>
            <div className="file-input-custom-container">
              <input
                type="file"
                multiple
                accept={accept}
                id={`${type}-upload`}
                onChange={(e) => handleFileChange(e, type)}
                className="file-input-hidden"
              />
              <label htmlFor={`${type}-upload`} className="file-drop-zone-label">
                <span className="file-drop-zone-main-text">
                  <span className="file-drop-zone-action-text">Choose {label.split('(')[0].trim()}</span> or drop them here
                </span>
                <span className="file-drop-zone-meta-text">Supports multiple files. Accepted: {accept}</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="queued-files-list">
                <h4>Queued {type}s:</h4>
                <ul>
                  {files.map((fileObj) => (
                    <li key={fileObj.id}>
                      <span>{fileObj.file.name} ({(fileObj.file.size / 1024).toFixed(2)} KB)</span>
                      <button onClick={() => handleRemoveFile(fileObj.id, type)} className="remove-file-btn">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <div className="upload-section form-group">
          <h3>Movie DTO (JSON text)</h3>
          <textarea
            value={movieDTOText}
            onChange={(e) => setMovieDTOText(e.target.value)}
            placeholder="Paste your Movie DTO JSON here..."
            rows={10}
            className="dto-textarea"
          />
        </div>
      </div>

      {showConfirmButton && (
        <div className="confirm-upload-section">
          <button onClick={handleConfirmUpload} className="confirm-upload-btn" disabled={uploadStatus === 'Uploading...'}>
            {uploadStatus === 'Uploading...' ? `Uploading... ${overallProgress}%` : 'Confirm All Uploads'}
          </button>
          {uploadStatus && uploadStatus !== 'Uploading...' && (
            <p className={`upload-status ${uploadStatus.startsWith('Error') ? 'error' : 'success'}`}>
              {uploadStatus}
            </p>
          )}
          {uploadStatus === 'Uploading...' && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${overallProgress}%` }}>
                {overallProgress}%
              </div>
            </div>
          )}
        </div>
      )}

      {uploadResponseJson && (
        <div className="upload-section form-group" style={{ marginTop: '20px' }}>
          <h3>Server Response:</h3>
          <textarea
            readOnly
            value={uploadResponseJson}
            rows={15}
            className="dto-textarea response-json-area" 
            style={{ backgroundColor: '#222', color: uploadStatus.startsWith('Error') ? '#ff7b7b' : '#a7ffa7' }}
          />
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;