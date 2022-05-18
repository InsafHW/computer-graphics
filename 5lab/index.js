import * as THREE from './modules/three.module.js'
import { OrbitControls } from './modules/OrbitControls.js'

let scene = null,
  camera = null,
  renderer = null,
  ambientLight = null,
  pointLight = null,
  controls = null,
  textureLoader = null

function _createScene() {
  scene = new THREE.Scene()
}

function _createCamera() {
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000)
  camera.position.set(0, 30, 500)
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

function _createLights() {
  ambientLight = new THREE.AmbientLight(0x222222)
  scene.add(ambientLight)

  pointLight = new THREE.PointLight(0xffffff)
  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 512
  pointLight.shadow.mapSize.height = 512
  pointLight.shadow.camera.near = 150
  pointLight.shadow.camera.far = 350

  scene.add(pointLight)
}

function _createControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
}

function _createTextureLoader() {
  textureLoader = new THREE.TextureLoader()
}

function _createBackground() {
  const geometry = new THREE.SphereGeometry(2000, 100, 100)
  const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load('../assets/stars_milky_way.jpg'),
    side: THREE.DoubleSide,
  })
  const background = new THREE.Mesh(geometry, material)
  scene.add(background)
}

function _createTheSun() {
  const material = new THREE.MeshStandardMaterial({
    emissive: 0xffd700,
    emissiveMap: textureLoader.load('../assets/sun/8k_sun.jpg'),
    emissiveIntensity: 1,
  })
  const geometry = new THREE.SphereGeometry(109, 40, 20)
  const theSun = new THREE.Mesh(geometry, material)
  scene.add(theSun)
  window._theSun = theSun
}

function _createEarthSystem() {
  const earthSystem = new THREE.Group()

  const earthRadius = 25
  const segments = 50
  const earthTiltRad = 0.41

  ;(function createEarth() {
    // create earth
    const earthColor = textureLoader.load('../assets/earth/earthmap1k.jpg')
    const earthBump = textureLoader.load('../assets/earth/earthbump1k.jpg')
    const earthSpec = textureLoader.load('../assets/earth/earthspec1k.jpg')

    const geometry = new THREE.SphereGeometry(earthRadius, segments, segments)
    geometry.thetaStart = earthTiltRad
    const material = new THREE.MeshPhongMaterial({
      map: earthColor,
      bumpMap: earthBump,
      bumpScale: 0.5,
      specularMap: earthSpec,
      shininess: 0.5,
    })
    const earth = new THREE.Mesh(geometry, material)
    earth.castShadow = true
    earth.receiveShadow = true
    earth.rotation.z = earthTiltRad
    earthSystem.add(earth)
    window._theEarth = earth
  })()
  ;(function createClouds() {
    // create clouds
    const geometry = new THREE.SphereGeometry(
      earthRadius + 1,
      segments,
      segments
    )
    const material = new THREE.MeshPhongMaterial({
      map: textureLoader.load('../assets/earth/earthcloudmaptrans.jpg'),
      transparent: true,
      opacity: 0.5,
    })
    const clouds = new THREE.Mesh(geometry, material)
    clouds.receiveShadow = true
    clouds.rotation.z = earthTiltRad
    earthSystem.add(clouds)
    window._clouds = clouds
  })()
  ;(function createTheMoon() {
    // create the Moon
    const geometry = new THREE.SphereGeometry(5, 40, 20)
    const material = new THREE.MeshStandardMaterial({
      map: textureLoader.load('../assets/moon/moonmap1k.jpg'),
      bumpMap: textureLoader.load('../assets/moon/moonbump1k.jpg'),
      bumpScale: 0.5,
    })
    const theMoon = new THREE.Mesh(geometry, material)
    theMoon.position.set(40, 0, 0)
    theMoon.castShadow = true
    theMoon.receiveShadow = true

    window._theMoon = theMoon

    earthSystem.add(theMoon)
  })()

  earthSystem.position.set(200, 0, 0)
  scene.add(earthSystem)

  window._earthSystem = earthSystem
}

function _createEarthOrbitPath() {
  const curve = new THREE.EllipseCurve(0, 0, 250, 300, 0, 2 * Math.PI)
  const points = curve.getSpacedPoints(200)

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.5,
  })
  const orbit = new THREE.Line(geometry, material)
  orbit.rotateX(-Math.PI / 2)
  scene.add(orbit)

  window._curve = curve
}

_createScene()
_createCamera()
_createRenderer()
_createLights()
_createControls()
_createTextureLoader()

_createBackground()
_createTheSun()
_createEarthSystem()
_createEarthOrbitPath()
;(function startApp() {
  const loopTime = 1
  const earthOrbitSpeed = 0.00001
  const moontOrbitRadius = 55
  const moonOrbitSpeed = 80

  function moveTheSun() {
    window._theSun.rotation.y += 0.0008
  }

  function moveEarth(time) {
    const pointIndex = time % loopTime
    const point = window._curve.getPoint(pointIndex)

    window._earthSystem.position.x = point.x
    window._earthSystem.position.z = point.y

    window._theEarth.rotation.y += 0.015
    window._clouds.rotation.y += 0.025
  }

  function moveTheMoon(time) {
    window._theMoon.position.x =
      -Math.cos(time * moonOrbitSpeed) * moontOrbitRadius
    window._theMoon.position.z =
      -Math.sin(time * moonOrbitSpeed) * moontOrbitRadius
    window._theMoon.rotation.y += 0.0001
  }

  function animate() {
    const time = earthOrbitSpeed * performance.now()

    moveTheSun()
    moveEarth(time)
    moveTheMoon(time)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()
})()
