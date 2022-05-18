import * as THREE from './modules/three.module.js'
import { OrbitControls } from './modules/OrbitControls.js'

let scene = null,
  camera = null,
  renderer = null,
  controls = null

function _createScene() {
  scene = new THREE.Scene()
}

function _createCamera() {
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000)
  camera.position.set(0, 30, 200)
}

function _createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(devicePixelRatio)
  document.body.appendChild(renderer.domElement)
}

function _createControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
}

function _createThor() {
  const geometry = new THREE.TorusGeometry(80, 10, 16, 100)
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: false,
  })
  const torus = new THREE.Mesh(geometry, material)
  scene.add(torus)
}

_createScene()
_createCamera()
_createRenderer()
_createControls()
_createThor()

function animate() {
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
