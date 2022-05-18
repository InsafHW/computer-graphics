import * as THREE from './modules/three.module.js'

let scene = null,
  camera = null,
  renderer = null

function _createScene() {
  scene = new THREE.Scene()
}

function _createCamera() {
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000)
  camera.position.z = 5
}

function _createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(devicePixelRatio)
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)
}

_createScene()
_createCamera()
_createRenderer()

let textureVid = document.createElement('video')
textureVid.muted = 'mute'
textureVid.src = './assets/videoplayback.mp4'
textureVid.loop = true

// Load video texture
let videoTexture = new THREE.VideoTexture(textureVid)
videoTexture.format = THREE.RGBFormat
videoTexture.minFilter = THREE.NearestFilter
videoTexture.maxFilter = THREE.NearestFilter
videoTexture.generateMipmaps = false

const geometry = new THREE.PlaneGeometry(7, 4, 50, 30)
const material = new THREE.MeshBasicMaterial({
  map: videoTexture,
})
const flag = new THREE.Mesh(geometry, material)
scene.add(flag)

let clock = false
console.log(material)
let start = false

function animate() {
  if (start) {
    const time = clock.getElapsedTime()
    const vertices = flag.geometry.attributes.position

    if (time < 3) {
      for (let i = 0; i < flag.geometry.attributes.position.array.length; i++) {
        const x = vertices.getX(i)
        const y = vertices.getY(i)

        const waveX1 = Math.cos(x * 1.5 + time)
        const waveX2 = -Math.cos(x * 1.2 + time)

        vertices.setZ(i, waveX1 + waveX2)
        // vertices.setZ(250, 0.6)
      }
      flag.geometry.attributes.position.needsUpdate = true
    } else {
      for (let i = 0; i < flag.geometry.attributes.position.array.length; i++) {
        vertices.setZ(i, 0)
      }
      flag.geometry.attributes.position.needsUpdate = true
    }
  }

  // flag.updateMatrix()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

document.addEventListener('click', () => {
  if (start) {
    return
  }
  // const preloader = document.querySelector('.preloader')
  // preloader.style.transform = 'scale(1.5)'
  // preloader.style.opacity = '0'
  start = true
  clock = new THREE.Clock()
  textureVid.play()
})
