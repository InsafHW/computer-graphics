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
                const radios = content.querySelectorAll('input')
                radios.forEach(r => {
                    if (r.checked) {
                        switch (r.id) {
                            case PNG_ID:
                                console.log('png')
                                break
                            case JPEG_ID:
                                console.log('jpeg')
                                break
                            case BMP_ID:
                                console.log('bmp')
                                break
                        }
                    }
                })
            },
            () => {
                console.log('canceled')
            }
        )
    }
}
