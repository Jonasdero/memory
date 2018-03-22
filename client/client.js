var data = { field: [], pictureUrls: [], size: { width: 0, height: 0 } };
var won = -1;
var playernames = [];
var players = [];
var sessionID = -1;
var currentPlayer = -1;
var playingPlayer = "";
var points = [];
var oldfield = [];
var clicked = false;
var interval = null;
var p = {};

$(document).ready(function () { //The functions below are only available if the document is fully loaded
    //adding a clickevent to the login button
    $("#btn_login").click(function () {
        //reading the sessionname, the playername and the fieldsize from the html form if all fields are felt in
        if ($("#SName").val() != "" && $("#Session").val() != "" && $("#inputGroupSelect01").val() != "") {
            var name = $("#SName").val(); 
            var session = $("#Session").val();
            data.size.width = +$("#inputGroupSelect01").val().split('x')[0];
            data.size.height = +$("#inputGroupSelect01").val().split('x')[1];

            $("#login").hide(); //hide the login container
            $("#init").show(); //show the init container
            
            //post the sessionname, the playername and the fieldsize to the server
            $.post("/connect",
                { "sessionName": session, "playerName": name, "size": { "width": +data.size.width, "height": +data.size.height }, "type": "memory" },
                function (result) {
                    sessionID = result.sessionID;
                    interval = setInterval(getConnectedPlayers, 300);
                }
            );

        } else { $("#warning").show(); } //show a warning if fields are not felt in
    });

    //adding a clickevent to the init button
    $("#btn_init").click(function () {
        $("#ready").hide(); //hide the init button
        $("#game").show(); //show the game container
        clearInterval(interval); //stop updating the playerlist
        
        //get the players and the game data from the server and create the game
        $.get("/init/" + sessionID,
            function (result) {
                players = result.connectedPlayers;
                data = result.data;
                makeTable();
                interval = setInterval(build, 300);
            }
        );
    });
});

//get all playernames of one session
function getConnectedPlayers() {
    $.get("/connected/" + sessionID,
        function (result) {
            playernames = result.connectedPlayers;
            points = []
            //creating points for the players and setting them 0 because at this point their is no points but it is needed to create the player table  
            for (i = 0; i < playernames.length; i++) { points.push(0); } 
            createTable();
        }
    );
}

//creating the player-points table
function createTable() {
    if (document.getElementById("playertable") !== null)
        $("#playertable").remove(); //deleting already existing table

    //creating table, tablebody and tablehead
    var myTable = document.createElement("table"); 
    var mytablehead = document.createElement("thead");
    var mytablebody = document.createElement("tbody");

    //adding headlines
    currentRow = document.createElement("tr");

    currentCell = document.createElement("td");
    currentText = document.createTextNode("Players");
    currentCell.appendChild(currentText);
    currentRow.appendChild(currentCell);

    currentCell = document.createElement("td");
    currentText = document.createTextNode("Points");
    currentCell.appendChild(currentText);
    currentRow.appendChild(currentCell);

    mytablehead.appendChild(currentRow);
    

    //adding the players and points to the tablebody
    for (let i = 0; playernames.length > i; i++) {
        currentRow = document.createElement("tr");

        currentCell = document.createElement("td");
        currentText = document.createTextNode(i + 1 + ". " + playernames[i]);
        currentCell.appendChild(currentText);
        currentRow.appendChild(currentCell);

        currentCell = document.createElement("td");
        currentText = document.createTextNode(points[i]);
        currentCell.setAttribute("id", "text" + i);
        currentCell.appendChild(currentText);

        currentRow.appendChild(currentCell);
        mytablebody.appendChild(currentRow);
    }

    //adding the tablebody and the tablehead to the table
    myTable.appendChild(mytablehead);
    myTable.appendChild(mytablebody);

    myTable.setAttribute("class", "table"); //setting class to table for Bootstrap design 
    myTable.setAttribute("id", "playertable"); //setting id to "playertable" to make it chooseable for deleting when creating new table
    
    //adding table to html
    document.getElementById("table").appendChild(myTable); 
}

//creating memory game grit
function makeTable() {
    
    //creating table and tablebody
    node = document.getElementById("game");
    var myTable = document.createElement("table");
    var mytablebody = document.createElement("tbody");

    for (var i = 0; i < data.size.height; i++) {
        //adding rows to the table out of the height
        currentRow = document.createElement("tr");

        //adding cells to the rows out of width
        for (var j = 0; j < data.size.width; j++) {
            currentCell = document.createElement("td");

            //set id of the cell on the calculated index (row * maxwidth + column) to make it chooseable
            currentCell.setAttribute("id", (i * data.size.width) + j);

            //adding the image by imagesource given by the server to the cell
            currentCell.innerHTML = '<img src="' + window.location.href + '' + data.pictureUrls[data.field[(i * data.size.width) + j]] + '" height ="150em" width = "150em" style="margin: 0.5em 0.5em 0.5em 0.5em;"/>';
            
            //adding a clickevent to the cell if the player has a turn
            currentCell.addEventListener("click", function () {
                var col = $(this).index();
                var row = $(this).closest('tr').index();
                var customIndex = (row * data.size.width) + col;
                if (clicked || data.field[customIndex] !== 0 || currentPlayer !== sessionID) return;
                clicked = true;

                //post the turn with sessionID and the index of the clicked field
                $.post("/turn/" + sessionID, { "index": customIndex },
                    function (result) {
                        p = result;
                        clicked = false; data.field = result.data.field; points = result.points; won = result.won;
                    }
                );
            })

            //add the Cell to the row
            currentRow.appendChild(currentCell);
        }
        //adding the row to the tableboy
        mytablebody.appendChild(currentRow);
    }
    //adding the tablebody to tabke
    myTable.appendChild(mytablebody);

    //adding the table to the html document
    node = document.getElementById("table");
    node.appendChild(myTable);
}

//creating the game
function build() {
    //get the game field, points, currentPlayer, won, playinPlayer
    $.get("/game/" + sessionID, function (result) {
        data.field = result.data.field; points = result.points; currentPlayer = result.currentPlayer; won = result.won; playingPlayer = result.playingPlayer;
        for (let i = 0; i < players.length; i++)
            document.getElementById("text" + i).innerText = points[i];
    })
    
    //showing the players who has a turn
    if (currentPlayer !== -1) 
        document.getElementById("playingplayer").innerHTML = playingPlayer + ', it\'s your turn!'
    else //show "waiting" if nobody has the turn the players 
        document.getElementById("playingplayer").innerHTML = "Waiting";
    
    //adding the changed images by urls to the cell
    for (let i = 0; i < data.field.length; i++) {
        currentCell = document.getElementById(i); //get the cell by Index
        if (oldfield[i] != data.field[i]) {
            //adding the new images by urls to the cells
            currentCell.innerHTML = '<img src="' + window.location.href + '' + data.pictureUrls[data.field[i]] + '" height ="150em" width = "150em" style="margin: 0.5em 0.5em 0.5em 0.5em;"/>';
        }
    }
    oldfield = data.field; //setting oldfield to the current field

    //if won is -1 a alert will show the winner
    if (won !== -1) {
        var index = 0;
        for (var i = 1; i < points.length; i++) { if (points[i] > points[i - 1]) index = i; }
        clearInterval(interval);
        alert(playernames[index] + " hat gewonnen");
    }
}