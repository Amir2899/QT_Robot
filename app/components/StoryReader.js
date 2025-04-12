"use client";

import React, { useState, useRef, useEffect } from 'react';
import QTAvatar from './QTAvatar';
import StoryList from './StoryList';
import './StoryReader.css';

const StoryReader = () => {
  const [currentStory, setCurrentStory] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [emotion, setEmotion] = useState("raconte");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [lastEmotionChangeTime, setLastEmotionChangeTime] = useState(0);
  const [isEmotionSequence, setIsEmotionSequence] = useState(false);
  const videoRef = useRef(null);
  const [synth, setSynth] = useState(null);
  const MIN_EMOTION_DURATION = 3000; // Durée minimale d'une émotion en millisecondes
  const QUICK_EMOTION_DURATION = 800; // Durée pour les séquences rapides

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const emotionalWords = {
    joie: [
      "joyeux", "content", "heureux", "rire", "sourire", "amusant", "joie", "rigolo", "fête", 
      "amusé", "s'amuser", "plein d'énergie", "débordait d'idées", "léger", "sifflotait",
      "cœur léger", "plein d'énergie", "s'amusait", "riait", "jouait", "dansait", "chantait",
      "fier", "super copain", "félicita", "acceptées", "câlin", "cœurs plein les yeux",
      "à table", "macarons sont prêts", "parfait", "réussir"
    ],
    surprise: [
      "surpris", "étonné", "wow", "incroyable", "soudain", "extraordinaire", "surprise", 
      "stupéfait", "bouche bée", "inattendu", "tout à coup", "brusquement", "soudain",
      "qui arrive", "mais", "ah", "oh", "tiens", "regardant"
    ],
    colere: [
      "colère", "énervé", "furieux", "rage", "fâché", "agacé", "explosa", "hurla", 
      "moutarde lui monter", "tapa du pied", "coups de patte", "gronda", "rugit",
      "tempêta", "s'emporta", "bouillonnait", "fulminait", "exaspéré", "moquez-vous",
      "grommelant", "donnant des coups", "idiots", "bêtise", "excédé", "contrariait"
    ],
    tristesse: [
      "triste", "seul", "malheureux", "déçu", "peine", "chagrin", "cœur lourd",
      "abattu", "découragé", "mélancolique", "déprimé", "morose", "cafardeux",
      "comme un escargot", "larme", "renifla", "ne m'aimera plus jamais", "pardon"
    ],
    emotif: [
      "émotif", "sensible", "touché", "ému", "sentiment", "calme", "paisible",
      "tranquille", "serein", "apaisé", "détendu", "normal", "habituel",
      "respire calmement", "doucement", "patient", "yoga", "contrôler"
    ],
    pleur: [
      "pleurer", "larme", "sanglot", "pleure", "pleurant", "renifla",
      "yeux mouillés", "larmes aux yeux", "larmoyant", "sangloter",
      "roula sur sa joue"
    ],
    mecontent: [
      "mécontent", "insatisfait", "contrarié", "bougon", "grognon", "renfrognait",
      "ronchon", "grincheux", "de mauvaise humeur", "maugréait", "râlait",
      "s'en alla", "je m'en fiche", "n'aurais pas dû", "jaloux",
    ],
    farceur: [
      "farce", "blague", "faisait des blagues", "taquin", "malicieux", "espiègle", "coquin", "sifflotait",
      "joueur", "plaisantin", "farceur", "rieur", "moqueur", "amuseur",
      "rigolo", "éclata de rire", "n'y tenant plus"
    ],
    etonne: [
      "étonné", "stupéfait", "ébahi", "bouche bée", "ahuri", "pourquoi",
      "impressionné", "médusé", "abasourdi", "sidéré", "estomaqué",
      "ouh là là", "mais"
    ],
    degouter: [
      "dégoûté", "beurk", "répugné", "écœuré", "répugnant",
      "nauséeux", "écoeurant", "repoussant", "immonde",
      "n'aime pas"
    ],
    anxiete: [
      "anxieux", "inquiet", "stressé", "angoissé", "nerveux", "tendu", "peur",
      "paniqua", "gorge se serra", "tremblant", "terrifié", "effrayé", "apeuré",
      "tremblait", "frissonnait", "craignait", "redoutait", "tout honteux",
      "n'ose pas", "si", "et si", "pas sûr"
    ],
    clindoeil: [
      "clin d'œil", "malicieux", "complice", "coquin", "malin",
      "rusé", "astucieux", "futé", "finaud",
      "souriant", "regardant"
    ],
    crie: [
      "crie", "hurle", "s'écrie", "vocifère", "s'exclame fort",
      "à tue-tête", "à plein poumons", "à pleins poumons",
      "voix forte", "voix puissante", "cria", "hurla fort",
      "rugit", "beugla", "vociféra", "brailla"
    ]
  };

  const detectEmotionSequence = (text) => {
    // Détecter les phrases qui décrivent une séquence d'émotions rapides
    const sequencePatterns = [
      /changeait d'humeur/i,
      /émotions? rapides?/i,
      /Joyeux.*fâché.*triste.*excité/i,
    ];

    return sequencePatterns.some(pattern => pattern.test(text));
  };

  const handleEmotionSequence = async (emotions, utterance) => {
    const emotionList = ["joie", "colere", "tristesse", "surprise"];
    let currentIndex = 0;
    let sequenceTimeout;

    const changeEmotion = () => {
      if (currentIndex < emotionList.length) {
        setEmotion(emotionList[currentIndex]);
        currentIndex++;
        sequenceTimeout = setTimeout(changeEmotion, QUICK_EMOTION_DURATION);
      } else {
        setIsEmotionSequence(false);
        setEmotion("emotif");
      }
    };

    // Nettoyer les timeouts précédents si ils existent
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
    }

    setIsEmotionSequence(true);
    // Démarrer immédiatement la première émotion
    setEmotion(emotionList[0]);
    currentIndex = 1;
    sequenceTimeout = setTimeout(changeEmotion, QUICK_EMOTION_DURATION);

    // Nettoyer le timeout si le composant est démonté
    return () => {
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  };

  const detectEmotionInPhrase = (text) => {
    // Si on détecte une séquence d'émotions
    if (detectEmotionSequence(text)) {
      setLastEmotionChangeTime(Date.now() - MIN_EMOTION_DURATION); // Forcer le changement immédiat
      return "sequence";
    }

    let maxScore = 0;
    let detectedEmotion = "emotif";
    let emotions = {};

    // Analyse le texte pour chaque émotion
    for (const [emotion, words] of Object.entries(emotionalWords)) {
      const score = words.reduce((count, word) => {
        const regex = new RegExp(word.toLowerCase(), 'g');
        const matches = text.toLowerCase().match(regex);
        return count + (matches ? matches.length * 1.5 : 0); // Augmentation du poids des mots-clés
      }, 0);

      emotions[emotion] = score;
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }

    // Règles spéciales pour le contexte
    if (text.includes("!")) maxScore += 1;
    if (text.includes("?")) maxScore += 0.5;
    if (text.includes("...")) maxScore += 0.5;

    // Vérifier si assez de temps s'est écoulé depuis le dernier changement d'émotion
    const currentTime = Date.now();
    if (!isEmotionSequence && currentTime - lastEmotionChangeTime < MIN_EMOTION_DURATION) {
      return emotion;
    }

    // Si le score est trop faible, on garde l'émotion précédente
    if (maxScore < 1) {
      return emotion;
    }

    console.log(`Texte analysé: "${text}"`);
    console.log(`Émotion détectée: ${detectedEmotion} (score: ${maxScore})`);
    setLastEmotionChangeTime(currentTime);
    return detectedEmotion;
  };

  const handleStopReading = () => {
    if (synth) {
      synth.cancel();
      setSpeaking(false);
      setEmotion("emotif");
      setCurrentSentenceIndex(0);
    }
  };

  const handleReadStory = (story) => {
    if (!synth) return;
    
    handleStopReading();
    setCurrentStory(story);
    setSpeaking(true);
    setEmotion("raconte");
    setCurrentSentenceIndex(0);
    setLastEmotionChangeTime(Date.now());
    setIsEmotionSequence(false);

    // Diviser l'histoire en phrases plus longues pour les émotions
    const sentences = story.text
      .split(/([.!?]+)/)
      .reduce((acc, current, i, arr) => {
        if (i % 2 === 0) {
          const sentence = current + (arr[i + 1] || "");
          // Ne divise que les très longues phrases
          if (sentence.length > 150) {
            return acc.concat(sentence.split(/[,;]/).map(s => s.trim() + ','));
          }
          return acc.concat(sentence);
        }
        return acc;
      }, [])
      .filter(sentence => sentence.trim().length > 0);

    console.log("Phrases détectées:", sentences);

    // Créer un utterance pour chaque phrase
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = "fr-FR";
      utterance.rate = 0.80; // Ralentir un peu plus la lecture pour une meilleure synchronisation
      utterance.pitch = 1.1;

      // Analyser le contexte plus large
      const previousSentence = sentences[index - 1] || "";
      const nextSentence = sentences[index + 1] || "";
      const contextText = previousSentence + " " + sentence + " " + nextSentence;
      
      const currentEmotion = detectEmotionInPhrase(contextText);

      utterance.onstart = () => {
        setCurrentSentenceIndex(index);
        
        if (currentEmotion === "sequence") {
          // Démarrer immédiatement la séquence
          handleEmotionSequence(["joie", "colere", "tristesse", "surprise"], utterance);
        } else {
          const currentTime = Date.now();
          if (currentTime - lastEmotionChangeTime >= MIN_EMOTION_DURATION) {
            setEmotion(currentEmotion);
          }
        }
        
        console.log(`Lecture de la phrase ${index + 1}/${sentences.length}: "${sentence}"`);
        console.log(`Émotion actuelle: ${currentEmotion}`);
      };

      utterance.onend = () => {
        if (index === sentences.length - 1) {
          setSpeaking(false);
          setEmotion("emotif");
          setCurrentSentenceIndex(0);
          setIsEmotionSequence(false);
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

