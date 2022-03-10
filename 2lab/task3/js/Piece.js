class PieceDrawer {
    drawToCanvas = (piece, context, image) => {
        context.beginPath()

        context.drawImage(
            image,
            piece.colIndex * image.width / piece.size.columns,
            piece.rowIndex * image.height / piece.size.rows,
            image.width / piece.size.columns,
            image.height / piece.size.rows,
            piece.x,
            piece.y,
            piece.width,
            piece.height
        )

        context.rect(piece.x, piece.y, piece.width, piece.height)
        context.stroke()
    }
}

class Piece {
    constructor(rowIndex, colIndex, size) {
        this.pieceDrawer = new PieceDrawer()
        this.rowIndex = rowIndex
        this.colIndex = colIndex
        this.x = size.x + size.width * this.colIndex / size.columns
        this.y = size.y + size.height * this.rowIndex / size.rows
        this.width = size.width / size.columns
        this.height = size.height / size.rows
        this.xCorrect = this.x
        this.yCorrect = this.y
        this.correct = true
        this.size = size
    }

    placeIntoRightPosition = () => {
        this.x = this.xCorrect
        this.y = this.yCorrect
    }

    draw = (context, image) => {
        this.pieceDrawer.drawToCanvas(this, context, image)
    }

    getDistanceBetweenTwoPoints = (p1, p2) => {
        const side1 = p1.x - p2.x
        const side2 = p1.y - p2.y
        const hypotenuse = Math.sqrt(Math.pow(side1, 2) + Math.pow(side2, 2))
        return hypotenuse
    }

    isClose = () => {
        const distance = this.getDistanceBetweenTwoPoints(
            {
                x: this.x,
                y: this.y
            },
            {
                x: this.xCorrect,
                y: this.yCorrect
            }
        )

        return distance < this.width / 3
    }

    snap = () => {
        this.x = this.xCorrect
        this.y = this.yCorrect
        this.correct = true
    }
}

export {
    Piece
}
