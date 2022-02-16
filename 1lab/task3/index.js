const svg = document.getElementById('svg')
const gibbet = document.getElementById('gibbet')

const DEFAULT_TIMEOUT = 300
let failAnswerCount = 0
let answer = ''
let question = ''
let guessedLetterCount = 0

const GibbetDrawer = {
    drawRope() {
        const rope = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rope.setAttribute('width', '1')
        rope.setAttribute('height', '15')
        rope.setAttribute('x', '45')
        rope.setAttribute('y', '-15')
        rope.style.fill = 'purple'
        gibbet.appendChild(rope)
    },
    drawHead() {
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        head.setAttribute('cx', '45.5')
        head.setAttribute('cy', '3')
        head.setAttribute('r', '5')
        head.style.fill = 'purple'
        gibbet.appendChild(head)
    },
    drawBody() {
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        body.setAttribute('width', '2')
        body.setAttribute('height', '25')
        body.setAttribute('x', '44.8')
        body.setAttribute('y', '7')
        body.style.fill = 'purple'
        gibbet.appendChild(body)
    },
    drawLeftLeg() {
        const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        leftLeg.setAttribute('width', '1')
        leftLeg.setAttribute('height', '25')
        leftLeg.setAttribute('x', '54')
        leftLeg.setAttribute('y', '-10')
        leftLeg.setAttribute('transform', 'rotate(45)')
        leftLeg.style.fill = 'purple'
        gibbet.appendChild(leftLeg)
    },
    drawRightLeg() {
        const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rightLeg.setAttribute('width', '1')
        rightLeg.setAttribute('height', '25')
        rightLeg.setAttribute('x', '10')
        rightLeg.setAttribute('y', '54')
        rightLeg.setAttribute('transform', 'rotate(-45)')
        rightLeg.style.fill = 'purple'
        gibbet.appendChild(rightLeg)
    },
    drawLeftHand() {
        const leftHand = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        leftHand.setAttribute('width', '1')
        leftHand.setAttribute('height', '25')
        leftHand.setAttribute('x', '18')
        leftHand.setAttribute('y', '22')
        leftHand.setAttribute('transform', 'rotate(-45)')
        leftHand.style.fill = 'purple'
        gibbet.appendChild(leftHand)
    },
    drawRightHand() {
        const rightHand = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rightHand.setAttribute('width', '1')
        rightHand.setAttribute('height', '25')
        rightHand.setAttribute('x', '46')
        rightHand.setAttribute('y', '-44')
        rightHand.setAttribute('transform', 'rotate(45)')
        rightHand.style.fill = 'purple'
        gibbet.appendChild(rightHand)
    }
}

async function getDataFromFile(fileName = 'input.txt') {
    const response = await fetch(fileName)
    const text = await response.text()
    const parts = text.split('\n')

    const gameInfo = []

    for (let i = 0; i < parts.length; i += 3) {
        const question = parts[i]
        const answer = parts[i + 1]
        gameInfo.push({
            question,
            answer
        })
    }

    return gameInfo
}

function initRandomData(data) {
    const randomIndex = Math.floor(Math.random() * data.length)
    const item = data[randomIndex]
    answer = item.answer
        .slice(item.answer.indexOf(': ') + 1)
        .trim()
    question = item.question
        .slice(item.question.indexOf(': ') + 1)
        .trim()
}

function checkIfLetterInAnswer(letter) {
    return answer
        .toLowerCase()
        .includes(letter.toLowerCase())
}

function drawPartOfGibbet() {
    switch (failAnswerCount) {
        case 0:
            GibbetDrawer.drawRope()
            break
        case 1:
            GibbetDrawer.drawHead()
            break
        case 2:
            GibbetDrawer.drawBody()
            break
        case 3:
            GibbetDrawer.drawLeftLeg()
            break
        case 4:
            GibbetDrawer.drawRightLeg()
            break
        case 5:
            GibbetDrawer.drawLeftHand()
            break
        case 6:
            GibbetDrawer.drawRightHand()
            replaceElementWithCopy(document.body)
            setTimeout(() => {
                alert('Вы проиграли.')
            }, DEFAULT_TIMEOUT)
            break
        default:
            break
    }
}

function drawGameInfo() {
    const questionNode = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    const innerText = document.createTextNode(question)
    questionNode.appendChild(innerText)
    questionNode.setAttribute('x', '125')
    questionNode.setAttribute('y', '-15')

    questionNode.style.fontSize = '4px'

    svg.appendChild(questionNode)

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    for (let i = 0; i < answer.length; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('width', '1')
        rect.setAttribute('height', '10')
        rect.setAttribute('x', '0')
        rect.setAttribute('y', String(-110 - 12 * i))
        rect.style.transform = 'rotate(90deg)'
        rect.dataset.letter = answer[i].toLowerCase()
        rect.dataset.index = String(i)
        group.appendChild(rect)
    }
    svg.appendChild(group)
}

function replaceElementWithCopy(element) {
    const newElement = element.cloneNode(true)
    element.parentNode.replaceChild(newElement, element)
}

function drawGuessedLetter(letter) {
    letter = letter.toLowerCase()
    const items = svg.querySelectorAll(`[data-letter=${letter}]`)
    guessedLetterCount += items.length

    Array.from(items)
        .forEach(i => {
            const parent = i.parentNode
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.setAttribute('x', String(102 + i.dataset.index * 12))
            text.setAttribute('y', '-1')
            const innerText = document.createTextNode(letter.toUpperCase())
            text.appendChild(innerText)
            parent.appendChild(text)
        })

    if (guessedLetterCount === answer.length) {
        setTimeout(() => {
            alert('Вы выиграли!')
        }, DEFAULT_TIMEOUT)
        replaceElementWithCopy(document.body)
    }
}

function addLettersToSvg() {
    const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З',
        'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П',
        'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
    ]

    const clickHandler = (e, letter) => {
        const isLetterCorrect = checkIfLetterInAnswer(letter)
        if (isLetterCorrect) {
            e.target.style.color = 'green'
            drawGuessedLetter(letter)
        } else {
            e.target.style.color = 'red'
            drawPartOfGibbet()
            failAnswerCount++
        }
        replaceElementWithCopy(e.target)
    }

    const group = document.createElement('div')
    group.classList.add('letters')
    letters.forEach((l, idx) => {
        const letter = document.createElement('span')
        letter.classList.add('letter')
        letter.innerText = l
        letter.addEventListener('click', (e) => clickHandler(e, l))
        group.appendChild(letter)
    })
    document.body.appendChild(group)
}

async function startGame() {
    const data = await getDataFromFile()
    initRandomData(data)
    drawGameInfo()
    addLettersToSvg()
}

startGame()
