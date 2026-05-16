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

let selectedSquare = null
let draggedSquare = null

let lastMove = null

let historyStates = [game.fen()]
let currentMoveIndex = 0

let viewerGame = new Chess()
let isViewingHistory = false

let gameEnded = false

const moveSound = new Audio('assets/sounds/move.wav')

let capturedPieces = {
  w: [],
  b: [],
}

function renderBoard() {
  const cells = document.querySelectorAll('.cell')

  cells.forEach((cell) => {
    const piece = cell.querySelector('img')

    if (piece) {
      piece.remove()
    }
  })

  const currentGame = isViewingHistory ? viewerGame : game
  const boardState = currentGame.board()

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
      img.draggable = true

      img.addEventListener('dragstart', () => {
        draggedSquare = toSquare(r, c)
      })

      cell.appendChild(img)
    })
  })

  if (lastMove) {
    highlightLastMove(lastMove.from)
    highlightLastMove(lastMove.to)
  }
}

function renderHistory() {
  const historyEl = document.getElementById('history')
  historyEl.innerHTML = ''

  const moves = game.history()

  for (let i = 0; i < moves.length; i += 2) {
    const row = document.createElement('div')
    row.classList.add('move-row')

    const moveNumber = document.createElement('span')
    moveNumber.classList.add('move-number')
    moveNumber.textContent = `${Math.floor(i / 2) + 1}.`

    const whiteMove = document.createElement('span')
    whiteMove.classList.add('history-move')
    whiteMove.textContent = moves[i]

    const moveIndex = i + 1

    whiteMove.addEventListener('click', () => {
      goToMove(moveIndex)
    })

    row.appendChild(moveNumber)
    row.appendChild(whiteMove)

    if (moves[i + 1]) {
      const blackMove = document.createElement('span')
      blackMove.classList.add('history-move')
      blackMove.textContent = moves[i + 1]

      const moveIndex = i + 2

      blackMove.addEventListener('click', () => {
        goToMove(moveIndex)
      })

      row.appendChild(blackMove)
    }

    historyEl.appendChild(row)
  }
}

function updateStatus() {
  const currentGame = isViewingHistory ? viewerGame : game
  const statusEl = document.getElementById('status')

  if (currentGame.in_checkmate()) {
    statusEl.textContent = 'Checkmate'
  } else if (currentGame.in_draw()) {
    statusEl.textContent = 'Draw'
  } else if (currentGame.in_check()) {
    statusEl.textContent = 'Check'
  } else {
    statusEl.textContent =
      game.turn() === 'w' ? 'White to move' : 'Black to move'
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
  if (gameEnded) return

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
      if (move.captured) {
        capturedPieces[move.color].push(move.captured)
      }

      isViewingHistory = false
      lastMove = move

      historyStates = historyStates.slice(0, currentMoveIndex + 1)

      historyStates.push(game.fen())
      currentMoveIndex++

      renderBoard()
      renderHistory()
      renderCapturedPieces()
      updateStatus()
      playMoveSound()

      checkGameOver()
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

function goToMove(index) {
  viewerGame.load(historyStates[index])

  currentMoveIndex = index
  isViewingHistory = true

  renderBoard()
  renderHistory()
  updateStatus()
}

function clearHighlights() {
  document.querySelectorAll('.cell').forEach((cell) => {
    cell.classList.remove('selected')
    cell.classList.remove('move')
  })
}

createBoard()
renderBoard()

const cells = document.querySelectorAll('.cell')

cells.forEach((cell) => {
  if (gameEnded) return

  cell.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  cell.addEventListener('drop', () => {
    if (!draggedSquare) return

    const row = Number(cell.dataset.row)
    const col = Number(cell.dataset.col)

    const targetSquare = toSquare(row, col)

    const move = game.move({
      from: draggedSquare,
      to: targetSquare,
      promotion: 'q',
    })

    clearHighlights()
    selectedSquare = null

    if (move) {
      if (move.captured) {
        capturedPieces[move.color].push(move.captured)
      }

      isViewingHistory = false
      lastMove = move

      historyStates = historyStates.slice(0, currentMoveIndex + 1)

      historyStates.push(game.fen())
      currentMoveIndex++

      renderBoard()
      renderHistory()
      renderCapturedPieces()
      updateStatus()
      playMoveSound()

      checkGameOver()
    }

    draggedSquare = null
  })
})

function syncToCurrentGame() {
  viewerGame.load(game.fen())

  currentMoveIndex = historyStates.length - 1

  renderBoard()
  renderHistory()
  updateStatus()
}

// Controls
document.getElementById('startBtn').addEventListener('click', () => {
  goToMove(0)
})

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentMoveIndex > 0) {
    goToMove(currentMoveIndex - 1)
  }
})

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentMoveIndex < historyStates.length - 1) {
    goToMove(currentMoveIndex + 1)
  }
})

document.getElementById('endBtn').addEventListener('click', () => {
  isViewingHistory = false

  syncToCurrentGame()
})

function playMoveSound() {
  moveSound.currentTime = 0
  moveSound.play()
}

function renderCapturedPieces() {
  const whiteEl = document.getElementById('whiteCaptured')
  const blackEl = document.getElementById('blackCaptured')

  whiteEl.innerHTML = ''
  blackEl.innerHTML = ''

  capturedPieces.w.forEach((piece) => {
    const img = document.createElement('img')

    img.src = `assets/pieces/b${piece}.svg`

    whiteEl.appendChild(img)
  })

  capturedPieces.b.forEach((piece) => {
    const img = document.createElement('img')

    img.src = `assets/pieces/w${piece}.svg`

    blackEl.appendChild(img)
  })
}

function showGameOver(title, text) {
  const modal = document.getElementById('gameOverModal')

  document.getElementById('gameOverTitle').textContent = title
  document.getElementById('gameOverText').textContent = text

  modal.classList.remove('hidden')
}

function checkGameOver() {
  if (game.in_checkmate()) {
    gameEnded = true
    const winner = game.turn() === 'w' ? 'Black' : 'White'

    showGameOver('Checkmate', `${winner} wins`)
  } else if (game.in_stalemate()) {
    gameEnded = true
    showGameOver('Draw', 'Stalemate')
  } else if (game.in_threefold_repetition()) {
    gameEnded = true
    showGameOver('Draw', 'Threefold repetition')
  } else if (game.insufficient_material()) {
    gameEnded = true
    showGameOver('Draw', 'Insufficient material')
  } else if (game.in_draw()) {
    gameEnded = true
    showGameOver('Draw', '50-move rule')
  }
}

document.getElementById('newGameBtn').addEventListener('click', () => {
  location.reload()
})

document.getElementById('reviewBtn').addEventListener('click', () => {
  document.getElementById('gameOverModal').classList.add('hidden')
})

// Resign btn
document.getElementById('resignBtn').addEventListener('click', () => {
  if (gameEnded) return

  const winner = game.turn() === 'w' ? 'Black' : 'White'

  gameEnded = true

  showGameOver('Resignation', `${winner} wins`)
})

// Offer draw btn
document.getElementById('drawBtn').addEventListener('click', () => {
  if (gameEnded) return

  const accepted = confirm('Accept draw?')

  if (!accepted) return

  gameEnded = true

  showGameOver('Draw', 'Draw agreed')
})

// PGN

document.getElementById('exportPgnBtn').addEventListener('click', async () => {
  const pgn = game.pgn()

  await navigator.clipboard.writeText(pgn)

  alert('PGN copied to clipboard')
})

document.getElementById('importPgnBtn').addEventListener('click', () => {
  const pgnInput = document.getElementById('pgnInput')

  try {
    game.load_pgn(pgnInput.value)
  } catch (error) {
    alert('Invalid PGN')

    return
  }

  historyStates = [new Chess().fen()]

  const tempGame = new Chess()

  game.history().forEach((move) => {
    tempGame.move(move)

    historyStates.push(tempGame.fen())
  })

  currentMoveIndex = historyStates.length - 1

  isViewingHistory = false

  capturedPieces = {
    w: [],
    b: [],
  }

  renderBoard()
  renderHistory()
  renderCapturedPieces()
  updateStatus()
})
