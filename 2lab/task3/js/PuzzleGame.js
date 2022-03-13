import {Piece} from './Piece.js'

class PuzzleGame {
    popSound = new Audio('./assets/sounds/pop.mp3')
    winSound = new Audio('./assets/sounds/win.mp3')
    pieces = []
    photos = [
        './assets/images/photo1.jpg',
        './assets/images/photo2.jpg',
        './assets/images/photo3.jpg',
        './assets/images/photo4.jpg'
    ]
    scale = 0.7
    size = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rows: 3,
        columns: 3
    }
    selectedPiece = null
    currentLevel = 0
    image = null

    constructor(canvas, solveBtn, shuffleBtn, newBtn, refreshBtn) {
        this.canvas = canvas
        this.solveBtn = solveBtn
        this.shuffleBtn = shuffleBtn
        this.newBtn = newBtn
        this.refreshBtn = refreshBtn
        this.context = this.canvas.getContext('2d')
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

    showWinningModal = () => {
        const modal = document.getElementById('modal')

        const modalContainer = document.createElement('div')
        const buttonContainer = document.createElement('div')
        const refreshGameBtn = document.createElement('button')
        const cancelBtn = document.createElement('button')
        const text = document.createElement('p')

        this.canvas.style.pointerEvents = 'none'
        cancelBtn.innerText = 'No'
        refreshGameBtn.innerText = 'Yes'
        buttonContainer.appendChild(cancelBtn)
        buttonContainer.appendChild(refreshGameBtn)
        buttonContainer.className = 'modal-buttons-container'
        text.innerText = 'You won the game! Do you want to start again?'
        modalContainer.appendChild(text)
        modalContainer.appendChild(buttonContainer)
        modalContainer.className = 'modal-content'

        cancelBtn.addEventListener('click', () => {
            this.changeButtonAccessibility(this.shuffleBtn, false)
            this.changeButtonAccessibility(this.solveBtn, false)
            this.changeButtonAccessibility(this.newBtn, false)
            modal.removeChild(modalContainer)
            modal.classList.remove('visible')
        })
        refreshGameBtn.addEventListener('click', () => {
            this.refreshGame()
            modal.removeChild(modalContainer)
            modal.classList.remove('visible')
            this.canvas.style.pointerEvents = 'all'
        })
        modal.appendChild(modalContainer)
        modal.classList.add('visible')
    }

    onSolvePuzzle = () => {
        const isMorePhotos = this.currentLevel < this.photos.length - 1
        const timeout = 500
        requestAnimationFrame(() => {
            setTimeout(() => {
                alert('Congrats!')
                if (isMorePhotos) {
                    if (confirm('Do you want to go to another level?')) {
                        this.changePuzzlePhoto()
                    } else {
                        this.canvas.style.pointerEvents = 'none'
                    }
                } else {
                    this.showWinningModal()
                }
            }, timeout)
        })
    }

    refreshGame = () => {
        this.currentLevel = 0
        this.image.src = this.photos[this.currentLevel]
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
        if (this.selectedPiece && this.selectedPiece.isClose()) {
            this.selectedPiece.placeIntoRightPosition()
            this.popSound.play()
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

    changeButtonAccessibility = (button, state) => {
        button.setAttribute('disabled', state)
    }

    changePuzzlePhoto = () => {
        const isMorePhotos = this.currentLevel < this.photos.length - 1
        if (isMorePhotos) {
            this.image.src = this.photos[++this.currentLevel]
        } else {
            alert('There is no more puzzles!')
            this.changeButtonAccessibility(this.newBtn, false)
            this.changeButtonAccessibility(this.shuffleBtn, false)
            this.changeButtonAccessibility(this.solveBtn, false)
        }
    }

    initEventListeners = () => {
        this.canvas.addEventListener('mousedown', this.onMouseDown)
        this.canvas.addEventListener('mousemove', this.onMouseMove)
        this.canvas.addEventListener('mouseup', this.onMouseUp)
        this.solveBtn.addEventListener('click', this.solvePuzzle)
        this.shuffleBtn.addEventListener('click', this.randomizePieces)
        this.newBtn.addEventListener('click', this.changePuzzlePhoto)
        this.refreshBtn.addEventListener('click', this.refreshGame)
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
            let _rows = this.size.rows
            let _columns = this.size.columns

            if (this.currentLevel !== 0 && this.currentLevel % 3 === 0) {
                _rows += 2
                _columns += 2
            }

            this.handleResize()
            this.initializePieces(_rows, _columns)
            this.randomizePieces()
        }

        this.image.src = this.photos[this.currentLevel]
        this.updateGame()
    }
}

export {
    PuzzleGame
}
