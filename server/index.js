const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
const app = express();
const PORT = 5000;
const saltRounds = 3;

app.use(cors());
app.use(express.json());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Games",
  password: "Pichipiu2020",
  port: 5432,
  });
  
db.connect();

app.get("/", async (req, res) => {
  try {
      const getGames = await db.query("SELECT * FROM playedgames");
      const games = getGames.rows; 
      res.json(games);
  } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).send("Error loading page");
  }
});

async function fetchGameWithRetry(typedGame, retries = 3) {
  try {
    const apiKey = process.env.RAWG_API_KEY;
    const response = await axios.get(`https://api.rawg.io/api/games?key=${apiKey}&search=${typedGame}`);
    return response.data.results;
  } catch (error) {
    if (retries > 0 && error.code === "ECONNRESET") {
      console.log(`Retrying... (${4 - retries}/3)`);
      return fetchGameWithRetry(typedGame, retries - 1);
    } else {
      throw error;
    }
  }
}

app.get("/getGame", async (req, res) => {
  try {
    const typedGame = req.query.input;
    const results = await fetchGameWithRetry(typedGame);

    if (!results.length) {
      return res.status(404).json({ message: "Game not found" });
    }

    const foundGame = results[0]; 
    const game = {
      game_name: foundGame.name,
      game_image: foundGame.background_image,
      last_time_played: new Date(),
      ratings: "decent"
    };

    res.json(game);
  } catch (error) {
    console.error("Error in getGame:", error.response?.data || error.message);
    res.status(500).json({ message: "Error fetching game", error: error.message });
  }
});


app.post("/saveGame", async (req, res) => {
  const { game_name, game_image, ratings, last_time_played } = req.body;

  try {
    await db.query(
      `INSERT INTO playedgames (game_name, game_image, ratings, last_time_played)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (game_name) DO UPDATE SET
         game_image = EXCLUDED.game_image,
         ratings = EXCLUDED.ratings,
         last_time_played = EXCLUDED.last_time_played`,
      [game_name, game_image, ratings, last_time_played]
    );

    res.status(200).json({ message: "Game saved/updated" });
  } catch (error) {
    console.error("Database error on saving:", error); 
    res.status(500).json({ message: "Error saving game", error: error.message });
  }
});

app.post("/deleteGame", async (req,res) => {
  const name = req.body.game_name;
  db.query("DELETE FROM playedgames WHERE game_name = $1",[name]);
  res.redirect("/");
});

app.post("/signUp", async (req, res) => {
  const typedEmail = req.body.email;
  const typedPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1",[typedEmail]);
    if (result.rows.length == 0) {
      bcrypt.hash(typedPassword, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("hashed password: ", hash);
          await db.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [typedEmail, hash]);
          res.status(201).send({ ok: true });
        }
      })
    }
  } catch (error) {
    console.log(error);
  }



});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
