(function() {
  'use strict';

  angular
    .module('client')
    .factory('socket', function (socketFactory) {
      var socket = socketFactory({
        ioSocket: io.connect('localhost:41489'),
      });

      socket.players = [];
      socket.messages = [];

      socket.on('players:online', function (data) {
        data.players.forEach(function (player) {
          socket.addPlayer({
            id: player.id,
            name: player.name,
            level: player.level,
            race: player.race,
            class: player.class
          });
        });
      });

      socket.on('player:join', function (data) {
        console.log("player:join");
        console.log(data);
        
        socket.messages.push({
          user: 'chatroom',
          text: 'User ' + data.player.name + ' has joined.'
        });
        
        socket.addPlayer({
          id: data.player.id,
          name: data.player.name,
          level: data.player.level,
          race: data.player.race,
          class: data.player.class
        });
      });

      socket.on('player:left', function (data) {
        console.log("player:left");
        console.log(data);

        socket.messages.push({
          user: 'chatroom',
          text: 'User ' + data.player.id + ' has left.'
        });

        socket.removePlayer(data.player.id);
      });

      socket.on('roll', function (data) {
        console.log("roll");
        console.log(data);

        socket.messages.push({
          user: data.player,
          text: data.player + " Tiro un dado y consiguio " + data.roll + "/" + data.faces
        });
      });

      socket.rollDice = function () {
        console.log("Requesting a dice roll to the server...");
        socket.emit('roll', {faces: 20});
      };

      socket.addPlayer = function (player) {
        var repeated;
        socket.players.forEach(function (p) {
          if (player.id == p.id) {
            repeated = true;
            return true;
          }
        });

        if (repeated)
          return;

        socket.players.push({
          id: player.id,
          name: player.name,
          level: player.level,
          race: player.race,
          class: player.class,
        });
      }

      socket.removePlayer = function (id) {
        var player;
        for (var i = 0; i < socket.players.length; i++) {
          player = socket.players[i];
          
          if (player.id === id) {
            socket.players.splice(i--, 1);
          }
        }
      };

      return socket;
    });

})();