function main() {
  let pauseRender = false
  let camera = null
  let renderer = null
  let scene = null

  function _initHandlers() {
    window.addEventListener('resize', () => {
      pauseRender = true
      camera.aspect = window.innerWidth / window.innerHeight
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.updateProjectionMatrix()
      pauseRender = false
    })
  }

  function _initScene() {
    scene = new THREE.Scene()
  }

  function _initCamera() {
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5
  }

  function _initRenderer() {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
    })
    renderer.setClearColor(0xffffff, 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  }

  function _createEdges(mesh, lineWidth, lineColor = 0x000000) {
    const edges = new THREE.EdgesHelper(mesh, lineColor)
    edges.material.linewidth = lineWidth
    return edges
  }

  function _createBody() {
    const geometry = new THREE.SphereGeometry(1.5, 32, 16)
    const material = new THREE.MeshBasicMaterial({ color: 0x5dbcd9 })
    return new THREE.Mesh(geometry, material)
  }

  function _createNose() {
    const geometry = new THREE.SphereGeometry(0.1, 32, 16)
    const material = new THREE.MeshBasicMaterial({ color: 0xf934c9 })
    return new THREE.Mesh(geometry, material)
  }

  function _createRabbit() {
    // body.renderOrder = 0

    const nose = _createNose()
    const body = _createBody()
    body.position.set(2, 2, 1)

    // nose.renderOrder = 7
    // nose.rotation.y = 10

    // scene.add(nose)
    scene.add(body)
  }

  _initCamera()
  _initHandlers()
  _initRenderer()
  _initScene()
  _createRabbit()

  function render() {
    if (pauseRender) return
    requestAnimationFrame(render)
    renderer.render(scene, camera)
  }

  render()
}

main()
