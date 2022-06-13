import * as THREE from '../modules/three.module.js'
import { OrbitControls } from '../modules/OrbitControls.js'

let scene = null,
  camera = null,
  renderer = null,
  controls = null

function _createScene() {
  scene = new THREE.Scene()
}

function _createCamera() {
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 4000)
  camera.position.set(0, 0, 30)
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
  controls.target.set(0, 0, 0)
}

_createScene()
_createCamera()
_createRenderer()
_createControls()

const customShaderMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  wireframe: true,
  uniforms: {
    time: {
      type: 'f',
      value: Date.now(),
    },
  },
  vertexShader: `
    uniform float time;

    float getEllipticalParaboloidZCoordinate(float aParameter, float bParameter) {
      return pow((position.x / aParameter), 2.0) + pow((position.y / bParameter), 2.0);
    }

    float getHyperbolicParaboloidZCoordinate(float aParameter, float bParameter, float pParameter) {
      return (-pow((position.x / aParameter), 2.0) + pow(position.y / bParameter, 2.0)) / 2.0 * pParameter;
    }

    bool isHyperbolicFn(float time, float transitionTime) {
      float timeMorphsInTime = floor(time / transitionTime);
      return (int(timeMorphsInTime) % 2) != 0;
    }

    float calcTime(float time, float transitionTime) {
      float timeMorphsInTime = floor(time / transitionTime);
      return (time - (timeMorphsInTime * transitionTime));
    }

    void main() {
      float a = 4.0;
      float b = 3.0;
      float p = 3.0;
      float transitionTime = 2000.0;

      float ellipticalParaboloidZCoordinate = getEllipticalParaboloidZCoordinate(a, b);
      float hyperbolicParaboloidZCoordinate = getHyperbolicParaboloidZCoordinate(a, b, p);

      float zCoordinate;
      float calculatedTime = calcTime(time, transitionTime);

      if (isHyperbolicFn(time, transitionTime)) {
        zCoordinate = mix(ellipticalParaboloidZCoordinate, hyperbolicParaboloidZCoordinate, calculatedTime / transitionTime);
      } else {
        zCoordinate = mix(hyperbolicParaboloidZCoordinate, ellipticalParaboloidZCoordinate, calculatedTime / transitionTime);
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, zCoordinate, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
  `,
})

const geometry = new THREE.PlaneGeometry(10, 10, 30, 30)
const plane = new THREE.Mesh(geometry, customShaderMaterial)
plane.rotateX((-90 * Math.PI) / 180)
scene.add(plane)

const startTime = Date.now()
function updateTime() {
  plane.material.uniforms.time.value = Date.now() - startTime
}

function animate() {
  requestAnimationFrame(animate)

  controls.update()
  updateTime()
  renderer.render(scene, camera)
}

window.onload = animate
