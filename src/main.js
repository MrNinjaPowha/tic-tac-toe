import Game from './gameObject.js';

const modal = {
  object: new bootstrap.Modal(document.querySelector('#modal')),
  title: document.querySelector('#modal-title'),
};
const roomForm = {
  input: document.querySelector('#room-code'),
  button: document.querySelector('#room-join'),
};
const message = {
  player: document.querySelector('#player-info'),
  playerTurn: document.querySelector('#turn-info'),
  turnCount: document.querySelector('#turn-count'),
};
const slotButtons = document.querySelectorAll('.slot');

const socket = io();
socket.on('update', doGameUpdate);

let currentGame = new Game('');

roomForm.button.addEventListener('click', () => {
  const inputIsTooShort =
    roomForm.input.value.length <
    parseInt(roomForm.input.attributes.getNamedItem('minlength').nodeValue);

  if (inputIsTooShort) return;

  fetchGame(roomForm.input.value);
});

slotButtons.forEach((button, index) => {
  button.addEventListener('click', (event) => {
    if (!currentGame.id || currentGame.game.finished || !currentGame.player) return;
    if (button.getAttribute('placed') === 'true') return;

    if (getPlayerTurn() !== currentGame.player) return;

    switchButtonState(event.target, index, currentGame.player);
    postGameUpdate();
  });
});

function switchButtonState(button, slot, piece) {
  button.innerHTML = `
  <div class="piece">
    <img src="/img/piece-${piece}.svg" alt="${piece}" />
  </div>`;
  button.setAttribute('placed', 'true');
  currentGame.placePiece(slot, piece);
  handleWinner();
  updateMessageDisplay();
}

function updateMessageDisplay() {
  if (currentGame.player) {
    message.player.textContent = `You're playing as: ${currentGame.player}`;
    message.playerTurn.textContent =
      getPlayerTurn() === currentGame.player ? 'Your turn' : "Opponent's turn";
  } else {
    message.player.textContent = 'Spectating';
    message.playerTurn.textContent = '';
  }

  message.turnCount.textContent = `Turn: ${currentGame.game.turn}`;
}

function getPlayerTurn() {
  if (currentGame.game.turn % 2 === 0) return 'X';
  return 'O';
}

function handleWinner() {
  const winner = currentGame.winningPlayer();

  if (winner) {
    postGameUpdate();
    modal.title.textContent = winner === 'draw' ? 'Draw' : `Player ${winner} won!`;
    modal.object.show();
  }
}

function fetchGame(id) {
  fetch('/games')
    .then((response) => response.json())
    .then((response) => {
      if (response[id]) {
        loadGame(response[id], id);
      } else {
        currentGame = new Game(id);
        postGameUpdate();
        fetchGame(id);
      }
    })
    .catch((error) => console.error(error));
}

function loadGame(newGame, id) {
  slotButtons.forEach((button) => {
    button.innerHTML = '';
    button.setAttribute('placed', 'false');
  });

  currentGame = new Game(id);
  currentGame.game.playerSlots = { ...newGame.playerSlots };

  const gameFull = newGame.playerSlots.X && newGame.playerSlots.O;
  if (gameFull) {
    currentGame.player = '';
  } else {
    let availableSlots = [];

    for (const [slot, isOccupied] of Object.entries(newGame.playerSlots)) {
      if (!isOccupied) availableSlots.push(slot);
    }

    const index = Math.round(Math.random() * (availableSlots.length - 1));
    console.log(availableSlots, index, newGame.playerSlots);
    currentGame.pickPlayer(availableSlots[index]);
  }

  newGame.board.forEach((piece, index) => {
    if (piece) switchButtonState(slotButtons[index], index, piece);
  });

  updateMessageDisplay();
  postGameUpdate();
}

function postGameUpdate() {
  const request = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(currentGame),
  };

  fetch('/games', request).catch((error) => console.error(error));
}

function doGameUpdate(serverGame) {
  if (serverGame.id !== currentGame.id) return;

  serverGame.game.board.forEach((piece, slot) => {
    if (piece && piece !== currentGame.game.board[slot]) {
      switchButtonState(slotButtons[slot], slot, piece);
    }
  });
}
