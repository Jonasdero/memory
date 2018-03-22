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
function createTable() {
    if (document.getElementById("playertable") !== null)
        $("#playertable").remove();
    var myTable = document.createElement("table");
    var mytablehead = document.createElement("thead");
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
    var mytablebody = document.createElement("tbody");

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
    myTable.appendChild(mytablehead);
    myTable.appendChild(mytablebody);
    myTable.setAttribute("class", "table");
    myTable.setAttribute("id", "playertable")
    document.getElementById("table").appendChild(myTable);
}

function makeTable() {
    node = document.getElementById("game");
    var myTable = document.createElement("table");
    var mytablebody = document.createElement("tbody");
    for (var i = 0; i < data.size.height; i++) {
        currentRow = document.createElement("tr");
        for (var j = 0; j < data.size.width; j++) {
            currentCell = document.createElement("td");
            currentCell.setAttribute("id", (i * data.size.width) + j);
            currentCell.innerHTML = '<img src="' + window.location.href + '' + data.pictureUrls[data.field[(i * data.size.width) + j]] + '" height ="150em" width = "150em" style="margin: 0.5em 0.5em 0.5em 0.5em;"/>';
            currentCell.addEventListener("click", function () {
                var col = $(this).index();
                var row = $(this).closest('tr').index();
                var customIndex = (row * data.size.width) + col;
                if (clicked || data.field[customIndex] !== 0 || currentPlayer !== sessionID) return;
                clicked = true;
                $.post("/turn/" + sessionID, { "index": customIndex },
                    function (result) {
                        p = result;
                        clicked = false; data.field = result.data.field; points = result.points; won = result.won;
                    }
                );
            })
            currentRow.appendChild(currentCell);
        }
        mytablebody.appendChild(currentRow);
    }
    myTable.appendChild(mytablebody);
    myTable.setAttribute("id", "gametable")
    node = document.getElementById("table");
    node.appendChild(myTable);
}


function build() {
    $.get("/game/" + sessionID, function (result) {
        data.field = result.data.field; points = result.points; currentPlayer = result.currentPlayer; won = result.won; playingPlayer = result.playingPlayer;
        for (let i = 0; i < players.length; i++)
            document.getElementById("text" + i).innerText = points[i];
    })
    if (currentPlayer !== -1) document.getElementById("playingplayer").innerHTML = playingPlayer + ', it\'s your turn!'
    else document.getElementById("playingplayer").innerHTML = "Waiting";
    // if (document.getElementById("gametable") !== null)
    // $("#gametable").remove();
    var differences = [];
    for (let i = 0; i < data.field.length; i++) {
        currentCell = document.getElementById(i);
        if (oldfield[i] != data.field[i]) {
            currentCell.innerHTML = '<img src="' + window.location.href + '' + data.pictureUrls[data.field[i]] + '" height ="150em" width = "150em" style="margin: 0.5em 0.5em 0.5em 0.5em;"/>';
        }
    }
    oldfield = data.field;

    if (won !== -1) {
        var index;
        for (var i = 1; i < points.length; i++) { index = 0; if (points[i] > points[i - 1]) index = i; }
        clearInterval(interval);
        alert(playernames[index] + " hat gewonnen");
    }
}

function getConnectedPlayers() {
    $.get("/connected/" + sessionID,
        function (result) {
            playernames = result.connectedPlayers;
            points = []
            for (i = 0; i < playernames.length; i++) { points.push(0); }
            createTable();
        }
    );
}

$(document).ready(function () {
    $("#btn_login").click(function () {
        if ($("#SName").val() != "" && $("#Session").val() != "" && $("#inputGroupSelect01").val() != "") {
            var name = $("#SName").val();
            var session = $("#Session").val();
            data.size.width = parseInt($("#inputGroupSelect01").val().split('x')[0]);
            data.size.height = parseInt($("#inputGroupSelect01").val().split('x')[1]);

            $("#login").hide();
            $("#init").show();
            $.post("/connect",
                { "sessionName": session, "playerName": name, "size": { "width": data.size.width, "height": data.size.height } },
                function (result) {
                    sessionID = result.sessionID;
                    interval = setInterval(getConnectedPlayers, 300);
                }
            );

        } else { $("#warning").show(); }
    });
    $("#btn_init").click(function () {
        $("#ready").hide();
        $("#game").show();
        clearInterval(interval);
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