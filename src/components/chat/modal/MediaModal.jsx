import React from 'react';
import './mediaModal.css';

const MediaModal = ({ onClose, onFileSelect }) => {
    const handleFileSelect = (e, fileType) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file, fileType);
        }
        onClose();
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" >
                    <img src="./closered.png" alt="" onClick={onClose} />
                </span>
                <h4>Upload File</h4>
                <div className="upload-options">
                    <label htmlFor="document-upload">
                        <img src="./document.gif" alt="document" />
                        <input type="file" id="document-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'document')} />
                        <small>Document</small>
                    </label>
                    <label htmlFor="foto-upload">
                        <img src="./img.png" alt="image" />
                        <input type="file" id="foto-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'image')} />
                        <small>Image</small>
                    </label>
                    <label htmlFor="video-upload">
                        <img src="./video.png" alt="video" />
                        <input type="file" id="video-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'video')} />
                        <small>Video</small>
                    </label>
                    <label htmlFor="audio-upload">
                        <img src="./audio.png" alt="audio" />
                        <input type="file" id="audio-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'audio')} />
                        <small>Audio</small>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default MediaModal;