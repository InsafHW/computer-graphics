const fence = document.getElementById('fence')
const house = document.getElementById('house')

let fenceDragging = false
let houseDragging = false

function getPxFromTransformString(str) {
    if (!str) {
        return 0
    }
    const openBracketIdx = str.indexOf('(')
    const closeBracketIdx = str.indexOf(')')
    return parseInt(str.slice(openBracketIdx + 1, closeBracketIdx))
}

function handleDragAndDrop(element, deltaX, deltaY) {
    const transforms = element.style.transform.split(' ')
    const translateX = transforms.find(x => x.includes('translateX'))
    const translateY = transforms.find(x => x.includes('translateY'))

    const x = getPxFromTransformString(translateX)
    const y = getPxFromTransformString(translateY)
    element.style.transform = `translateX(${deltaX + x}px) translateY(${deltaY + y}px)`
}

function initListeners() {
    document.addEventListener('mouseup', () => fenceDragging = houseDragging = false)
    fence.addEventListener('mousedown', () => fenceDragging = true)
    house.addEventListener('mousedown', () => houseDragging = true)
    document.addEventListener('mousemove', (e) => {
        if (fenceDragging) {
            Array.from(fence.children)
                .forEach(c => handleDragAndDrop(c, e.movementX, e.movementY))
        } else if (houseDragging) {
            Array.from(house.children)
                .forEach(c => handleDragAndDrop(c, e.movementX, e.movementY))
        }
    })
}

initListeners()
