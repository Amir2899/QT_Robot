import React, { useState, useRef } from 'react';
import QTAvatar from './QTAvatar';
import StoryList from './StoryList';
import './StoryReader.css';

const StoryReader = () => {
  const [currentStory, setCurrentStory] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [emotion, setEmotion] = useState("idle");
  const videoRef = useRef(null);
  const synth = window.speechSynthesis;

  const emotionalWords = {
    happy: ["joyeux", "content", "heureux", "rire", "sourire", "amusant"],
    surprised: ["surpris", "étonné", "wow", "incroyable", "soudain", "extraordinaire"],
    idle: ["normal", "calme", "tranquille"]
  };

  const detectEmotionInPhrase = (text) => {
    for (const [emotion, words] of Object.entries(emotionalWords)) {
      if (words.some(word => text.toLowerCase().includes(word))) {
        return emotion;
      }
    }
    return "idle";
  };

  const handleStopReading = () => {
    synth.cancel();
    setSpeaking(false);
    setEmotion("idle");
  };

  const handleReadStory = (story) => {
    // Arrêter la lecture précédente si elle existe
    handleStopReading();

    setCurrentStory(story);
    setSpeaking(true);
    setEmotion("idle");

    if (story.videoUrl) {
      if (videoRef.current) {
        videoRef.current.src = story.videoUrl;
        videoRef.current.play();
      }
    } else {
      // Diviser le texte en phrases pour la détection d'émotion
      const sentences = story.text.split(/[.!?]+/).filter(Boolean);
      let currentIndex = 0;

      const utterance = new SpeechSynthesisUtterance(story.text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      // Détecter les émotions pendant la lecture
      utterance.onboundary = (event) => {
        if (event.name === 'sentence') {
          const currentSentence = sentences[currentIndex];
          const detectedEmotion = detectEmotionInPhrase(currentSentence);
          setEmotion(detectedEmotion);
          currentIndex = (currentIndex + 1) % sentences.length;
        }
      };

      utterance.onend = () => {
        setSpeaking(false);
        setEmotion("idle");
      };

      synth.speak(utterance);
    }
  };

  return (
    <div className="story-reader-container">
      <div className="story-reader-header">
        <h1>QT Robot Raconte des Histoires</h1>
        <p>Découvrez des histoires magiques racontées par votre ami robot !</p>
      </div>

      <div className="story-reader-main">
        <div className="story-reader-avatar">
          <QTAvatar speaking={speaking} emotion={emotion} />
          {speaking && (
            <button 
              onClick={handleStopReading}
              className="stop-button"
            >
              Arrêter la lecture
            </button>
          )}
        </div>

        <div className="story-reader-content">
          <h2 className="content-title">Nos Histoires</h2>
          <StoryList onSelectStory={handleReadStory} />
          
          {currentStory && currentStory.videoUrl ? (
            <div className="video-container">
              <h3 className="video-title">{currentStory.title}</h3>
              <video
                ref={videoRef}
                className="story-video"
                controls
                onPlay={() => setSpeaking(true)}
                onPause={() => setSpeaking(false)}
                onEnded={() => {
                  setSpeaking(false);
                  setEmotion("idle");
                }}
              >
                <source src={currentStory.videoUrl} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
          ) : currentStory && (
            <div className="story-text-container">
              <h3>{currentStory.title}</h3>
              <p>{currentStory.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryReader;

