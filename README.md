# SketchSync 🎨

A real-time multiplayer drawing and guessing game inspired by Skribbl.io. One player draws while others guess the word within a 60-second timer. Built with React, Node.js, and Socket.IO for seamless real-time multiplayer gameplay.

## 🎮 Features

- **Create & Join Rooms** - Generate unique room codes or join existing games
- **Real-time Drawing** - Synchronized canvas with color picker and brush size controls
- **Drawing Tools** - Undo strokes and eraser functionality
- **Word Selection** - Drawer selects from 5 random word options each round
- **Live Chat & Guessing** - Other players guess the word in real-time
- **Scoring System** - +10 points for correct guesses
- **Scoreboard/Leaderboard** - Real-time score tracking and ranking
- **60-Second Timer** - Countdown with round progression
- **Multiple Rounds** - Default 3 rounds with drawer rotation
- **Game Over Modal** - Winner announcement with final leaderboard
- **Responsive UI** - Works on desktop and tablet devices

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.6 - UI Framework
- **Vite** 8.0.12 - Build tool with HMR
- **Tailwind CSS** 4.3.0 - Styling
- **React Router** 7.16.0 - Navigation
- **Socket.IO Client** 4.8.3 - Real-time communication

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.IO** 4.8.3 - WebSocket library for real-time events

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`

## 🚀 How to Play

1. **Open the App** - Navigate to `http://localhost:5173`
2. **Enter Your Name** - Type your player name
3. **Create or Join Room** - Click "Create Room" for a new game or enter a room ID to join
4. **Wait for Players** - Room needs at least 2 players to start
5. **Start Game** - Host clicks "Start Game" button
6. **Select Word** - If you're the drawer, select a word from the modal
7. **Draw** - Use the canvas to draw hints about the word
8. **Guess** - Other players type guesses in the chat
9. **Score** - Earn points for correct guesses
10. **Next Round** - Drawer rotates and game continues

## 🎨 Drawing Tools

- **Color Picker** - Select any color (#RRGGBB format)
- **Brush Size** - Adjust brush from 1px to 20px
- **Eraser** - Toggle eraser mode to erase strokes
- **Undo** - Restore canvas to previous state
- **Clear** - Clear entire canvas

## 📊 Game Mechanics

- **Word Options** - Drawer gets 5 random words to choose from
- **Word Hint** - Displays blank pattern (e.g., "_ _ _") to guessers
- **Scoring** - +10 points for each correct guess
- **Round Duration** - 60 seconds per round
- **Rounds** - Default 3 rounds per game
- **Drawer Rotation** - Players take turns drawing in order

## 📁 Project Structure

```
sketchsync/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Canvas.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── WordSelector.jsx
│   │   │   ├── Scoreboard.jsx
│   │   │   ├── Timer.jsx
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   └── Room.jsx
│   │   ├── socket/         # Socket.IO setup
│   │   └── App.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── models/         # Data models
│   │   │   ├── Room.js
│   │   │   └── Player.js
│   │   ├── socket/         # Socket event handlers
│   │   │   └── socketHandler.js
│   │   └── server.js       # Express app setup
│   └── package.json
└── README.md
```

## 🔌 Socket Events

### Client → Server
- `create_room` - Create a new room
- `join_room` - Join existing room
- `start_game` - Start the game (host only)
- `word_chosen` - Drawer selects a word
- `draw` - Send drawing stroke
- `clear_canvas` - Clear canvas
- `draw_undo` - Undo last stroke
- `guess_word` - Submit a word guess

### Server → Client
- `room_created` - Room successfully created
- `player_joined` - New player joined
- `game_started` - Game has started
- `round_start` - New round started, drawer gets word options
- `word_hint` - Display hint pattern to guessers
- `timer_update` - Time remaining in round
- `draw` - Receive drawing stroke from drawer
- `clear_canvas` - Clear canvas command
- `correct_guess` - A player guessed correctly
- `round_end` - Round ended
- `game_over` - Game finished with winner

## 🚢 Deployment

Ready for deployment to:
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Heroku

Update `CLIENT_URL` in backend configuration for CORS.

## 🔮 Future Improvements

- [ ] MongoDB Persistence
- [ ] User Authentication & Accounts
- [ ] Friend System
- [ ] Global Leaderboard
- [ ] Custom Word Lists
- [ ] Hints with Progressive Letter Reveal
- [ ] Room Settings (max players, round count, draw time)
- [ ] Sound Effects & Notifications
- [ ] Spectator Mode
- [ ] Moderation (kick, ban players)
- [ ] Avatars & Customization
- [ ] Replay Feature

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Made with ❤️ by Tanish**

## Author

Tanish Tyagi