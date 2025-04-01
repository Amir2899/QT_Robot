"use client";

import React, { useState, useRef, useEffect } from 'react';
import QTAvatar from './QTAvatar';
import StoryList from './StoryList';
import './StoryReader.css';

const StoryReader = () => {
  const [currentStory, setCurrentStory] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [emotion, setEmotion] = useState("emotif");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const videoRef = useRef(null);
  const synth = window.speechSynthesis;

  const emotionalWords = {
    joie: ["joyeux", "content", "heureux", "rire", "sourire", "amusant", "joie"],
    surprise: ["surpris", "étonné", "wow", "incroyable", "soudain", "extraordinaire", "surprise"],
    colere: ["colère", "énervé", "furieux", "rage", "fâché", "agacé"],
    tristesse: ["triste", "seul", "malheureux", "déçu", "peine", "chagrin"],
    emotif: ["émotif", "sensible", "touché", "ému", "sentiment"]
  };

  const detectEmotionInPhrase = (text) => {
    let maxScore = 0;
    let detectedEmotion = "emotif";

    for (const [emotion, words] of Object.entries(emotionalWords)) {
      const score = words.reduce((count, word) => {
        return count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }

    console.log(`Texte analysé: "${text}"`);
    console.log(`Émotion détectée: ${detectedEmotion}`);
    return detectedEmotion;
  };

  const handleStopReading = () => {
    synth.cancel();
    setSpeaking(false);
    setEmotion("emotif");
    setCurrentSentenceIndex(0);
  };

  const handleReadStory = (story) => {
    handleStopReading();
    setCurrentStory(story);
    setSpeaking(true);
    setEmotion("emotif");
    setCurrentSentenceIndex(0);

    // Diviser l'histoire en phrases
    const sentences = story.text
      .split(/([.!?]+)/)
      .reduce((acc, current, i, arr) => {
        if (i % 2 === 0) {
          return acc.concat(current + (arr[i + 1] || ""));
        }
        return acc;
      }, [])
      .filter(sentence => sentence.trim().length > 0);

    console.log("Phrases détectées:", sentences);

    // Créer un utterance pour chaque phrase
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      utterance.onstart = () => {
        setCurrentSentenceIndex(index);
        const emotion = detectEmotionInPhrase(sentence);
        setEmotion(emotion);
        console.log(`Lecture de la phrase ${index + 1}/${sentences.length}: "${sentence}"`);
      };

      utterance.onend = () => {
        if (index === sentences.length - 1) {
          setSpeaking(false);
          setEmotion("emotif");
          setCurrentSentenceIndex(0);
        }
      };

      synth.speak(utterance);
    });
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
          
          {currentStory && (
            <div className="story-text-container">
              <h3>{currentStory.title}</h3>
              <p>{currentStory.text}</p>
              {speaking && (
                <div className="reading-progress">
                  Phrase en cours: {currentSentenceIndex + 1}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryReader;

