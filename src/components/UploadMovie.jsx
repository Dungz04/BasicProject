import React, { useState } from 'react';
import axios from 'axios';
import authApi from '../service/authApi';

const UploadMovieDTO = () => { 
  const [movieDTOText, setMovieDTOText] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [uploadResponseJson, setUploadResponseJson] = useState('');

  const handleConfirmMovieUpload = async () => {
    if (movieDTOText.trim() === '') {
      setUploadStatus('Please enter DTO information.');
      setUploadResponseJson('');
      return;
    }

    setUploadStatus('Uploading DTO...');
    setUploadProgress(0);
    setUploadResponseJson('');

    const formData = new FormData(); 

    const dtoBlob = new Blob([movieDTOText.trim()], { type: 'application/json' });
    const dtoFile = new File([dtoBlob], "movieDTO.json", { type: 'application/json' });
    formData.append('movieDTO', dtoFile); 

    try {
      const accessToken = authApi.getAccessToken();
      if (!accessToken) {
        setUploadStatus('Error: Not authenticated. Please log in.');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/movies/add-movie`, formData, { 
        headers: {
          'Content-Type': 'multipart/form-data', 
          'Authorization': `Bearer ${accessToken}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      setUploadStatus(`Success! ${response.data.message || 'DTO uploaded successfully.'}`);
      setUploadResponseJson(JSON.stringify(response.data, null, 2));
      setUploadProgress(100);

    } catch (error) {
      console.error('DTO upload error:', error.response ? error.response.data : error.message);
      let errorMessage = 'Error uploading DTO. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      setUploadStatus(errorMessage);
      setUploadResponseJson(JSON.stringify(error.response ? error.response.data : { error: error.message }, null, 2));
      setUploadProgress(0);
    }
  };

  const showConfirmButton = true; 

  return (
    <div className="admin-upload-movie admin-dashboard"> 
      <h2>Upload Movie DTO Only</h2>

      <div className="upload-section form-group">
        <h3>Movie DTO (JSON text)</h3>
        <textarea
          value={movieDTOText}
          onChange={(e) => {
            setMovieDTOText(e.target.value);
            setUploadStatus(''); 
            setUploadResponseJson(''); 
          }}
          placeholder="Paste your Movie DTO JSON here..."
          rows={20} 
          className="dto-textarea"
        />
      </div>

      {showConfirmButton && (
        <div className="confirm-upload-section">
          <button onClick={handleConfirmMovieUpload} className="confirm-upload-btn" disabled={uploadStatus.startsWith('Uploading...')}>
            {uploadStatus.startsWith('Uploading...') ? `Uploading... ${uploadProgress}%` : 'Confirm DTO Upload'}
          </button>
          {uploadStatus && !uploadStatus.startsWith('Uploading...') && (
            <p className={`upload-status ${uploadStatus.startsWith('Error') ? 'error' : 'success'}`}>
              {uploadStatus}
            </p>
          )}
          {uploadStatus.startsWith('Uploading...') && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                {uploadProgress}%
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

export default UploadMovieDTO;
