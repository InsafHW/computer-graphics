import * as THREE from '../modules/three.module.js'

let scene = null,
  camera = null,
  renderer = null

function _createScene() {
  scene = new THREE.Scene()
}

function _createCamera() {
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000)
  camera.position.set(0, 0, 10)
}

function _createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(devicePixelRatio)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)
}

_createScene()
_createCamera()
_createRenderer()

const customShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    void main() {
      float R = (1.0 + sin(position.x)) * (1.0 + 0.9 * cos(8.0 * position.x)) * (1.0 + 0.1 * cos(24.0 * position.x)) * (0.5 + 0.05 * cos(140.0 * position.x));
      gl_Position = projectionMatrix 
      * modelViewMatrix 
      * vec4(R * cos(position.x), R * sin(position.x), position.z, 1);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(0.0, 1.0, 0.2, 1.0);
    }
  `,
})

const geometry = new THREE.BufferGeometry()
const vertices = []

for (let i = 0; i < Math.PI * 2; i += Math.PI / 1000) {
  vertices.push(i, 0, 0)
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
const line = new THREE.Line(geometry, customShaderMaterial)
scene.add(line)

renderer.render(scene, camera)
