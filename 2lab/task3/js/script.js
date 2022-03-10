const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const solveBtn = document.getElementById('solve-btn')
const shuffleBtn = document.getElementById('shuffle-btn')

const pieces = []
const popSound = new Audio('./assets/sounds/pop.mp3')
const winSound = new Audio('./assets/sounds/win.mp3')
const photos = ['./assets/images/photo1.jpg', './assets/images/photo2.jpg', './assets/images/photo3.jpg']
const size = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rows: 3,
    columns: 3
}

let scale = 0.7
let selectedPiece = null
let image = null
let currentLevel = 0

popSound.volume = 0.1

function main() {
    addEventListeners()

    image = new Image()

    image.onload = () => {
        handleResize()
        initializePieces(size.rows * (currentLevel + 1), size.columns * (currentLevel + 1))
        randomizePieces()
        updateGame()
    }

    image.src = photos[currentLevel]
}

function isComplete() {
    for (let i = 0; i < pieces.length; i++) {
        if (!pieces[i].correct) {
            return false
        }
    }
    return true
}

function addEventListeners() {
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    solveBtn.addEventListener('click', solvePuzzle)
    shuffleBtn.addEventListener('click', randomizePieces)
}

function onMouseDown(evt) {
    selectedPiece = getPressedPiece(evt)
    if (selectedPiece != null) {
        const index = pieces.indexOf(selectedPiece)
        if (index > -1) {
            pieces.splice(index, 1)
            pieces.push(selectedPiece)
        }
        selectedPiece.offset = {
            x: evt.x - selectedPiece.x,
            y: evt.y - selectedPiece.y
        }
        selectedPiece.correct = false
    }
}

function onMouseMove(evt) {
    if (selectedPiece != null) {
        selectedPiece.x = evt.x - selectedPiece.offset.x
        selectedPiece.y = evt.y - selectedPiece.offset.y
    }
}

function onMouseUp() {
    if (selectedPiece.isClose()) {
        selectedPiece.snap()
        if (isComplete()) {
            winSound.play()
            requestAnimationFrame(() => {
                setTimeout(() => {
                    alert('Congrats!')
                    if (confirm('Do you want to go to another level?')) {
                        image.src = photos[++currentLevel]
                    } else {
                        document.body.style.pointerEvents = 'none'
                    }
                }, 500)
            })

        }
    }
    selectedPiece = null
}

function getPressedPiece(loc) {
    for (let i = pieces.length - 1; i >= 0; i--) {
        if (loc.x > pieces[i].x && loc.x < pieces[i].x + pieces[i].width &&
            loc.y > pieces[i].y && loc.y < pieces[i].y + pieces[i].height) {
            return pieces[i]
        }
    }
    return null
}

function handleResize() {
    canvas.width = innerWidth - 110
    canvas.height = innerHeight

    let resizer = scale *
        Math.min(
            innerWidth / image.width,
            innerHeight / image.height
        )
    size.width = resizer * image.width
    size.height = resizer * image.height
    size.x = innerWidth / 2 - size.width / 2
    size.y = innerHeight / 2 - size.height / 2
}

function updateGame() {
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.beginPath()
    context.rect(size.x, size.y, size.width, size.height)
    context.stroke()

    pieces.forEach(p => p.draw(context))

    window.requestAnimationFrame(updateGame)
}

function initializePieces(rows, cols) {
    size.rows = rows
    size.columns = cols

    pieces.splice(0, pieces.length)
    for (let i = 0; i < size.rows; i++) {
        for (let j = 0; j < size.columns; j++) {
            pieces.push(new Piece(i, j))
        }
    }
}

function randomizePieces() {
    for (let i = 0; i < pieces.length; i++) {
        let loc = {
            x: Math.random() * (canvas.width - pieces[i].width),
            y: Math.random() * (canvas.height - pieces[i].height)
        }
        pieces[i].x = loc.x
        pieces[i].y = loc.y
        pieces[i].correct = false
    }
}

class Piece {
    constructor(rowIndex, colIndex) {
        this.rowIndex = rowIndex
        this.colIndex = colIndex
        this.x = size.x + size.width * this.colIndex / size.columns
        this.y = size.y + size.height * this.rowIndex / size.rows
        this.width = size.width / size.columns
        this.height = size.height / size.rows
        this.xCorrect = this.x
        this.yCorrect = this.y
        this.correct = true
    }

    placeIntoRightPosition() {
        this.x = this.xCorrect
        this.y = this.yCorrect
    }

    draw(context) {
        context.beginPath()

        context.drawImage(
            image,
            this.colIndex * image.width / size.columns,
            this.rowIndex * image.height / size.rows,
            image.width / size.columns,
            image.height / size.rows,
            this.x,
            this.y,
            this.width,
            this.height
        )

        context.rect(this.x, this.y, this.width, this.height)
        context.stroke()
    }

    isClose() {
        const _distance = distance(
            {
                x: this.x,
                y: this.y
            },
            {
                x: this.xCorrect,
                y: this.yCorrect
            }
        )

        return _distance < this.width / 3
    }

    snap() {
        this.x = this.xCorrect
        this.y = this.yCorrect
        this.correct = true
        popSound.play()
    }
}

function distance(p1, p2) {
    const side1 = p1.x - p2.x
    const side2 = p1.y - p2.y
    const hypotenuse = Math.sqrt(Math.pow(side1, 2) + Math.pow(side2, 2))
    return hypotenuse
}

main()

function solvePuzzle() {
    pieces.forEach(p => {
        p.placeIntoRightPosition()
    })
    winSound.play()
    requestAnimationFrame(() => {
        setTimeout(() => {
            alert('Congrats!')
            if (confirm('Do you want to go to another level?')) {
                image.src = photos[++currentLevel]
            } else {
                document.body.style.pointerEvents = 'none'
            }
        }, 500)
    })
}
