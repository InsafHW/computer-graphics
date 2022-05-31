import { getRandomArrayItem, getRandomRgba, rotate } from './utils.js'
import { tetrominos, tetrominoNames } from './tetrominos.js'

const playfield = []

// заполняем сразу массив пустыми ячейками

const gameState = {
  pause: false,
  gameOver: false,
  animationFrame: null,
  tetromino: null,
  nextTetromino: null,
  gameFps: 35,
  score: 0,
  playfield: [],
  level: 1,
}

function init() {
  for (let row = -2; row < 20; row++) {
    playfield[row] = []

    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0
    }
  }

  const currentTetrominoName = getRandomArrayItem(tetrominoNames)
  const currentTetrominoMatrix = tetrominos.get(currentTetrominoName)
  gameState.tetromino = {
    name: currentTetrominoName,
    matrix: currentTetrominoMatrix,
    row: currentTetrominoName === 'I' ? -1 : -2,
    col:
      playfield[0].length / 2 - Math.ceil(currentTetrominoMatrix[0].length / 2),
    color: getRandomRgba(),
  }

  const nextTetrominoName = getRandomArrayItem(tetrominoNames)
  const nextTetrominoMatrix = tetrominos.get(nextTetrominoName)
  gameState.nextTetromino = {
    name: nextTetrominoName,
    matrix: nextTetrominoMatrix,
    row: nextTetrominoName === 'I' ? -1 : -2,
    col: playfield[0].length / 2 - Math.ceil(nextTetrominoMatrix[0].length / 2),
    color: getRandomRgba(),
  }
}
init()

const grid = 48

const canvas = document.getElementById('game')
const context = canvas.getContext('2d')

function drawSides() {
  context.lineWidth = 1
  context.strokeStyle = 'green'
  context.fillStyle = 'violet'

  for (let i = 0; i < 20 + 1; i++) {
    context.strokeRect(0, i * grid, grid, grid)
    context.fillRect(1, 1 + i * grid, 46, 46)

    context.strokeRect(530 + 1, i * grid, grid, grid)
    context.fillRect(530 + 2, 1 + i * grid, 46, 46)

    if (i < 10) {
      context.strokeRect(50 + i * grid, 960, grid, 48)
      context.fillRect(50 + i * grid + 1, 960 + 1, 46, 46)
    }
  }
}

function drawInfoSection() {
  const { level, score, nextTetromino } = gameState
  context.font = '24px Arial'
  context.fillStyle = 'black'
  context.fillText(`Level: ${level}`, 650, 200)
  context.fillText('Lines left: N', 650, 250)
  context.fillText(`Score: ${score}`, 650, 300)
  context.fillText('Next: ', 650, 350)

  context.fillStyle = 'orange'
  for (let row = 0; row < nextTetromino.matrix.length; row++) {
    for (let col = 0; col < nextTetromino.matrix[row].length; col++) {
      if (nextTetromino.matrix[row][col]) {
        context.fillRect(
          (col * grid) / 2 + 720,
          (row * grid) / 2 + 320,
          grid / 2 - 1,
          grid / 2 - 1
        )
      }
    }
  }
}
const SCORES_FOR_DELETE_ROWS = {
  1: 10,
  2: 30,
  3: 70,
  4: 150,
}

// счётчик
let count = 0

function getNextTetromino() {
  const prevTetromino = { ...gameState.nextTetromino }

  const name = getRandomArrayItem(tetrominoNames)
  const matrix = tetrominos.get(name)
  gameState.nextTetromino = {
    name,
    matrix,
    row: name === 'I' ? -1 : -2,
    col: playfield[0].length / 2 - Math.ceil(matrix[0].length / 2),
    color: getRandomRgba(),
  }

  return prevTetromino
}

function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        // если выходит за границы поля…
        (cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          // …или пересекается с другими фигурами
          playfield[cellRow + row][cellCol + col])
      ) {
        // то возвращаем, что нет, так не пойдёт
        return false
      }
    }
  }
  return true
}

function placeTetromino() {
  const { tetromino } = gameState
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        // если край фигуры после установки вылезает за границы поля, то игра закончилась
        if (tetromino.row + row < 0) {
          return showGameOver()
        }
        // если всё в порядке, то записываем в массив игрового поля нашу фигуру
        playfield[tetromino.row + row][tetromino.col + col] = {
          name: tetromino.name,
          color: tetromino.color,
        }
      }
    }
  }

  // проверяем, чтобы заполненные ряды очистились снизу вверх
  let deletedRowsCount = 0
  for (let row = playfield.length - 1; row >= 0; ) {
    // если ряд заполнен
    const rowFullyFilled = playfield[row].every((cell) => !!cell)
    if (rowFullyFilled) {
      deletedRowsCount++
      // очищаем его и опускаем всё вниз на одну клетку
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c]
        }
      }
    } else {
      // переходим к следующему ряду
      row--
    }
  }
  if (deletedRowsCount) {
    gameState.score += SCORES_FOR_DELETE_ROWS[deletedRowsCount]
  }
  gameState.tetromino = getNextTetromino()
}

function showModalMessage(message) {
  context.fillStyle = 'black'
  context.globalAlpha = 0.75
  context.fillRect(0, canvas.height / 2 - 30, 580, 60)
  context.globalAlpha = 1
  context.fillStyle = 'white'
  context.font = '36px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(message, 580 / 2, canvas.height / 2)
}

// показываем надпись Game Over
function showGameOver() {
  cancelAnimationFrame(gameState.animationFrame)
  gameState.gameOver = true
  showModalMessage('Game over')
  if (confirm('Начать занового?')) {
    init()
    gameState.score = 0
    gameState.gameOver = false
    gameState.pause = false
    gameState.level = 1
    gameState.animationFrame = requestAnimationFrame(loop)
  } else {
    window.close()
  }
}

function loop() {
  gameState.animationFrame = requestAnimationFrame(loop)
  if (gameState.pause) {
    return showModalMessage('Press "P" to continue')
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  drawInfoSection()
  drawSides()

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col].name) {
        context.fillStyle = playfield[row][col].color
        context.fillRect(col * grid + 50, row * grid, grid - 1, grid - 1)
      }
    }
  }

  const { tetromino } = gameState
  if (tetromino) {
    if (++count > gameState.gameFps) {
      tetromino.row++
      count = 0

      // если движение закончилось — рисуем фигуру в поле и проверяем, можно ли удалить строки
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--
        placeTetromino()
      }
    }

    context.fillStyle = tetromino.color
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect(
            (tetromino.col + col) * grid + 50,
            (tetromino.row + row) * grid,
            grid - 1,
            grid - 1
          )
        }
      }
    }
  }
}

document.addEventListener('keydown', function (e) {
  const keyCodes = {
    arrowLeft: 37,
    arrowUp: 38,
    arrowRight: 39,
    arrowDown: 40,
    p: 80,
  }

  if (gameState.gameOver) return

  const { which } = e
  const { tetromino } = gameState

  if (which === keyCodes.arrowLeft) {
    const newColumn = tetromino.col - 1
    if (isValidMove(tetromino.matrix, tetromino.row, newColumn)) {
      tetromino.col = newColumn
    }
  } else if (which === keyCodes.arrowRight) {
    const newColumn = tetromino.col + 1
    if (isValidMove(tetromino.matrix, tetromino.row, newColumn)) {
      tetromino.col = newColumn
    }
  } else if (which === keyCodes.arrowUp) {
    const newMatrix = rotate(tetromino.matrix)
    if (isValidMove(newMatrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = newMatrix
    }
  } else if (which === keyCodes.arrowDown) {
    const newRow = tetromino.row + 1
    if (isValidMove(tetromino.matrix, newRow, tetromino.col)) {
      tetromino.row = newRow
    } else {
      tetromino.row = newRow - 1
      placeTetromino()
    }
  } else if (which === keyCodes.p) {
    gameState.pause = !gameState.pause
  }
})

gameState.animationFrame = requestAnimationFrame(loop)
