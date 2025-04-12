import React from "react";
import StoryReader from "./components/stories/StoryReader";
import "./styles/App.css";

const App = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-blue-50">
      <StoryReader />
    </div>
  );
};

export default App;
