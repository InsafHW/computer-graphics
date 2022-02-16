const letters = document.getElementById('svg').querySelectorAll('g')

const ANIMATION_NAME = 'letterMove'
const ANIMATION_TIME_IN_SEC = 8
const ANIMATION_TYPE = 'infinite'

function applyAnimation() {
    let letterIndex = 0

    const interval = setInterval(() => {
        if (letterIndex === letters.length - 1) {
            clearInterval(interval)
        }
        letters[letterIndex++].style.animation = `${ANIMATION_NAME} ${ANIMATION_TIME_IN_SEC}s ${ANIMATION_TYPE}`
    }, 300)
}

applyAnimation()
