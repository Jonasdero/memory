var data = { field: [], pictureUrls: [], size: { width: 0, height: 0 } };
var won = -1;               // SessionID of player who won the game
var players = [];           // Names of all players
var sessionID = -1;         // SessionID of client
var currentPlayer = -1;     // Current playing SessionID
var playingPlayer = "";     // Current name of playing player
var points = [];            // Points of all players
var oldfield = [];          // Old field to see where are the differences
var clicked = false;        // Boolean if any field has been clicked
var interval = null;        // Current function that will be called
var gameID = -1;            //  ID of the current game

// Build the <img> markup for a card. `animate` adds the flip-in animation.
function cardImage(pictureIndex, animate) {
    return '<img class="card-img' + (animate ? ' flip' : '') +
        '" src="' + data.pictureUrls[pictureIndex] + '" alt="card" draggable="false"/>';
}

$(document).ready(function () { // The functions below are only available if the document is fully loaded
    // Adding a clickevent to the login button
    $("#btn_login").click(function () {
        // Reading the sessionname, the playername and the fieldsize from the html form if all fields are felt in
        if ($("#SName").val() != "" && $("#Session").val() != "" && $("#inputGroupSelect01").val() != "") {
            var name = $("#SName").val();
            var session = $("#Session").val();
            data.size.width = +$("#inputGroupSelect01").val().split('x')[0];
            data.size.height = +$("#inputGroupSelect01").val().split('x')[1];

            $("#login").addClass("d-none"); // Hide the login container
            $("#init").removeClass("d-none"); // Show the init container

            // Post the sessionname, the playername and the fieldsize to the server
            $.post("/connect",
                {
                    "sessionName": session, "playerName": name,
                    "size": { "width": +data.size.width, "height": +data.size.height },
                    "type": "memory"
                },
                function (result) {
                    if (!result) { clearInterval(interval); return; }
                    sessionID = result.sessionID;
                    gameID = result.gameID;
                    interval = setInterval(getConnectedPlayers, 300);
                }
            );

        } else { $("#warning").removeClass("d-none"); } // Show a warning if fields are not filled in
    });

    // Adding a clickevent to the init button
    $("#btn_init").click(function () {
        $("#ready").addClass("d-none"); // Hide the init button
        $("#game").removeClass("d-none"); // Show the game container
        clearInterval(interval); // Stop updating the playerlist

        // Get the players and the game data from the server and create the game
        $.get("/init/" + gameID + "/" + sessionID,
            function (result) {
                if (!result) { clearInterval(interval); return; }
                players = result.connectedPlayers;
                data = result.data;
                createMemoryGameGrid();
                interval = setInterval(updateGame, 300);
            }
        );
    });
});

// Get all playernames of one session
function getConnectedPlayers() {
    $.get("/connected/" + gameID + "/" + sessionID,
        function (result) {
            if (!result) { clearInterval(interval); return; }
            players = result.connectedPlayers;
            points = []
            // Creating points for the players and setting them 0 because at this point their is no points but it is needed to create the player table
            for (i = 0; i < players.length; i++) { points.push(0); }
            if (document.getElementById("playertable") === null)
                createPlayerPointsTable();
            else updatePlayerPointsTable();
        }
    );
}

// Build a row for the player points table
function buildPlayerRow(i) {
    var row = document.createElement("tr");
    if (players[i] === playingPlayer) row.className = "active-player";

    var nameCell = document.createElement("td");
    nameCell.appendChild(document.createTextNode((i + 1) + ". " + players[i]));
    row.appendChild(nameCell);

    var pointsCell = document.createElement("td");
    pointsCell.setAttribute("id", "text" + i);
    pointsCell.appendChild(document.createTextNode(points[i]));
    row.appendChild(pointsCell);

    return row;
}

// Creating the player points table
function createPlayerPointsTable() {
    if (document.getElementById("playertable") !== null)
        $("#playertable").remove(); // Deleting already existing table

    var table = document.createElement("table");
    var mytablehead = document.createElement("thead");
    var tbody = document.createElement("tbody");

    // Adding headlines
    var headRow = document.createElement("tr");
    var headPlayers = document.createElement("td");
    headPlayers.appendChild(document.createTextNode("Players"));
    headRow.appendChild(headPlayers);
    var headPoints = document.createElement("td");
    headPoints.appendChild(document.createTextNode("Points"));
    headRow.appendChild(headPoints);
    mytablehead.appendChild(headRow);

    // Adding the players and points to the tablebody
    for (let i = 0; players.length > i; i++) tbody.appendChild(buildPlayerRow(i));

    table.appendChild(mytablehead);
    table.appendChild(tbody);

    table.setAttribute("id", "playertable"); // Setting id to "playertable" to make it chooseable for deleting when creating new table

    // Adding table to html
    document.getElementById("table").appendChild(table);
}

// Creating memory game grid
function createMemoryGameGrid() {
    var myTable = document.createElement("table");
    myTable.setAttribute("id", "board");
    var mytablebody = document.createElement("tbody");

    for (var i = 0; i < data.size.height; i++) {
        // Adding rows to the table out of the height
        currentRow = document.createElement("tr");

        // Adding cells to the rows out of width
        for (var j = 0; j < data.size.width; j++) {
            currentCell = document.createElement("td");

            // Set id of the cell on the calculated index (row * maxwidth + column) to make it chooseable
            currentCell.setAttribute("id", (i * data.size.width) + j);

            // Adding the image by imagesource given by the server to the cell
            currentCell.innerHTML = cardImage(data.field[(i * data.size.width) + j], false);

            // Adding a clickevent to the cell if the player has a turn
            currentCell.addEventListener("click", function () {
                var col = $(this).index();
                var row = $(this).closest('tr').index();
                var customIndex = (row * data.size.width) + col;
                if (clicked || data.field[customIndex] !== 0 || currentPlayer !== sessionID)
                    return;

                clicked = true;
                // Post the turn with sessionID and the index of the clicked field
                $.post("/turn/" + gameID + "/" + sessionID, { "index": customIndex },
                    function (result) {
                        if (!result) { clearInterval(interval); return; }
                        data.field = result.data.field;
                        points = result.points; clicked = false;
                        checkPlayerCount(result.connectedPlayers);
                    }
                );
            })

            // Add the Cell to the row
            currentRow.appendChild(currentCell);
        }
        // Adding the row to the tableboy
        mytablebody.appendChild(currentRow);
    }
    // Adding the tablebody to tabke
    myTable.appendChild(mytablebody);

    // Adding the table to the html document
    document.getElementById("table").appendChild(myTable);
}

// Updating the player points table
function updatePlayerPointsTable() {
    var tbody = document.getElementById('playertable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = "";

    // Adding the players and points to the tablebody
    for (let i = 0; players.length > i; i++) tbody.appendChild(buildPlayerRow(i));
}

// Updating the game
function updateGame() {
    // Get the game field, points, currentPlayer, won, playinPlayer
    $.get("/game/" + gameID + "/" + sessionID, function (result) {
        if (!result) {
            clearInterval(interval); return;
        }
        data.field = result.data.field;
        currentPlayer = result.currentPlayer; won = result.won;
        playingPlayer = result.playingPlayer; points = result.points;
        checkPlayerCount(result.connectedPlayers);

        updatePlayerPointsTable();
    })

    // Showing the players who has a turn
    if (currentPlayer === sessionID)
        document.getElementById("playingplayer").innerHTML = "🎯 It's your turn!";
    else if (currentPlayer !== -1)
        document.getElementById("playingplayer").innerHTML = "⏳ " + playingPlayer + "'s turn";
    else // Show "waiting" if nobody has the turn the players
        document.getElementById("playingplayer").innerHTML = "Waiting…";

    // Adding the changed images by urls to the cell
    for (let i = 0; i < data.field.length; i++) {
        currentCell = document.getElementById(i);
        if (oldfield[i] != data.field[i]) {
            // Animate the flip only when a card is being revealed
            currentCell.innerHTML = cardImage(data.field[i], data.field[i] !== 0);
        }
    }
    oldfield = data.field.slice(); // Setting oldfield to the current field

    // When the game is won (won !== -1) announce the player with the most points
    if (won !== -1) {
        var index = 0;
        for (var i = 1; i < points.length; i++) { if (points[i] > points[index]) index = i; }
        clearInterval(interval);
        alert("🏆 " + players[index] + " won!");
    }
}

// Check wether the newPlayers array is smaller than the old one and if so rebuild the points table
function checkPlayerCount(newPlayerNames) {
    var newBuild = players.length != newPlayerNames.length;
    players = newPlayerNames;
    if (newBuild) {
        updatePlayerPointsTable();
    }
}
