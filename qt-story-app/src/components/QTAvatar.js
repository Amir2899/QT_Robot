"use client";

import React, { useRef, useEffect, useState } from 'react';
import './QTAvatar.css';

const QTAvatar = ({ speaking, emotion }) => {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  // Liste des vidéos disponibles
  const availableVideos = {
    joie: 'qt_joie.mp4',
    colere: 'qt_colere.mp4',
    tristesse: 'qt_tristesse.mp4',
    surprise: 'qt_surprise.mp4',
    emotif: 'qt_émotif.mp4'
  };

  const getVideoPath = () => {
    // Si l'émotion n'a pas de vidéo, utiliser émotif comme fallback
    const videoName = availableVideos[emotion] || availableVideos['emotif'];
    return `/videos/emotions/${videoName}`;
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Lecture de la vidéo pour l'émotion ${emotion} démarrée avec succès`);
            setVideoError(false);
          })
          .catch(error => {
            console.error(`Erreur de lecture de la vidéo pour l'émotion ${emotion}:`, error);
            setVideoError(true);
          });
      }
    }
  }, [emotion]);

  const handleVideoError = (e) => {
    console.error(`Erreur de chargement de la vidéo pour l'émotion ${emotion}:`, e);
    setVideoError(true);
  };

  const getEmotionText = () => {
    const emotionTexts = {
      joie: '😊 Je suis joyeux !',
      peur: '😨 J\'ai peur...',
      colere: '😠 Je suis en colère !',
      tristesse: '😢 Je suis triste',
      surprise: '😲 Je suis surpris !',
      neutre: '😌 Je suis calme',
      emotif: '🎭 Je suis émotif !'
    };
    return emotionTexts[emotion] || emotionTexts.emotif;
  };

  return (
    <div className="qt-avatar-container">
      <div className={`qt-avatar ${speaking ? 'speaking' : ''} ${emotion}`}>
        {videoError ? (
          <div className="video-error">
            <p>❌ Vidéo non disponible</p>
            <p>Utilisation de la vidéo de secours</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={getVideoPath()}
            className="qt-avatar-video"
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
          />
        )}
      </div>
      <div className="qt-avatar-status">
        <div className="emotion-indicator">
          {getEmotionText()}
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
