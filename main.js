// Board

const board = document.getElementById('board')

function createBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div')

      cell.classList.add('cell')

      const isWhite = (row + col) % 2 === 0
      cell.classList.add(isWhite ? 'white' : 'black')

      // пригодится дальше
      cell.dataset.row = row
      cell.dataset.col = col

      board.appendChild(cell)
    }
  }
}

createBoard()
