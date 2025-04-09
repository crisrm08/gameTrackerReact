import { useState } from "react";
import React from "react";
import '../css/Card.css';

function GameCard(props) {
  const { game_name, game_image, ratings, last_time_played, onDelete, onSave } = props;

  const [rating, setRating] = useState(ratings || "decent");
  const [lastPlayed, setLastPlayed] = useState(
    last_time_played ? new Date(last_time_played).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );

  function handleSave() {
    const updatedGame = {
      game_name,
      game_image,
      ratings: rating,
      last_time_played: lastPlayed,
    };
    onSave(updatedGame); 
  };

  function handleDelete() {
    onDelete(game_name); 
  };
  
  return (
    <div className="card">
      <img src={game_image} alt={`${game_name}`} />
      <div className="details-container">
        <h3>{game_name}</h3>

        <div className="form-buttons">
          <label htmlFor="Ratings">Rating</label>
          <select
            name="ratings"
            id="Ratings"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            <option value="horrible">Horrible</option>
            <option value="bad">Bad</option>
            <option value="decent">Decent</option>
            <option value="good">Good</option>
            <option value="great">Great</option>
          </select>

          <label htmlFor="last_time_played">Last time played:</label>
          <input
            type="date"
            id="last_time_played"
            value={lastPlayed}
            onChange={(event) => setLastPlayed(event.target.value)}
          />

          <div className="buttons">
            <button id="save" onClick={handleSave}>Save</button>
            <button id="delete" onClick={handleDelete}>Delete</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default GameCard;
