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
  document.body.appendChild(renderer.domElement)
}

_createScene()
_createCamera()
_createRenderer()

const customShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    width: {
      type: 'f',
      value: renderer.domElement.width,
    },
    height: {
      type: 'f',
      value: renderer.domElement.height,
    },
  },
  fragmentShader: `
    uniform float width;
    uniform float height;

    void main() {
      float radius = 100.0;
      float ringWidth = 15.0;
      vec3 center = vec3(width / 2.0, height / 2.0, 0.0);
      vec3 position = vec3(gl_FragCoord) - center;
  
      if (length(position) <= radius && length(position) >= radius - ringWidth) 
      {
         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } 
      else 
      {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    }
  `,
})

const geometry = new THREE.PlaneGeometry(
  renderer.domElement.width,
  renderer.domElement.height
)

const plane = new THREE.Mesh(geometry, customShaderMaterial)
scene.add(plane)

renderer.render(scene, camera)
