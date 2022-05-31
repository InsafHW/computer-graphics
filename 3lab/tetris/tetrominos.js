/**
 * @typedef {'I' | 'J'| 'L' | 'O'| 'S'| 'T' | 'Z'}
 */
let TetrominoName

/** @type {Map<TetrominoName, Array<Array<number>} */
const tetrominos = new Map()

tetrominos.set('I', [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
])

tetrominos.set('J', [
  [1, 0, 0],
  [1, 1, 1],
  [0, 0, 0],
])

tetrominos.set('L', [
  [0, 0, 1],
  [1, 1, 1],
  [0, 0, 0],
])

tetrominos.set('O', [
  [1, 1],
  [1, 1],
])

tetrominos.set('S', [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0],
])

tetrominos.set('Z', [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
])

tetrominos.set('T', [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0],
])

const tetrominoNames = /** @type {Array<TetrominoName>} */ ([
  'I',
  'J',
  'L',
  'O',
  'S',
  'T',
  'Z',
])

export { tetrominos, tetrominoNames }
