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
                        <img src="./document.png" alt="document" />
                        <input type="file" id="document-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'document')} />
                        <small>Document</small>
                    </label>
                    <label htmlFor="foto-upload">
                        <img src="./image.png" alt="image" />
                        <input type="file" id="foto-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'image')} />
                        <small>Image</small>
                    </label>
                    <label htmlFor="video-upload">
                        <img src="./video.png" alt="video" />
                        <input type="file" id="video-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'video')} />
                        <small>Video</small>
                    </label>
                    <label htmlFor="audio-upload">
                        <img src="./music.png" alt="audio" />
                        <input type="file" id="audio-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'audio')} />
                        <small>Audio</small>
                    </label>
                    <label htmlFor="encrypted-upload">
                        <img src="./zip.png" alt="encrypted" />
                        <input type="file" id="encrypted-upload" style={{ display: "none" }} onChange={(e) => handleFileSelect(e, 'encrypted')} />
                        <small>File Encrypted</small>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default MediaModal;
