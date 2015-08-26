var http = require('http').createServer(httpHandler);
var url = require("url");
var path = require("path");
var fs = require('fs');
var io = require('socket.io')(http);

http.listen(41489);
console.log("Starting Server...");

function httpHandler (request, response) {
  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd()+'/client', uri);

  fs.exists(filename, function (exists) {
    if (!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory())
      filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if (err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}

var players = [];

io.on('connection', function (socket) {
  console.log("Player connected ("+socket.id+") from " + socket.client.conn.remoteAddress);

  // Load this player's data and add it to the players array.
  var player = {id: socket.id, name: socket.id, level: 0, race: "r", class: "c"};
  addPlayer(player);

  // Tell the player who is currently online.
  socket.emit('players:online', {players: players});

  // Let everyone know someone joined.
  io.emit('player:join', {player: player});

  socket.on('disconnect', function () {
    removePlayer(player);
    console.log("Player disconnected from " + socket.client.conn.remoteAddress);

    io.emit('player:left', {player: {id: socket.id}});
  });

  socket.on('roll', function (data) {
    var roll = Math.round(Math.random() * data.faces);

    console.log(socket.id + " rolled " + roll + "/" + data.faces);
    io.emit('roll', {player: socket.id, roll: roll, faces: data.faces});
  });
});

function addPlayer(player) {
  players.push(player);
}

function removePlayer(player) {
  var p;
  for (var i = 0; i < players.length; i++) {
    p = players[i];
    if (p.id === player.id) {
      players.splice(i--, 1);
    }
  }
}
