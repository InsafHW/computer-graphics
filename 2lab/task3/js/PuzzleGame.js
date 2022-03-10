import {Piece} from './Piece.js'

class PuzzleGame {
    constructor(canvas, solveBtn, shuffleBtn) {
        this.canvas = canvas
        this.solveBtn = solveBtn
        this.shuffleBtn = shuffleBtn
        this.context = this.canvas.getContext('2d')
        this.pieces = []
        this.popSound = new Audio('./assets/sounds/pop.mp3')
        this.winSound = new Audio('./assets/sounds/win.mp3')
        this.photos = [
            './assets/images/photo1.jpg',
            './assets/images/photo2.jpg',
            './assets/images/photo3.jpg'
        ]
        this.scale = 0.7
        this.size = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rows: 3,
            columns: 3
        }
        this.selectedPiece = null
        this.currentLevel = 0
        this.image = null
    }

    getPressedPiece = (loc) => {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i]
            const isXPositionInside = loc.x > piece.x && loc.x < piece.x + piece.width
            const isYPositionInside = loc.y > piece.y && loc.y < piece.y + piece.height
            if (isXPositionInside && isYPositionInside) {
                return piece
            }
        }
        return null
    }

    isComplete = () => {
        return !this.pieces.some(p => !p.correct)
    }

    onSolvePuzzle = () => {
        const isMorePhotos = this.currentLevel < this.photos.length - 1
        const timeout = 500
        requestAnimationFrame(() => {
            setTimeout(() => {
                alert('Congrats!')
                if (isMorePhotos) {
                    if (confirm('Do you want to go to another level?')) {
                        this.image.src = this.photos[++this.currentLevel]
                    } else {
                        document.body.style.pointerEvents = 'none'
                    }
                } else {
                    alert('You won the whole game!')
                    document.body.style.pointerEvents = 'none'
                }
            }, timeout)
        })
    }

    onMouseDown = (event) => {
        this.selectedPiece = this.getPressedPiece(event)
        if (this.selectedPiece != null) {
            const index = this.pieces.indexOf(this.selectedPiece)
            if (index !== -1) {
                this.pieces.splice(index, 1)
                this.pieces.push(this.selectedPiece)
            }
            this.selectedPiece.offset = {
                x: event.x - this.selectedPiece.x,
                y: event.y - this.selectedPiece.y
            }
            this.selectedPiece.correct = false
        }
    }

    onMouseMove = (event) => {
        if (this.selectedPiece != null) {
            this.selectedPiece.x = event.x - this.selectedPiece.offset.x
            this.selectedPiece.y = event.y - this.selectedPiece.offset.y
        }
    }

    onMouseUp = () => {
        if (this.selectedPiece.isClose()) {
            this.selectedPiece.snap()
            this.popSound.play()
            console.log(this.isComplete())
            if (this.isComplete()) {
                this.winSound.play()
                this.onSolvePuzzle()
            }
        }
        this.selectedPiece = null
    }

    solvePuzzle = () => {
        this.pieces.forEach(p => p.placeIntoRightPosition())
        this.winSound.play()
        this.onSolvePuzzle()
    }

    randomizePieces = () => {
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i]
            const loc = {
                x: Math.random() * (this.canvas.width - piece.width),
                y: Math.random() * (this.canvas.height - piece.height)
            }
            piece.x = loc.x
            piece.y = loc.y
            piece.correct = false
        }
    }

    initEventListeners = () => {
        this.canvas.addEventListener('mousedown', this.onMouseDown)
        this.canvas.addEventListener('mousemove', this.onMouseMove)
        this.canvas.addEventListener('mouseup', this.onMouseUp)
        this.solveBtn.addEventListener('click', this.solvePuzzle)
        this.shuffleBtn.addEventListener('click', this.randomizePieces)
    }

    handleResize = () => {
        this.canvas.width = innerWidth - 110
        this.canvas.height = innerHeight

        const resizer = this.scale *
            Math.min(
                innerWidth / this.image.width,
                innerHeight / this.image.height
            )
        this.size.width = resizer * this.image.width
        this.size.height = resizer * this.image.height
        this.size.x = innerWidth / 2 - this.size.width / 2
        this.size.y = innerHeight / 2 - this.size.height / 2
    }

    initializePieces = (rows, cols) => {
        this.size.rows = rows
        this.size.columns = cols

        this.pieces.splice(0, this.pieces.length)
        for (let i = 0; i < this.size.rows; i++) {
            for (let j = 0; j < this.size.columns; j++) {
                this.pieces.push(new Piece(i, j, this.size))
            }
        }
    }

    updateGame = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.context.beginPath()
        this.context.rect(this.size.x, this.size.y, this.size.width, this.size.height)
        this.context.stroke()

        this.pieces.forEach(p => p.draw(this.context, this.image))

        requestAnimationFrame(this.updateGame)
    }

    startGame = () => {
        this.initEventListeners()

        this.image = new Image()

        this.image.onload = () => {
            const rows = this.size.rows * (this.currentLevel + 1)
            const columns = this.size.columns * (this.currentLevel + 1)

            this.handleResize()
            this.initializePieces(rows, columns)
            this.randomizePieces()
            this.updateGame()
        }

        this.image.src = this.photos[this.currentLevel]
    }
}

export {
    PuzzleGame
}
