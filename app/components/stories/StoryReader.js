"use client";

import React, { useState, useRef, useEffect } from 'react';
import QTAvatar from './QTAvatar';
import StoryList from './StoryList';
import './StoryReader.css';

const storyImages = {
  "Le Grand Voyage de QT": "/images/qt-robot.png",
  "La Fête Surprise": "/images/party.png",
  "Une Journée Spéciale": "/images/special-day.png",
  "Le Loup Émotif": "/images/wolf.png"
};

const StoryReader = () => {
  const [currentStory, setCurrentStory] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [emotion, setEmotion] = useState("raconte");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [lastEmotionChangeTime, setLastEmotionChangeTime] = useState(0);
  const [isEmotionSequence, setIsEmotionSequence] = useState(false);
  const [displayedSentences, setDisplayedSentences] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSequence, setImageSequence] = useState([]);
  const videoRef = useRef(null);
  const [synth, setSynth] = useState(null);
  const speechIntervalRef = useRef(null);
  const MIN_EMOTION_DURATION = 3000;
  const QUICK_EMOTION_DURATION = 800;
  const scrollRef = useRef(null);

  // Fonction pour garder la synthèse vocale active
  const keepSpeechAlive = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Solution pour le problème de timeout de Chrome
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      console.log("Synthèse vocale maintenue active");
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const synthInstance = window.speechSynthesis;
      setSynth(synthInstance);
      
      // Vérifier si la synthèse vocale est disponible
      if (synthInstance) {
        console.log("Synthèse vocale initialisée avec succès");
        
        // Réinitialiser la synthèse vocale (parfois nécessaire sur certains navigateurs)
        synthInstance.cancel();
        
        // Vérifier les voix disponibles
        const checkVoices = () => {
          const voices = synthInstance.getVoices();
          console.log("Voix disponibles:", voices.length);
          const frenchVoices = voices.filter(voice => voice.lang.includes('fr'));
          console.log("Voix françaises:", frenchVoices.length);
          
          if (frenchVoices.length > 0) {
            console.log("Voix française sélectionnée:", frenchVoices[0].name);
          }
        };
        
        // Les voix peuvent être chargées de manière asynchrone
        if (synthInstance.onvoiceschanged !== undefined) {
          synthInstance.onvoiceschanged = checkVoices;
        } else {
          // Fallback pour les navigateurs qui ne supportent pas onvoiceschanged
          setTimeout(checkVoices, 200);
        }
      } else {
        console.error("La synthèse vocale n'est pas disponible dans ce navigateur");
      }
    }

    // Nettoyage lors du démontage du composant
    return () => {
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
      }
      if (window.sequenceTimeout) {
        clearTimeout(window.sequenceTimeout);
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Effect pour gérer le maintien de la synthèse vocale active
  useEffect(() => {
    if (speaking && !paused) {
      // Lancer un intervalle pour garder la synthèse vocale active
      speechIntervalRef.current = setInterval(keepSpeechAlive, 5000);
      console.log("Démarrage de l'intervalle de maintien de la synthèse vocale");
    } else {
      // Arrêter l'intervalle si on ne parle plus
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
        speechIntervalRef.current = null;
        console.log("Arrêt de l'intervalle de maintien de la synthèse vocale");
      }
    }

    // Nettoyage
    return () => {
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
        speechIntervalRef.current = null;
      }
    };
  }, [speaking, paused]);

  // Effet pour gérer les changements d'image
  useEffect(() => {
    if (imageSequence.length > 0 && currentImageIndex >= 0 && currentImageIndex < imageSequence.length) {
      const newImage = imageSequence[currentImageIndex];
      console.log("Mise à jour de l'image:", newImage);
      setCurrentImage(newImage);
    }
  }, [currentImageIndex, imageSequence]);

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
      /trop émotif/i,
      /cent à l'heure/i
    ];

    const result = sequencePatterns.some(pattern => pattern.test(text));
    if (result) {
      console.log("Modèle de séquence d'émotions détecté:", text);
    }
    return result;
  };

  const handleEmotionSequence = () => {
    console.log("Démarrage de la séquence d'émotions");
    const emotionList = ["joie", "colere", "tristesse", "surprise"];
    let currentIndex = 0;
    
    // Nettoyer les timeouts précédents
    if (window.sequenceTimeout) {
      clearTimeout(window.sequenceTimeout);
    }

    setIsEmotionSequence(true);
    
    const changeEmotion = () => {
      if (currentIndex < emotionList.length) {
        console.log(`Changement d'émotion dans la séquence: ${emotionList[currentIndex]}`);
        setEmotion(emotionList[currentIndex]);
        currentIndex++;
        window.sequenceTimeout = setTimeout(changeEmotion, QUICK_EMOTION_DURATION);
      } else {
        console.log("Fin de la séquence d'émotions");
        setIsEmotionSequence(false);
        setEmotion("emotif");
      }
    };

    // Démarrer immédiatement la première émotion
    setEmotion(emotionList[0]);
    currentIndex = 1;
    window.sequenceTimeout = setTimeout(changeEmotion, QUICK_EMOTION_DURATION);
  };

  const detectEmotionInPhrase = (text) => {
    // Si on détecte une séquence d'émotions
    if (detectEmotionSequence(text)) {
      console.log("Séquence d'émotions détectée dans: ", text);
      setLastEmotionChangeTime(Date.now() - MIN_EMOTION_DURATION); // Forcer le changement immédiat
      handleEmotionSequence();
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

  const handlePauseResume = () => {
    if (synth) {
      if (paused) {
        synth.resume();
        setSpeaking(true);
        console.log("Lecture reprise");
      } else {
        synth.pause();
        setSpeaking(false);
        console.log("Lecture mise en pause");
      }
      setPaused(!paused);
    }
  };

  const handleStopReading = () => {
    if (synth) {
      synth.cancel();
      setSpeaking(false);
      setPaused(false);
      setEmotion("emotif");
      setCurrentSentenceIndex(0);
      setIsEmotionSequence(false);
      
      // Nettoyer les timeouts de séquence d'émotions
      if (window.sequenceTimeout) {
        clearTimeout(window.sequenceTimeout);
      }
      
      // Arrêter l'intervalle de maintien de la synthèse vocale
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
        speechIntervalRef.current = null;
      }
      
      console.log("Lecture arrêtée");
    }
  };

  const handleReadStory = (story) => {
    if (!synth) {
      console.error("La synthèse vocale n'est pas disponible");
      return;
    }
    
    console.log("Démarrage de la lecture de l'histoire:", story.title);
    
    handleStopReading();
    setCurrentStory(story);
    setSpeaking(true);
    setEmotion("raconte");
    setCurrentSentenceIndex(0);
    setLastEmotionChangeTime(Date.now());
    setIsEmotionSequence(false);
    setDisplayedSentences([]);
    setCurrentProgress(0);

    console.log("Images de l'histoire:", story.images);
    
    // Définir l'image initiale
    const defaultImage = storyImages[story.title];
    const initialImage = defaultImage;
    setCurrentImage(initialImage);
    console.log("Image initiale définie:", initialImage);

    // Séparer le texte en segments (phrases et marqueurs d'image)
    const segments = story.text.split(/(\[CHANGE_IMAGE:[^\]]+\])/);
    console.log("Segments détectés:", segments);
    
    let sentences = [];
    let currentUtterances = [];
    let imageChangeIndices = new Map(); // Utiliser une Map pour stocker les indices et les images
    
    segments.forEach((segment, segmentIndex) => {
      if (segment.startsWith('[CHANGE_IMAGE:')) {
        const imageName = segment.match(/\[CHANGE_IMAGE:([^\]]+)\]/)[1];
        console.log("Marqueur d'image trouvé:", imageName);
        if (story.images && story.images[imageName]) {
          imageChangeIndices.set(sentences.length, story.images[imageName]);
          console.log("Image associée à l'index:", sentences.length, "image:", story.images[imageName]);
        }
      } else if (segment.trim()) {
        // Diviser le segment en phrases
        const phraseSegments = segment.split(/([.!?]+)/).filter(s => s.trim());
        for (let i = 0; i < phraseSegments.length; i += 2) {
          const content = (phraseSegments[i] + (phraseSegments[i + 1] || '')).trim();
          if (content) {
            sentences.push({ type: 'text', content });
          }
        }
      }
    });

    console.log("Indices de changement d'image:", Array.from(imageChangeIndices.entries()));
    setDisplayedSentences(sentences);

    // Créer et enchaîner les utterances
    sentences.forEach((item, index) => {
      const utterance = new SpeechSynthesisUtterance(item.content);
      utterance.lang = "fr-FR";
      utterance.rate = 0.80;
      utterance.pitch = 1.1;
      
      // Sélectionner une voix française si disponible
      const voices = synth.getVoices();
      const frenchVoices = voices.filter(voice => voice.lang.includes('fr'));
      if (frenchVoices.length > 0) {
        utterance.voice = frenchVoices[0];
        console.log("Voix sélectionnée pour la phrase:", frenchVoices[0].name);
      }

      utterance.onstart = () => {
        console.log("Lecture de la phrase:", index, item.content.substring(0, 30) + "...");
        setCurrentSentenceIndex(index);
        setCurrentProgress((index + 1) / sentences.length * 100);

        // Vérifier si nous devons changer d'image à cet index
        if (imageChangeIndices.has(index)) {
          const newImage = imageChangeIndices.get(index);
          console.log("Changement d'image à l'index:", index, "nouvelle image:", newImage);
          setCurrentImage(newImage);
        }

        const previousContent = sentences[index - 1]?.content || '';
        const nextContent = sentences[index + 1]?.content || '';
        const contextText = previousContent + " " + item.content + " " + nextContent;
        
        const currentEmotion = detectEmotionInPhrase(contextText);
        if (currentEmotion === "sequence") {
          console.log("Séquence d'émotions déclenchée pendant la lecture");
          // La séquence est déjà gérée dans detectEmotionInPhrase
        } else if (currentEmotion && currentEmotion !== emotion && !isEmotionSequence) {
          const now = Date.now();
          if (now - lastEmotionChangeTime >= MIN_EMOTION_DURATION) {
            setEmotion(currentEmotion);
            setLastEmotionChangeTime(now);
          }
        }
      };

      utterance.onend = () => {
        if (index === sentences.length - 1) {
          setSpeaking(false);
          setEmotion("emotif");
          setCurrentSentenceIndex(0);
          setIsEmotionSequence(false);
        }
      };

      currentUtterances.push(utterance);
    });

    // Jouer toutes les utterances en séquence
    console.log("Démarrage de la lecture de", currentUtterances.length, "phrases");
    currentUtterances.forEach((utterance, index) => {
      console.log(`Ajout de la phrase ${index+1}/${currentUtterances.length} à la file d'attente`);
      synth.speak(utterance);
    });
    
    // Vérifier l'état de la synthèse vocale
    console.log("État de la synthèse vocale:", 
      synth.speaking ? "En train de parler" : "Silencieux", 
      synth.pending ? "File d'attente active" : "Pas de file d'attente",
      synth.paused ? "En pause" : "Non pausé"
    );
  };

  const handleReturnToStories = () => {
    handleStopReading();
    setCurrentStory(null);
    setDisplayedSentences([]);
    setCurrentProgress(0);
  };

  return (
    <div className="story-reader-container">
      <div className="story-reader-header">
        <h1>QT Robot Raconte des Histoires</h1>
        <p>Découvrez des histoires magiques racontées par votre ami robot !</p>
      </div>

      <div className="story-reader-main">
        {!currentStory ? (
          <div className="story-selection-layout">
            <div className="welcome-avatar">
              <QTAvatar speaking={false} emotion="raconte" />
              <div className="welcome-message">
                <h3>Bonjour ! Je suis QT Robot</h3>
                <p>Je suis ravi de te raconter une histoire ! Choisis celle que tu préfères !</p>
              </div>
            </div>
            <div className="story-selection">
              <h2 className="content-title">Choisis ton histoire préférée</h2>
              <StoryList onSelectStory={handleReadStory} />
            </div>
          </div>
        ) : (
          <div className="story-reading-layout">
            <div className="story-left-column">
              <div className="qt-avatar-container">
                <QTAvatar speaking={speaking} emotion={emotion} />
              </div>
              <div className="story-controls">
                <button 
                  onClick={handleReturnToStories}
                  className="control-button choose-story-button"
                >
                  Choisir une autre histoire
                </button>
                {speaking || paused ? (
                  <>
                    <button 
                      onClick={handlePauseResume}
                      className={`control-button ${paused ? 'play-button' : 'pause-button'}`}
                    >
                      {paused ? 'Reprendre' : 'Pause'}
                    </button>
                    <button 
                      onClick={handleStopReading}
                      className="control-button stop-button"
                    >
                      Arrêter la lecture
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="story-right-column">
              <div className="story-image-container">
                <img 
                  src={currentImage || (currentStory?.images ? Object.values(currentStory.images)[0] : storyImages[currentStory?.title])}
                  alt={`Illustration pour ${currentStory?.title}`}
                  className="story-image"
                  onError={(e) => {
                    console.error("Erreur de chargement de l'image:", e.target.src);
                    e.target.src = storyImages[currentStory?.title] || '';
                  }}
                />
              </div>
              <div className="current-sentence-container">
                <div className="story-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>
                <div className="current-sentence">
                  {displayedSentences[currentSentenceIndex]?.type === 'text' 
                    ? displayedSentences[currentSentenceIndex].content 
                    : ''}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryReader;

