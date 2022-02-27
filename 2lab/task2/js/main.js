import {NewFileModal} from './NewFileModal.js'
import {SaveFileModal} from './SaveFileModal.js'

const newFileBtn = document.getElementById('new-btn')
const uploadFileBtn = document.getElementById('upload-file')
const saveBtn = document.getElementById('save-btn')
const canvas = document.getElementById('canvas')
const ctx = document.getElementById('canvas').getContext('2d')

let drawing = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0

function initHandlers() {
    const fileModal = new NewFileModal()
    const saveModal = new SaveFileModal()

    const draw = () => {
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(currX, currY)
        ctx.stroke()
        ctx.closePath()
    }

    const mouseMoveHandler = (e) => {
        if (drawing) {
            prevX = currX
            prevY = currY
            currX = e.clientX - canvas.offsetLeft
            currY = e.clientY - canvas.offsetTop
            draw()
        }
    }

    const mouseDownHandler = (e) => {
        prevX = currX
        prevY = currY
        currX = e.clientX - canvas.offsetLeft
        currY = e.clientY - canvas.offsetTop

        drawing = true

        ctx.beginPath()
        ctx.fillRect(currX, currY, 1, 1)
        ctx.closePath()
    }

    const onFileInputChange = event => {
        const allowedFileExtensions =
            /(\.jpg|\.jpeg|\.png|\.bmp)$/i
        const filePath = event.target.files[0].name

        if (filePath && !allowedFileExtensions.exec(filePath)) {
            alert('Invalid file type')
            uploadFileBtn.value = ''
            return false
        }

        const image = new Image()
        image.onload = drawImageActualSize

        function drawImageActualSize() {
            canvas.width = this.naturalWidth
            canvas.height = this.naturalHeight
            ctx.drawImage(this, 0, 0, this.width, this.height)
        }

        image.src = URL.createObjectURL(event.target.files[0])
    }

    newFileBtn.addEventListener('click', () => fileModal.open())
    saveBtn.addEventListener('click', () => saveModal.open())
    canvas.addEventListener('mousemove', mouseMoveHandler)
    canvas.addEventListener('mousedown', mouseDownHandler)
    canvas.addEventListener('mouseup', () => drawing = false)
    canvas.addEventListener('mouseout', () => drawing = false)
    uploadFileBtn.addEventListener('change', onFileInputChange)
}

initHandlers()
