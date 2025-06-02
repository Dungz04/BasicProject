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
    <div className="!p-5 bg-[#2c2c2c] rounded-lg !m-10 text-[#f0f0f0] max-w-[900px] !mx-auto">
      <h2 className="text-5xl text-[#e50914] !mb-6 border-b-2 border-[#444] !pb-2.5 text-center">Admin Asset Upload</h2>
      <div className="flex flex-col gap-7.5">
        {fileTypesConfig.map(({ type, label, accept, files }) => (
          <div key={type} className="flex flex-col gap-2.5 !p-5 border border-[#555] rounded-[10px] bg-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            <h3 className="!mb-2 text-[#e0e0e0] text-[1.1em]">{label}</h3>
            <div className="relative w-full !mb-[15px]">
              <input
                type="file"
                multiple
                accept={accept}
                id={`${type}-upload`}
                onChange={(e) => handleFileChange(e, type)}
                className="hidden"
              />
              <label htmlFor={`${type}-upload`} className="flex flex-col items-center justify-center w-full !p-[30px] border-2 border-dashed border-[#555] rounded-[5px] bg-[#3a3a3a] text-[#ccc] cursor-pointer transition-[background-color,border-color] duration-200 text-center hover:bg-[#424242] hover:border-[#61dafb] focus-within:bg-[#424242] focus-within:border-[#61dafb] focus-within:border-solid">
                <span className="text-[1.1em] !mb-2">
                  <span className="text-[#e50914] font-bold">Choose {label.split('(')[0].trim()}</span> or drop them here
                </span>
                <span className="text-[0.9em] text-[#aaa]">Supports multiple files. Accepted: {accept}</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="!mt-[15px] !p-2.5 bg-[#383838] rounded-[5px]">
                <h4 className="m-0 !mb-2.5 text-[#e0e0e0] text-[1em]">Queued {type}s:</h4>
                <ul className="list-none p-0 m-0">
                  {files.map((fileObj) => (
                    <li key={fileObj.id} className="flex justify-between items-center !p-2 !mb-1.5 bg-[#404040] rounded-[4px] text-[0.95em] border-b border-[#4a4a4a] last:border-b-0">
                      <span>{fileObj.file.name} ({(fileObj.file.size / 1024).toFixed(2)} KB)</span>
                      <button onClick={() => handleRemoveFile(fileObj.id, type)} className="bg-[#e74c3c] text-white border-none !py-1.5 !px-2.5 rounded-[3px] cursor-pointer text-[0.85em] hover:bg-[#c0392b] transition-[background-color] duration-200">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2.5 !p-5 border border-[#555] rounded-[10px] bg-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <h3 className="!mb-2 text-[#e0e0e0] text-[1.1em]">Movie DTO (JSON text)</h3>
          <textarea
            value={movieDTOText}
            onChange={(e) => setMovieDTOText(e.target.value)}
            placeholder="Paste your Movie DTO JSON here..."
            rows={10}
            className="w-full !p-2.5 bg-[#252525] border border-[#555] rounded-[4px] text-[#e0e0e0] font-mono text-[0.95em] min-h-[150px] box-border resize-y focus:border-[#61dafb] focus:outline-none focus:shadow-[0_0_0_2px_rgba(97,218,251,0.3)]"
          />
        </div>
      </div>

      {showConfirmButton && (
        <div className="!mt-7.5 text-center text-black font-bold !p-5 min-h-[70px]">
          <button
            onClick={handleConfirmUpload}
            className="bg-[#e50914] text-white border-none !py-3 !px-6 text-[1.1em] font-bold rounded-[5px] cursor-pointer hover:-translate-y-0.5 transition-[background-color,transform] duration-200 disabled:bg-[#555] disabled:cursor-not-allowed disabled:transform-none"
            disabled={uploadStatus === 'Uploading...'}
          >
            {uploadStatus === 'Uploading...' ? `Uploading... ${overallProgress}%` : 'Confirm All Uploads'}
          </button>
          {uploadStatus && uploadStatus !== 'Uploading...' && (
            <p className={`!mt-[15px] !p-2.5 text-[1em] rounded-[4px] ${uploadStatus.startsWith('Error') ? 'bg-[#c0392b] text-white' : 'bg-gray-600 text-white'}`}>
              {uploadStatus}
            </p>
          )}
          {uploadStatus === 'Uploading...' && (
            <div className="w-full bg-[#444] rounded-[4px] mt-[10px] overflow-hidden">
              <div
                className="h-5 bg-[#e50914] text-center leading-5 text-[#222] transition-[width] duration-300 rounded-[4px]"
                style={{ width: `${overallProgress}%` }}
              >
                {overallProgress}%
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

export default AdminDashboard;