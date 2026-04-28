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

let selectedPiece = null

function renderBoard() {
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

board.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell')

  if (!cell) return

  const row = Number(cell.dataset.row)
  const col = Number(cell.dataset.col)

  const clickedPiece = boardState[row][col]

  if (selectedPiece) {
    const { row: fromRow, col: fromCol } = selectedPiece

    boardState[row][col] = boardState[fromRow][fromCol]
    boardState[fromRow][fromCol] = null

    selectedPiece = null

    clearHighlights()
    renderBoard()

    return
  }

  if (clickedPiece) {
    selectedPiece = { row, col }

    clearHighlights()

    cell.classList.add('selected')
  }
})

function clearHighlights() {
  document.querySelectorAll('.cell').forEach((cell) => {
    cell.classList.remove('selected')
  })
}

createBoard()
renderBoard()
