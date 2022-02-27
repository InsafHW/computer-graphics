import {NewFileModal} from './NewFileModal.js'
import {SaveFileModal} from './SaveFileModal.js'

const newFileBtn = document.getElementById('new-btn')
const uploadFileBtn = document.getElementById('upload-file')
const saveBtn = document.getElementById('save-btn')

function initHandlers() {
    const fileModal = new NewFileModal()
    const saveModal = new SaveFileModal()

    newFileBtn.addEventListener('click', () => fileModal.open())
    saveBtn.addEventListener('click', () => saveModal.open())
}

initHandlers()
