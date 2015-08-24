var http = require('http').createServer(httpHandler);
var url = require("url");
var path = require("path");
var fs = require('fs');
var io = require('socket.io')(http);

http.listen(3000);
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

io.on('connection', function (socket) {
  console.log("Someone connected");

  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('disconnect', function () {
    console.log("Someone disconnected");

    socket.emit('player:left', {name: "TODO"});
  });
});
