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
    emotif: 'qt_emotif.mp4',
    pleur: 'qt_pleur.mp4',
    mecontent: 'qt_mecontent.mp4',
    farceur: 'qt_farceur.mp4',
    etonne: 'qt_etonne.mp4',
    degouter: 'qt_degouter.mp4',
    anxiete: 'qt_anxiete.mp4',
    clindoeil: 'qt_clindoeil.mp4',
    crie: 'qt_crie.mp4',
    raconte: 'qt_raconte.mp4'
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
      colere: '😠 Je suis en colère !',
      tristesse: '😢 Je suis triste',
      surprise: '😲 Je suis surpris !',
      emotif: '🎭 Je suis émotif !',
      pleur: '😭 Je pleure',
      mecontent: '😤 Je suis mécontent',
      farceur: '😏 Je suis farceur',
      etonne: '😯 Je suis étonné',
      degouter: '🤢 Je suis dégoûté',
      anxiete: '😰 Je suis anxieux',
      clindoeil: '😉 Je fais un clin d\'œil',
      crie: '📢 Je crie !',
      raconte: '📖 Je raconte une histoire'
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
