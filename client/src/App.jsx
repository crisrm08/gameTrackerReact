import React, { useEffect, useState, useContext} from 'react';
import Header from './components/Header';
import './css/App.css';
import './css/Card.css';
import axios from 'axios';
import GameCard from './components/GameCard';
import { ScreenContext } from './contexts/ScreenContext';
import { LoggedContext } from './contexts/LoggedContext';
import Login from './components/Login';

function App() {
  const [games, setGames] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [gameNotFound, setGameNotFound] = useState(false);
  const { currentScreen, setCurrentScreen } = useContext(ScreenContext);
  const { isLoggedIn } = useContext(LoggedContext);

 useEffect(() => {
  axios.get("http://localhost:5000/", { withCredentials: true })
    .then((response) => {
      if (response.data === false || isLoggedIn === false) {
        setCurrentScreen("login");
      } else {
        setCurrentScreen("games");
        setGames(response.data);
      }
    })
    .catch((err) => {
      console.error("Error fetching games:", err);
    });
}, [searchResult, isLoggedIn]);

useEffect(() => {
  console.log("🚨 gameNotFound changed:", gameNotFound);
}, [gameNotFound]);

  function handleSave(updatedGame) {
    setSearchResult(null);
    axios.post("http://localhost:5000/saveGame", updatedGame, { withCredentials: true })
      .then(() => {
        setGames((prevGames) =>
          prevGames.map((game) =>
            game.game_name === updatedGame.game_name ? updatedGame : game
          )
        );
      })
      .catch((error) => console.error("Error saving game:", error));
  }

  function handleDelete(gameName) {
    try {
      axios.post("http://localhost:5000/deleteGame", { game_name: gameName }, { withCredentials: true });
      setGames((prevGames) => prevGames.filter((game) => game.game_name !== gameName));
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  async function handleSearch(searchInput) {
    const { data } = await axios.get(
      `http://localhost:5000/getGame?input=${encodeURIComponent(searchInput)}`
    );

    console.log("data: ", data);
    console.log("data.success: ", data.success);
    
    if (data.success === false) {
      setGameNotFound(true);
      setSearchResult(null);
    } else {
      setGameNotFound(false);
      setSearchResult(data);
    }
  };
  

  return (
    <div className="App">
      {currentScreen === "login" ? (
        <Login />
      ) : currentScreen === "games" && (
        <>
          <Header onSearch={handleSearch} />
          {gameNotFound && <h2>Sorry, game not found</h2>}
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
                <button onClick={() => setSearchResult(null)}>
                  Show All Games
                </button>
              </div>
            ) : (
              games.map(game => (
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
        </>
      )}
    </div>
  );  
}

export default App;
