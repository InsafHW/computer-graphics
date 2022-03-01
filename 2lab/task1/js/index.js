const photo = document.getElementById('photo')
const fileInput = document.getElementById('fileInput')

let dragging = false

function getPxFromTransformString(str) {
    if (!str) {
        return 0
    }
    const openBracketIdx = str.indexOf('(')
    const closeBracketIdx = str.indexOf(')')
    return parseInt(str.slice(openBracketIdx + 1, closeBracketIdx))
}

function initHandlers() {
    const onFileInputChange = event => {
        const allowedFileExtensions =
            /(\.jpg|\.jpeg|\.png|\.bmp)$/i
        const filePath = event.target.files[0].name

        if (filePath && !allowedFileExtensions.exec(filePath)) {
            alert('Invalid file type')
            fileInput.value = ''
            return false
        }

        photo.src = URL.createObjectURL(event.target.files[0])
    }

    const handlePhotoMove = event => {
        const {target} = event
        const transforms = target.style.transform.split(' ')
        const translateX = transforms.find(x => x.includes('translateX'))
        const translateY = transforms.find(x => x.includes('translateY'))

        const x = getPxFromTransformString(translateX)
        const y = getPxFromTransformString(translateY)

        requestAnimationFrame(() => {
            target.style.transform = `translateX(${event.movementX + x}px) translateY(${event.movementY + y}px)`
        })
    }

    const resetDragging = () => {
        dragging = false
        photo.style.cursor = 'initial'
    }

    const startDragging = () => {
        dragging = true
        photo.style.cursor = 'grabbing'
    }

    fileInput.addEventListener('change', onFileInputChange)
    photo.addEventListener('mouseleave', resetDragging)
    photo.addEventListener('mousedown', startDragging)
    photo.addEventListener('mouseup', resetDragging)
    photo.addEventListener('mousemove', event => {
        if (dragging) {
            handlePhotoMove(event)
        }
    })
}

initHandlers()
