import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import * as dat from 'dat.gui'

console.log(dat)
import {ToolsCreator} from './ToolsCreator.js'

const camera = ToolsCreator.createCamera()
const scene = ToolsCreator.createScene()
const renderer = ToolsCreator.createRenderer()

document.body.appendChild(renderer.domElement)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5, 10, 10),
    new THREE.MeshPhongMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        flatShading: THREE.FlatShading
    })
)
const {array} = plane.geometry.attributes.position
for (let i = 0; i < array.length; i += 3) {
    const x = array[i]
    const y = array[i + 1]
    const z = array[i + 2]

    array[i + 2] += Math.random()
}

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
console.log(plane)
scene.add(plane)
scene.add(light)

camera.position.z = 5

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()
