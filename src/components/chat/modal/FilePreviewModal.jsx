import React from 'react';
import './filePreviewModal.css'; // Add appropriate styling

const FilePreviewModal = ({ fileType, fileUrl, onClose }) => {
    return (
        <div className="file-preview-modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                {fileType === 'image' && <img src={fileUrl} alt="Preview" />}
                {fileType === 'video' && <video controls src={fileUrl} />}
                {fileType !== 'image' && fileType !== 'video' && <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open Document</a>}
            </div>
        </div>
    );
};

export default FilePreviewModal;
