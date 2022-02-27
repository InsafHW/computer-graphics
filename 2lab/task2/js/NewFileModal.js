import {Modal} from './Modal.js'

export class NewFileModal extends Modal {
    constructor() {
        const content = document.createElement('div')
        content.style.width = '500px'
        content.style.height = '500px'
        content.style.display = 'flex'
        content.style.justifyContent = 'center'
        content.style.alignItems = 'center'

        const createInputController = (labelText) => {
            const container = document.createElement('div')

            const label = document.createElement('div')
            label.innerText = labelText

            const input = document.createElement('input')
            input.type = 'number'

            container.appendChild(label)
            container.appendChild(input)
            return container
        }

        const widthController = createInputController('Ширина: ')
        const heightController = createInputController('Высота: ')

        content.appendChild(widthController)
        content.appendChild(heightController)

        super(content,
            () => {
                const canvas = document.getElementById('canvas')
                const width = widthController.getElementsByTagName('input')[0].value
                const height = heightController.getElementsByTagName('input')[0].value

                canvas.width = width
                canvas.height = height
            },
            () => {
                widthController.getElementsByTagName('input')[0].value = ''
                heightController.getElementsByTagName('input')[0].value = ''
            }
        )
    }
}
