import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import './css/App.css';
import './css/Card.css';
import axios from 'axios';
import GameCard from './components/GameCard';

function App() {
  const [games, setGames] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);

  // Fetch games on mount
 useEffect(() => {
  axios.get("http://localhost:5000/")
    .then((res) => setGames(res.data))
    .catch((err) => {
      console.error("Error fetching games:", err);
      setError("Failed to load games. Please try again later.");
    });
}, [searchResult]);

  // ✅ Handles Save (API call + State update)
  function handleSave(updatedGame) {
    setSearchResult(null);
    axios.post("http://localhost:5000/saveGame", updatedGame)
      .then(() => {
        setGames((prevGames) =>
          prevGames.map((game) =>
            game.game_name === updatedGame.game_name ? updatedGame : game
          )
        );
      })
      .catch((error) => console.error("Error saving game:", error));
  }

  // ✅ Handles Delete (API call + State update)
  function handleDelete(gameName) {
    try {
      axios.post("http://localhost:5000/deleteGame", { game_name: gameName });
      setGames((prevGames) => prevGames.filter((game) => game.game_name !== gameName));
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  async function handleSearch(searchInput){
    try {
      const response = await axios.get(`http://localhost:5000/getGame?input=${searchInput}`);
      setSearchResult(response.data); 
      setError(null); 
    } catch (error) {
      console.error("Error searching game:", error);
      setSearchResult(null);
      setError("Game not found");
    }
  };
  return (
   
    <div className='App'>
      <Header onSearch={handleSearch}/>
      {error && <h2>{error}</h2>}
      <div className="game-list">
      {searchResult ? (
        <div> 
           <GameCard
            key={searchResult.game_name}
            game_name={searchResult.game_name}
            game_image={searchResult.game_image}
            ratings={searchResult.ratings}
            last_time_played={searchResult.last_time_played}
            onSave={handleSave}
            onDelete={handleDelete}
          />
          <button onClick={() => setSearchResult(null)}>Show All Games</button>
        </div>
        ) : (
          games.map((game) => (
            <GameCard
              key={game.game_name}
              game_name={game.game_name}
              game_image={game.game_image}
              ratings={game.ratings}
              last_time_played={game.last_time_played}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
