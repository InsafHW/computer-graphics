import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import {ToolsCreator} from './ToolsCreator.js'

let leftMouseClicked = false

class Application {
    _primitives = []

    constructor() {
        this._scene = new THREE.Scene()
        this._camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
        this._renderer = new THREE.WebGLRenderer()
    }

    _animate = () => {
        requestAnimationFrame(this._animate)
        this._renderer.render()
    }

    addPrimitive(primitive) {
        this._primitives.push(primitive)
    }

    start = () => {
        this._renderer.setSize(innerWidth, innerHeight)
        document.body.appendChild(this._renderer.domElement)
        this._animate()
    }
}

function _createCube() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({color: 0x00ff00})
    )
}

function _createCone() {
    return new THREE.Mesh(
        new THREE.ConeGeometry(1, 1, 32),
        new THREE.MeshBasicMaterial({color: 0xfffab})
    )
}

function _createPlane() {
    return new THREE.Mesh(
        new THREE.PlaneGeometry(5, 5, 10, 10),
        new THREE.MeshPhongMaterial({color: 0xff0000, side: THREE.DoubleSide})
    )
}

const camera = ToolsCreator.createCamera()
const scene = ToolsCreator.createScene()
const renderer = ToolsCreator.createRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

const cone = _createCone()
const plane = _createPlane()
scene.add(cone)
scene.add(plane)

camera.position.z = 5

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
scene.add(light)

function animate() {
    requestAnimationFrame(animate)
    cone.rotation.x += 0.01
    cone.rotation.y += 0.01

    plane.rotation.x += 0.01
    // plane.rotation.y += 0.01

    renderer.render(scene, camera)
}

window.onwheel = (event) => {
    const currentZPosition = camera.position.z
    if (event.wheelDeltaY > 0) {
        if (currentZPosition > 1) {
            camera.position.z = currentZPosition - 1
        }
    } else {
        camera.position.z = currentZPosition + 1
    }
}

window.onmousedown = () => leftMouseClicked = true

window.onmousemove = (event) => {
    if (leftMouseClicked) {
        cone.rotation.x += event.movementX / 100
        cone.rotation.y += event.movementY / 100
        cone.rotation.z += event.movementY / 100
    }
}

window.onmouseup = window.onmouseout = () => leftMouseClicked = false

window.onresize = () => {
    renderer.setSize(innerWidth, innerHeight)
    camera.aspect = innerWidth / innerHeight
}

animate()
