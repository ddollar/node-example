var express = require('express');
var io = require('socket.io');

var app = express.createServer();

app.get('/', function(request, response) {
  response.send(' \
    <html>   \
      <head> \
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script> \
        <script type="text/javascript" src="/socket.io/socket.io.js"></script> \
        <script type="text/javascript" src="/client.js"></script> \
      </head>                                                \
      <body>                                                 \
        <textarea id="chat" cols="100" rows="20"></textarea> \
        <br/>                                                \
        <input id="entry" type="text" size="100">            \
      </body>                                                \
    </html>                                                  \
  ');
});

app.get('/client.js', function(request, response) {
  response.contentType('text/javascript');
  response.send("                              \
    var socket = new io.Socket(                \
      document.location.hostname,              \
      { port: document.location.port }         \
    );                                         \
    socket.connect();                          \
    socket.on('message', function(data) {      \
      $('#chat').append(data);                 \
    });                                        \
    $(window).ready(function() {               \
      $('#entry').keypress(function(event) {   \
        if (event.which == 13) {               \
          socket.send($(this).val());          \
          $(this).val('');                     \
        }                                      \
      });                                      \
      $('#entry').focus();                     \
    });                                        \
  ");
});

app.listen(process.env['PORT'] || 3000);

var socket = io.listen(app);
var clients = {};

socket.on('connection', function(client) {
  clients[client.sessionId] = client;

  client.on('message', function(data) {
    for (var id in clients) {
      clients[id].send(data + '\n');
    }
  });

  client.on('disconnect', function() {
    delete clients[client.sessionId];
  });
});
