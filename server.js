const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('./src'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const games = {};

app.get('/games', (_request, response) => {
  response.send(games);
});

app.post('/games', (request, response) => {
  games[request.body.id] = request.body.game;
  io.emit('update', { id: request.body.id, game: request.body.game });
  response.sendStatus(200);
});

http.listen(3000, () => {
  console.log('Servern körs, besök http://localhost:3000');
});
