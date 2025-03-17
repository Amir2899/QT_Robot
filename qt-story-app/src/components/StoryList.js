import React from 'react';
import './StoryList.css';

const stories = [
  {
    id: 1,
    title: "L'Aventure Émotionnelle",
    text: "Un jour, un petit robot était très content de découvrir un nouveau monde. Soudain, il fut surpris par un papillon magnifique. Le robot, joyeux, suivit le papillon dans les airs. C'était vraiment incroyable !",
    videoUrl: "/videos/aventure_emotionnelle.mp4",
    icon: "🦋"
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
