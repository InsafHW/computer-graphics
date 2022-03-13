import {PuzzleGame} from './PuzzleGame.js'

const canvas = document.getElementById('canvas')
const solveBtn = document.getElementById('solve-btn')
const shuffleBtn = document.getElementById('shuffle-btn')
const newBtn = document.getElementById('new-btn')
const refreshBtn = document.getElementById('refresh-btn')

const puzzleGame = new PuzzleGame(canvas, solveBtn, shuffleBtn, newBtn, refreshBtn)
puzzleGame.startGame()
