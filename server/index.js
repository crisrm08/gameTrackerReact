import express from 'express';
import cors from 'cors';
import axios from 'axios';
import session from 'express-session';
import pg from 'pg';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 5000;
const saltRounds = 3;

app.use(cors({
  origin: "http://localhost:3000",   
  credentials: true                  
}));

app.use(express.json());

app.use(session({
  secret: "VENDEGUINEO",
  resave: false,
  saveUninitialized: false,        
  cookie: {
    httpOnly: true,                
    maxAge: 1000 * 60 * 60 * 24,   
    secure: false,                 
    sameSite: "lax"                
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Games",
  password: "Pichipiu2020",
  port: 5432,
  });
  
db.connect();

app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Is authenticated");
    const userId = req.user.id;
    console.log("authenticated user id: ", userId);
    try {
      const getGames = await db.query("SELECT * FROM playedgames WHERE user_id = $1",[userId]);
      const games = getGames.rows; 
      console.log("Games loaded");
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).send("Error loading page");
    }
  } else {
    console.log("Not authenticated");
    res.send(false);
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
      return res.json({ success: false, message: "Game not found"});
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
    res.status(500).json({ success: false, message: "Error fetching game", error: error.message });
  }
});


app.post("/saveGame", async (req, res) => {
  const { game_name, game_image, ratings, last_time_played } = req.body;
  if (req.isAuthenticated()) {
    const user_id = req.user.id;
    console.log("Games's user id: ", user_id);

    try {
      await db.query(
        `INSERT INTO playedgames (game_name, game_image, ratings, last_time_played, user_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (game_name) DO UPDATE SET
           game_image = EXCLUDED.game_image,
           ratings = EXCLUDED.ratings,
           last_time_played = EXCLUDED.last_time_played,
           user_id = EXCLUDED.user_id;`,
        [game_name, game_image, ratings, last_time_played, user_id]
      );
  
      res.status(200).json({ message: "Game saved/updated" });
    } catch (error) {
      console.error("Database error on saving:", error); 
      res.status(500).json({ message: "Error saving game", error: error.message });
    }
  }
});

app.post("/deleteGame", async (req,res) => {
  const name = req.body.game_name;
  if (req.isAuthenticated()){
    const userId = req.user.id;
    db.query("DELETE FROM playedgames WHERE game_name = $1 AND user_id = $2", [name, userId]);
    res.redirect("/");
  }
});

app.post("/signUp", async (req, res) => {
  const typedEmail = req.body.email;
  const typedPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [typedEmail]);
    if (result.rows.length == 0) {
      bcrypt.hash(typedPassword, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("hashed password: ", hash);
          const result = await db.query(
            `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`, [typedEmail, hash]);
            const newUser = result.rows[0]; 

            req.logIn(newUser, (err) => {
              if (err) {
                return next(err); 
              }
              return res.status(201).json({ success: true, user: { id: newUser.id, email: newUser.email }});
            });
        }
      })
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/logIn", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!user) {
      console.log("login fallo");
      return res.json({ success: false, message: info.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      console.log("login exitoso");
      return res.json({ success: true, user: { id: user.id, email: user.email } });
    });
  })(req, res, next);
});

app.post("/logOut", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.clearCookie("connect.sid", { path: "/" });
      res.json({ success: true });
    });
  });
});


passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function verify(email, password, done) {
  console.log("triggered");
  
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password_hash;
    
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          return done(err);
        } else {
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password is wrong.' });
          }
        }
      });
    } else {
      return done("User not found")
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
