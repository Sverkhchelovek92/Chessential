// Board

const board = document.getElementById('board')

function createBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div')

      cell.classList.add('cell')

      const isWhite = (row + col) % 2 === 0
      cell.classList.add(isWhite ? 'white' : 'black')

      // Rows and columns
      cell.dataset.row = row
      cell.dataset.col = col

      board.appendChild(cell)
    }
  }
}

createBoard()

const initialPosition = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
]
