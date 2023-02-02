export default class Game {
  id;
  player = '';
  game = {
    turn: 0,
    finished: false,
    board: Array(9).fill(''),
    playerSlots: {
      X: false,
      O: false,
    },
  };
  winningCombinations = [
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  constructor(id) {
    this.id = id;
  }

  nextTurn() {
    this.game.turn += 1;
  }

  placePiece(slot, piece) {
    this.game.board[slot] = piece;
    this.nextTurn();
  }

  pickPlayer(player) {
    this.game.playerSlots[player] = true;
    this.player = player;
  }

  playerLeft(player) {
    this.game.playerSlots[player] = false;
  }

  winningPlayer() {
    let winner = '';

    this.winningCombinations.forEach((combination) => {
      const player = this.game.board[combination[0]];
      if (combination.every((slot) => this.game.board[slot] === player)) {
        winner = player;
      }
    });

    if (!winner && this.game.board.every((slot) => slot)) {
      winner = 'draw';
    }

    if (winner) {
      this.game.finished = true;
    }

    return winner;
  }
}
