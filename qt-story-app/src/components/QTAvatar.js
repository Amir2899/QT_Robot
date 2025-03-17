import React from 'react';
import './QTAvatar.css';

const QTAvatar = ({ speaking, emotion }) => {
  const getImagePath = () => {
    if (speaking) {
      return "/qt_robot_talking.jpeg";
    }
    return "/qt_robot_idle.jpeg";
  };

  return (
    <div className="qt-avatar-container">
      <div className={`qt-avatar ${speaking ? 'speaking' : ''} ${emotion}`}>
        <img 
          src={getImagePath()} 
          alt="QT Robot" 
          className="qt-avatar-image"
        />
      </div>
      <div className="qt-avatar-status">
        <div className="emotion-indicator">
          {emotion === 'happy' && '😊 Je suis content !'}
          {emotion === 'surprised' && '😲 Je suis surpris !'}
          {emotion === 'idle' && '😌 Je suis calme'}
        </div>
        {speaking && (
          <div className="speaking-indicator">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QTAvatar;
