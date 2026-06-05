# Memory with NodeJS and jQuery

## Idea
Implementing a turn based memory game with multiple Clients and custom game size.
It currently implements an abstract game class, so its easy to implement another turn based board game onto this service.

## Getting Started
Requirements: Node.js 18 or newer.

```bash
npm install   # install dependencies
npm start     # compiles TypeScript (prestart) and starts the server
```

The server then runs at http://localhost:4200 (override with the `PORT` env variable).

## Tech Stack
* Backend: Node.js + Express 5 (TypeScript)
* Frontend: jQuery 3.7 + Bootstrap 5.3

## API
The server responds to following API calls.

### GET /
###### Description:
Basic GET-Request to get the html site
###### Returns:
*index.html*

### POST /**connect**
###### Description:
POST-Request to post initial player and game data
###### Contains:
*sessionName*, *size*, *playerName*
###### Returns:
*gameID*, *sessionID*

### GET /**connected**/gameID/sessionID
###### Description:
GET-Request to get the names of all connected player names in the current game session
###### Returns:
*connectedPlayers*

### GET /**init**/gameID/sessionID
###### Description:
GET-Request to get the names of all connected player names in the current game session and the data needed to initialize the game
###### Returns:
*connectedPlayers*, *data*

### GET /**game**/gameID/sessionID
###### Description:
GET-Request to get updates to game data, points, etc.
###### Returns:
*data*, *connectedPlayers*, *points*, *currentPlayer*, *won*, *playingPlayer*

### POST /**turn**/gameID/sessionID
###### Description:
POST-Request to make a turn on the posted field index, returns updates to game data, points, etc.
###### Contains:
*index*
###### Returns:
*data*, *connectedPlayers*, *points*, *currentPlayer*
