const game = new Chess()

console.log(game.fen())

// Board

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

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

      if (row === 7) {
        const letter = document.createElement('span')
        letter.textContent = letters[col]
        letter.classList.add('coord', 'letter')
        cell.appendChild(letter)
      }

      if (col === 0) {
        const number = document.createElement('span')
        number.textContent = 8 - row
        number.classList.add('coord', 'number')
        cell.appendChild(number)
      }

      board.appendChild(cell)
    }
  }
}

// const boardState = [
//   ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
//   ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
//   [null, null, null, null, null, null, null, null],
//   [null, null, null, null, null, null, null, null],
//   [null, null, null, null, null, null, null, null],
//   [null, null, null, null, null, null, null, null],
//   ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
//   ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
// ]

// let selectedPiece = null

let selectedSquare = null

let lastMove = null

function renderBoard() {
  const cells = document.querySelectorAll('.cell')

  cells.forEach((cell) => {
    const piece = cell.querySelector('img')

    if (piece) {
      piece.remove()
    }
  })

  const boardState = game.board()

  document.querySelectorAll('.cell').forEach((cell) => {
    cell.classList.remove('last-move')
  })

  boardState.forEach((row, r) => {
    row.forEach((piece, c) => {
      if (!piece) return

      const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`)

      const img = document.createElement('img')

      img.src = `assets/pieces/${piece.color}${piece.type}.svg`

      img.classList.add('piece')

      cell.appendChild(img)
    })
  })

  if (lastMove) {
    highlightLastMove(lastMove.from)
    highlightLastMove(lastMove.to)
  }
}

function highlightLastMove(square) {
  const file = square.charCodeAt(0) - 97
  const rank = 8 - Number(square[1])

  const cell = document.querySelector(
    `[data-row="${rank}"][data-col="${file}"]`,
  )

  if (cell) {
    cell.classList.add('last-move')
  }
}

function toSquare(row, col) {
  return letters[col] + (8 - row)
}

board.addEventListener('click', (e) => {
  const cell = e.target.closest('.cell')

  if (!cell) return

  const row = Number(cell.dataset.row)
  const col = Number(cell.dataset.col)

  const square = toSquare(row, col)

  // If piece is selected -> try to make a move
  if (selectedSquare) {
    const move = game.move({
      from: selectedSquare,
      to: square,
      promotion: 'q',
    })

    clearHighlights()

    selectedSquare = null

    if (move) {
      lastMove = move

      renderBoard()
    }

    return
  }

  const piece = game.get(square)

  if (piece) {
    selectedSquare = square

    clearHighlights()

    cell.classList.add('selected')

    highlightMoves(square)
  }
})

function highlightMoves(square) {
  const moves = game.moves({
    square,
    verbose: true,
  })

  moves.forEach((move) => {
    const targetSquare = move.to

    const file = targetSquare.charCodeAt(0) - 97
    const rank = 8 - Number(targetSquare[1])

    const cell = document.querySelector(
      `[data-row="${rank}"][data-col="${file}"]`,
    )

    if (cell) {
      cell.classList.add('move')
    }
  })
}

function clearHighlights() {
  document.querySelectorAll('.cell').forEach((cell) => {
    cell.classList.remove('selected')
    cell.classList.remove('move')
  })
}

createBoard()
renderBoard()
