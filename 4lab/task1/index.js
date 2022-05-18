function main() {
  let pauseRender = false
  let camera = null
  let renderer = null
  let scene = null

  let dragging = false
  let deltaX = 0,
    deltaY = 0

  function _initHandlers() {
    window.addEventListener('resize', () => {
      pauseRender = true
      camera.aspect = window.innerWidth / window.innerHeight
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.updateProjectionMatrix()
      pauseRender = false
    })
    window.onmousewheel = document.onmousewheel = (e) => {
      const positionZ = camera.position.z + e.wheelDelta * 0.01 * -1
      if (positionZ <= 1000 && positionZ > 0.8) {
        camera.position.z = camera.position.z + e.wheelDelta * 0.001 * -1
      }
    }
    ;(function () {
      let mouseX = 0,
        mouseY = 0
      document.onmousedown = (e) => {
        dragging = true
        mouseX = e.clientX
        mouseY = e.clientY
      }
      document.onmouseup = () => (dragging = false)
      document.onmousemove = (e) => {
        if (dragging) {
          deltaX = e.clientX - mouseX
          deltaY = e.clientY - mouseY
          mouseX = e.clientX
          mouseY = e.clientY
        }
      }
    })()
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
    renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setClearColor(0xffffff, 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  }

  function _createIcosahedron() {
    const geometry = new THREE.IcosahedronGeometry(2, 0)
    const material = new THREE.MeshNormalMaterial({
      wireframe: false,
      transparent: true,
      opacity: 0.8,
    })
    return new THREE.Mesh(geometry, material)
  }

  function _createEdges(mesh, lineWidth, lineColor = 0x000000) {
    const edges = new THREE.EdgesHelper(mesh, lineColor)
    edges.material.linewidth = lineWidth
    return edges
  }

  _initCamera()
  _initHandlers()
  _initRenderer()
  _initScene()

  const icosahedron = _createIcosahedron()
  scene.add(icosahedron)

  const edges = _createEdges(icosahedron, 2)
  scene.add(edges)

  function render() {
    if (pauseRender) return
    requestAnimationFrame(render)

    if (dragging) {
      icosahedron.rotation.y += 0.02 * deltaX
      icosahedron.rotation.x += 0.02 * deltaY

      edges.rotation.y += 0.02 * deltaX
      edges.rotation.x += 0.02 * deltaY
    }

    renderer.render(scene, camera)
  }

  render()
}

main()
