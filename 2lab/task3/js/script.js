import {PuzzleGame} from './PuzzleGame.js'

const canvas = document.getElementById('canvas')
const solveBtn = document.getElementById('solve-btn')
const shuffleBtn = document.getElementById('shuffle-btn')

const puzzleGame = new PuzzleGame(canvas, solveBtn, shuffleBtn)
puzzleGame.startGame()
