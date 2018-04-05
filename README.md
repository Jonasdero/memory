# Memory with NodeJS and JQuery

## Idea
Implementing a turn based memory game with multiple Clients and custom game size.
It currently implements an abstract game class, so its easy to implement another turn based board game onto this service.

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
*data*, *connectedPlayers*, *points*, *turn*, *won*, *playingPlayer*

### POST /**turn**/gameID/sessionID
###### Description:
POST-Request to make a turn on the posted field index, returns updates to game data, points, etc.
###### Contains:
*index*
###### Returns:
*data*, *connectedPlayers*, *points*, *turn*
