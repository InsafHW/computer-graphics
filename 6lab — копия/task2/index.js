function createProgram(gl, shaders) {
  const program = gl.createProgram()
  shaders.forEach((shader) => {
    gl.attachShader(program, shader)
  })
  gl.linkProgram(program)

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
    return null
  }
  return program
}

function resizeCanvasToDisplaySize(canvas, multiplier = 1) {
  const width = (canvas.clientWidth * multiplier) | 0
  const height = (canvas.clientHeight * multiplier) | 0
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    canvas.getContext('webgl').viewport(0, 0, width, height)
    return true
  }
  return false
}

function getVertexShader(gl) {
  const shader = gl.createShader(gl.VERTEX_SHADER)
  const vertexSource = `
    attribute vec2 coordinates;
    void main(){
      gl_Position = vec4(coordinates, 0.0, 1.0);
    }
  `
  gl.shaderSource(shader, vertexSource)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

function getFragmentShader(gl) {
  const shader = gl.createShader(gl.FRAGMENT_SHADER)
  const fragmentSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
      gl_FragColor = u_color;
    }
  `
  gl.shaderSource(shader, fragmentSource)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      'ERROR compiling fragment shader!',
      gl.getShaderInfoLog(shader)
    )
    return null
  }
  return shader
}

function createStar({
  sizeFactor = 1,
  offsetX = 0,
  offsetY = 0,
  rotationDegree = 0,
}) {
  //geometry
  const vertices = []
  var indexes = []
  vertices.push(0, 0)
  indexes.push(0)

  for (let i = 0; i <= 6; i++) {
    const degree_offset = i * 60.0 + rotationDegree
    const radian_offset = degree_offset * (Math.PI / 180.0)
    const x_pos = sizeFactor * Math.cos(radian_offset)
    const y_pos = sizeFactor * Math.sin(radian_offset)

    vertices.push(x_pos)
    vertices.push(y_pos)
    indexes.push(i + 1)
  }

  //find the outer vertices needed for the star
  const inner_poly_vert = indexes.length - 1
  for (var i = 1; i < inner_poly_vert; i++) {
    var c_x = vertices[2 * i + 0]
    var c_y = vertices[2 * i + 1]
    var n_x = vertices[2 * i + 2]
    var n_y = vertices[2 * i + 3]
    var x_mp = c_x + n_x
    var y_mp = c_y + n_y
    vertices.push(x_mp, y_mp)
    indexes.push(indexes.length)
  }
  indexes = []
  //create the star from the hexagon and outer vertices
  for (var i = 0; i < 6; i++) {
    indexes.push(0, i + 1, i + 2)
    indexes.push(i + 1, i + 8, i + 2)
  }

  return {
    vertices: vertices.map((v, idx) => {
      if (idx % 2 === 0) {
        return v + offsetX
      }
      if (idx % 2 === 1) {
        return v + offsetY
      }
      return v
    }),
    indexes,
  }
}

function drawRectangle({ gl, x, y, width, height, setColorCb }) {
  var x1 = x
  var x2 = x + width
  var y1 = y
  var y2 = y + height
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  )
  setColorCb()
  gl.drawArrays(gl.TRIANGLES, -0.2, 6)
}

function drawElement({ vertices, indexes, gl, setColorCb }) {
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexes),
    gl.STATIC_DRAW
  )

  setColorCb()
  gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0)
}

function main() {
  const canvas = document.getElementById('polygon-surface')
  const gl = canvas.getContext('webgl')

  resizeCanvasToDisplaySize(canvas)

  //create shader
  const vertShader = getVertexShader(gl)
  const fragShader = getFragmentShader(gl)

  // create buffers
  const vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  const program = createProgram(gl, [fragShader, vertShader])
  gl.linkProgram(program)
  gl.useProgram(program)

  //association
  const colorUniformLocation = gl.getUniformLocation(program, 'u_color')
  const coord = gl.getAttribLocation(program, 'coordinates')
  gl.vertexAttribPointer(
    coord,
    2,
    gl.FLOAT,
    false,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
  )
  gl.enableVertexAttribArray(coord)

  gl.clearColor(1, 1, 1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  drawRectangle({
    gl,
    x: -1,
    y: 0,
    width: 20,
    height: 100,
    setColorCb: () => {
      gl.uniform4f(colorUniformLocation, 1, 0, 0, 1)
    },
  })

  drawElement({
    ...createStar({
      sizeFactor: 0.15,
      offsetY: 0.6,
      offsetX: -0.6,
    }),
    gl,
    setColorCb: () => {
      gl.uniform4f(colorUniformLocation, 1, 1, 0, 1)
    },
  })

  drawElement({
    ...createStar({
      sizeFactor: 0.03,
      offsetY: 0.8,
      offsetX: -0.2,
      rotationDegree: -20,
    }),
    gl,
    setColorCb: () => {
      gl.uniform4f(colorUniformLocation, 1, 1, 0, 1)
    },
  })

  drawElement({
    ...createStar({
      sizeFactor: 0.03,
      offsetY: 0.68,
      offsetX: -0.12,
      rotationDegree: 20,
    }),
    gl,
    setColorCb: () => {
      gl.uniform4f(colorUniformLocation, 1, 1, 0, 1)
    },
  })

  drawElement({
    ...createStar({
      sizeFactor: 0.03,
      offsetY: 0.53,
      offsetX: -0.12,
    }),
    gl,
    setColorCb: () => {
      gl.uniform4f(colorUniformLocation, 1, 1, 0, 1)
    },
  })

  drawElement({
    ...createStar({
      sizeFactor: 0.03,
      offsetY: 0.42,
      offsetX: -0.22,
      rotationDegree: 20,
    }),
    gl,
    setColorCb: () => {
      gl.uniform4f(colorUniformLocation, 1, 1, 0, 1)
    },
  })
}

main()
