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

const boardState = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
]

function renderPieces() {
  const cells = document.querySelectorAll('.cell')

  cells.forEach((cell) => {
    // deleting old pieces
    const piece = cell.querySelector('img')

    if (piece) {
      piece.remove()
    }
  })

  boardState.forEach((row, r) => {
    row.forEach((piece, c) => {
      if (!piece) return

      const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`)

      const img = document.createElement('img')
      img.src = `assets/pieces/${piece}.svg`
      img.classList.add('piece')

      cell.appendChild(img)
    })
  })
}

createBoard()
renderPieces()
