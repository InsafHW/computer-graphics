import {Modal} from './Modal.js'

const PNG_ID = 'png'
const JPEG_ID = 'jpeg'
const BMP_ID = 'bmp'

export class SaveFileModal extends Modal {
    constructor() {
        const content = document.createElement('div')
        content.style.width = '500px'
        content.style.height = '500px'
        content.style.display = 'flex'
        content.style.justifyContent = 'center'
        content.style.alignItems = 'center'
        content.innerHTML = `
            <div>
                <div>
                    <input id=${PNG_ID} type="radio" name="ext"/>
                    <label for=${PNG_ID}>PNG</label>
                </div>
                <div>
                    <input id=${JPEG_ID} type="radio" name="ext"/>
                    <label for=${JPEG_ID}>JPEG</label>
                </div>
                <div>
                    <input id=${BMP_ID} type="radio" name="ext"/>
                    <label for=${BMP_ID}>BMP</label>
                </div>
            </div>
        `
        super(content,
            () => {
                const canvas = document.getElementById('canvas')
                const radios = content.querySelectorAll('input')
                radios.forEach(r => {
                    if (r.checked) {
                        const dataURL = canvas.toDataURL('image/' + r.id)
                        const a = document.createElement('a')
                        a.download = `new-${Date.now()}.${r.id}`
                        a.href = dataURL
                        a.style.position = 'absolute'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                    }
                })
            },
            () => {
                console.log('canceled')
            }
        )
    }
}
