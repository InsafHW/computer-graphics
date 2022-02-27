const VISIBLE_CLASSNAME = 'visible'

export class Modal {
    modalLayer = null
    content = null

    constructor(contentRenderer, onApplyCb, onCancelCb) {
        this.modalLayer = document.getElementById('modal-layer')

        const clearModalContent = () => {
            this.modalLayer.innerHTML = ''
            this.modalLayer.classList.remove(VISIBLE_CLASSNAME)
        }

        const createActionFooter = () => {
            const actionFooter = document.createElement('div')
            actionFooter.style.display = 'flex'
            actionFooter.style.justifyContent = 'space-around'

            const cancelBtn = document.createElement('button')
            cancelBtn.innerText = 'Отмена'
            cancelBtn.addEventListener('click', () => {
                onCancelCb()
                clearModalContent()
            })

            const applyBtn = document.createElement('button')
            applyBtn.innerText = 'Принять'
            applyBtn.addEventListener('click', () => {
                onApplyCb()
                clearModalContent()
            })

            actionFooter.appendChild(cancelBtn)
            actionFooter.appendChild(applyBtn)
            return actionFooter
        }

        const createContentRendererWrapper = () => {
            const contentRendererWrapper = document.createElement('div')
            contentRendererWrapper.className = 'default-modal'
            contentRendererWrapper.dataset.isModalWrapper = 'true'
            return contentRendererWrapper
        }

        const actionFooter = createActionFooter()
        const contentRendererWrapper = createContentRendererWrapper()
        contentRendererWrapper.appendChild(contentRenderer)

        contentRendererWrapper.appendChild(actionFooter)
        this.content = contentRendererWrapper
    }

    open() {
        this.modalLayer.classList.add(VISIBLE_CLASSNAME)
        this.modalLayer.appendChild(this.content)
    }
}
