import { getRandomArrayItem, getRandomRgba, rotate } from './utils.js'
import { tetrominos, tetrominoNames } from './tetrominos.js'
import {
  levelsConditionMap,
  SCORES_FOR_DELETE_ROWS,
  LEVEL_PASSED_MULTIPLIER,
} from './rules.js'

const BLOCK_SIZE = 48
const COLUMNS_COUNT = 10
const ROWS_COUNT = 20
const canvas = document.getElementById('game')
const context = canvas.getContext('2d')
const gameOverSound = new Audio('./assets/sounds/game-over.mp3')
const stageClearSound = new Audio('./assets/sounds/stage-clear.mp3')
const popSound = new Audio('./assets/sounds/pop.mp3')
const newLevelSound = new Audio('./assets/sounds/new-level.mp3')

const gameState = {
  pause: false,
  gameOver: false,
  animationFrame: null,
  tetromino: null,
  nextTetromino: null,
  gameFps: levelsConditionMap.get(1),
  score: 0,
  playfield: [],
  level: 1,
  count: 0,
  destroyedLinesCount: 0,
}

function init() {
  gameState.score = 0
  gameState.gameOver = false
  gameState.pause = false
  gameState.level = 1
  gameState.count = 0
  gameState.gameFps = levelsConditionMap.get(1).levelFps
  gameState.destroyedLinesCount = 0
  gameState.animationFrame = requestAnimationFrame(loop)

  const { playfield } = gameState

  for (let row = -2; row < ROWS_COUNT; row++) {
    playfield[row] = []

    for (let col = 0; col < COLUMNS_COUNT; col++) {
      playfield[row][col] = ''
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

function drawSides() {
  context.strokeStyle = 'green'
  context.fillStyle = 'violet'

  for (let i = 0; i < ROWS_COUNT + 1; i++) {
    context.strokeRect(0, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    context.fillRect(1, 1 + i * BLOCK_SIZE, 46, 46)

    context.strokeRect(530 + 1, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    context.fillRect(530 + 2, 1 + i * BLOCK_SIZE, 46, 46)

    if (i < 10) {
      context.strokeRect(50 + i * BLOCK_SIZE, 960, BLOCK_SIZE, 48)
      context.fillRect(50 + i * BLOCK_SIZE + 1, 960 + 1, 46, 46)
    }
  }
}

function drawInfoSection() {
  const { level, score, nextTetromino } = gameState
  const linesLeft =
    levelsConditionMap.get(gameState.level).linesToDestroy -
    gameState.destroyedLinesCount
  context.font = '24px Arial'
  context.fillStyle = 'black'
  context.fillText(`Level: ${level}`, 650, 200)
  context.fillText(`Lines left: ${linesLeft}`, 650, 250)
  context.fillText(`Score: ${score}`, 650, 300)
  context.fillText('Next: ', 650, 350)

  context.fillStyle = 'orange'
  for (let row = 0; row < nextTetromino.matrix.length; row++) {
    for (let col = 0; col < nextTetromino.matrix[row].length; col++) {
      if (nextTetromino.matrix[row][col]) {
        context.fillRect(
          (col * BLOCK_SIZE) / 2 + 720,
          (row * BLOCK_SIZE) / 2 + 320,
          BLOCK_SIZE / 2 - 1,
          BLOCK_SIZE / 2 - 1
        )
      }
    }
  }
}

function getNextTetromino() {
  const { playfield } = gameState
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
  const { playfield } = gameState

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const hasBlock = matrix[row][col]
      const isLeftOut = cellCol + col < 0
      const isRightOut = cellCol + col >= playfield[0].length
      const isBottomOut = cellRow + row >= playfield.length
      const isOutOfPlayfield = isLeftOut || isRightOut || isBottomOut
      const intersectsWithOtherBlocks =
        isBottomOut || playfield[cellRow + row][cellCol + col]
      if (hasBlock && (isOutOfPlayfield || intersectsWithOtherBlocks)) {
        return false
      }
    }
  }
  return true
}

function placeTetromino() {
  popSound.play()
  const { tetromino, playfield } = gameState
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        const isOutOfPlayfield = tetromino.row + row < 0
        if (isOutOfPlayfield) {
          return showGameOver()
        }
        playfield[tetromino.row + row][tetromino.col + col] = tetromino.color
      }
    }
  }

  let deletedRowsCount = 0
  for (let row = playfield.length - 1; row >= 0; ) {
    const rowFullyFilled = playfield[row].every((cell) => !!cell)
    if (rowFullyFilled) {
      deletedRowsCount++
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1][c]
        }
      }
    } else {
      row--
    }
  }

  if (deletedRowsCount > 0) {
    gameState.destroyedLinesCount += deletedRowsCount
    const finishedLevel =
      gameState.destroyedLinesCount >=
      levelsConditionMap.get(gameState.level).linesToDestroy
    if (finishedLevel) {
      newLevelSound.play()
      gameState.level++
      gameState.gameFps = levelsConditionMap.get(gameState.level).levelFps

      let clearRowsCount = 0
      for (let row = 0; row < ROWS_COUNT; row++) {
        let rowEmpty = true
        for (let col = 0; col < COLUMNS_COUNT; col++) {
          if (gameState.playfield[row][col]) {
            rowEmpty = false
            gameState.playfield[row][col] = ''
          }
        }
        if (rowEmpty) {
          clearRowsCount++
        }
      }
      gameState.destroyedLinesCount = 0
      gameState.score += clearRowsCount * LEVEL_PASSED_MULTIPLIER
    } else {
      stageClearSound.play()
    }
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

function showGameOver() {
  gameOverSound.play()
  cancelAnimationFrame(gameState.animationFrame)
  gameState.gameOver = true
  showModalMessage('Game over')
  if (confirm('Начать заново?')) {
    init()
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

  const { playfield } = gameState

  for (let row = 0; row < ROWS_COUNT; row++) {
    for (let col = 0; col < COLUMNS_COUNT; col++) {
      if (playfield[row][col]) {
        context.fillStyle = playfield[row][col]
        context.fillRect(
          col * BLOCK_SIZE + 50,
          row * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        )
      }
    }
  }

  const { tetromino } = gameState
  if (tetromino) {
    if (++gameState.count > gameState.gameFps) {
      tetromino.row++
      gameState.count = 0

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
            (tetromino.col + col) * BLOCK_SIZE + 50,
            (tetromino.row + row) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
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

init()
