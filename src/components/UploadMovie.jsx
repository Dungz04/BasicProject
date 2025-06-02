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
    <div className="!p-5 bg-[#2c2c2c] rounded-lg !m-10 text-[rgb(240,240,240)] max-w-[900px] !mx-auto">
      <h2 className="text-[#e50914] text-5xl !mb-6 border-b-2 border-[#444] !pb-2.5 text-center">Upload Movie DTO Only</h2>
      <div className="flex flex-col gap-2.5 !p-5 border border-[#555] rounded-[10px] bg-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        <h3 className="!mb-2 text-[#e0e0e0] text-[1.1em]">Movie DTO (JSON text)</h3>
        <textarea
          value={movieDTOText}
          onChange={(e) => {
            setMovieDTOText(e.target.value);
            setUploadStatus('');
            setUploadResponseJson('');
          }}
          placeholder="Paste your Movie DTO JSON here..."
          rows={20}
          className="w-full !p-2.5 bg-[#252525] border border-[#555] rounded-[4px] text-[#e0e0e0] font-mono text-[0.95em] min-h-[150px] box-border resize-y focus:border-[#e50914] focus:outline-none focus:shadow-[0_0_0_2px_rgba(97,218,251,0.3)]"
        />
      </div>

      {showConfirmButton && (
        <div className="!mt-7.5 text-center text-black font-bold !p-5 min-h-[70px]">
          <button
            onClick={handleConfirmMovieUpload}
            className="bg-[#e50914] text-white border-none !py-3 !px-6 text-[1.1em] font-bold rounded-[5px] cursor-pointer  hover:-translate-y-0.5 transition-[background-color,transform] duration-200 disabled:bg-[#555] disabled:cursor-not-allowed disabled:transform-none"
            disabled={uploadStatus.startsWith('Uploading...')}
          >
            {uploadStatus.startsWith('Uploading...') ? `Uploading... ${uploadProgress}%` : 'Confirm DTO Upload'}
          </button>
          {uploadStatus && !uploadStatus.startsWith('Uploading...') && (
            <p className={`mt-[15px] !p-2.5 text-[1em] rounded-[4px] ${uploadStatus.startsWith('Error') ? 'bg-[#c0392b] text-white' : 'bg-[#27ae60] text-white'}`}>
              {uploadStatus}
            </p>
          )}
          {uploadStatus.startsWith('Uploading...') && (
            <div className="w-full bg-[#444] rounded-[4px] mt-[10px] overflow-hidden">
              <div
                className="h-5 bg-[#61dafb] text-center leading-5 text-[#222] transition-[width] duration-300 rounded-[4px]"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}
        </div>
      )}

      {uploadResponseJson && (
        <div className="mt-5 flex flex-col gap-2.5 p-5 border border-[#555] rounded-[10px] bg-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <h3 className="mb-2 text-[#e0e0e0] text-[1.1em]">Server Response:</h3>
          <textarea
            readOnly
            value={uploadResponseJson}
            rows={15}
            className="w-full p-2.5 bg-[#222] border border-[#555] rounded-[4px] text-[0.95em] font-mono min-h-[150px] box-border resize-y"
            style={{ color: uploadStatus.startsWith('Error') ? '#ff7b7b' : '#a7ffa7' }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadMovieDTO;