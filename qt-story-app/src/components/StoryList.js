"use client";

import React from 'react';
import './StoryList.css';

const stories = [
  {
    id: 1,
    title: "Le Grand Voyage de QT",
    text: "Un jour tranquille, QT se préparait pour une nouvelle aventure. Il était très calme en vérifiant sa liste de voyage. Soudain, un bruit étrange retentit derrière lui ! QT fut surpris et eut un peu peur. Mais en se retournant, il découvrit que c'était son meilleur ami Robot-X qui lui préparait une fête surprise ! QT était tellement joyeux de voir tous ses amis réunis. Malheureusement, Robot-X lui annonça qu'il devait partir pour une longue mission, ce qui rendit QT très triste. Mais sa tristesse se transforma vite en colère quand il apprit que Robot-X partait sans lui dire au revoir ! Heureusement, Robot-X expliqua que c'était une blague et qu'il restait. QT retrouva sa joie et tout le monde fit la fête ensemble !",
    icon: "🤖"
  },
  {
    id: 2,
    title: "La Fête Surprise",
    text: "Le robot se réveilla calme ce matin-là. Mais wow, en ouvrant la porte, il fut étonné de voir tous ses amis !",
    videoUrl: "/videos/fete_surprise.mp4",
    icon: "🎉"
  },
  {
    id: 3,
    title: "Une Journée Spéciale",
    text: "Dans un monde normal, le robot vivait tranquille. Un jour, quelque chose d'incroyable arriva !",
    videoUrl: "/videos/journee_speciale.mp4",
    icon: "✨"
  }
];

const StoryList = ({ onSelectStory }) => {
  return (
    <div className="story-list">
      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => onSelectStory(story)}
          className="story-button"
        >
          <span className="story-icon">{story.icon}</span>
          <span className="story-title">{story.title}</span>
          <span className="story-type-icon">
            {story.videoUrl ? '🎥' : '📖'}
          </span>
        </button>
      ))}
    </div>
  );
};

export default StoryList;
