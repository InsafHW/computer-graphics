'use strict'

const defaultShaderType = ['VERTEX_SHADER', 'FRAGMENT_SHADER']

function projection(width, height, dst) {
  dst = dst || new Float32Array(9)
  // Note: This matrix flips the Y axis so 0 is at the top.

  dst[0] = 2 / width
  dst[1] = 0
  dst[2] = 0
  dst[3] = 0
  dst[4] = -2 / height
  dst[5] = 0
  dst[6] = -1
  dst[7] = 1
  dst[8] = 1

  return dst
}

function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
  const errFn = opt_errorCallback
  // Create the shader object
  const shader = gl.createShader(shaderType)

  // Load the shader source
  gl.shaderSource(shader, shaderSource)

  // Compile the shader
  gl.compileShader(shader)

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader)
    console.log(lastError)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createShaderFromScript(
  gl,
  scriptId,
  opt_shaderType,
  opt_errorCallback
) {
  let shaderSource = ''
  let shaderType
  const shaderScript = document.getElementById(scriptId)
  if (!shaderScript) {
    throw '*** Error: unknown script element' + scriptId
  }
  shaderSource = shaderScript.text

  if (!opt_shaderType) {
    if (shaderScript.type === 'x-shader/x-vertex') {
      shaderType = gl.VERTEX_SHADER
    } else if (shaderScript.type === 'x-shader/x-fragment') {
      shaderType = gl.FRAGMENT_SHADER
    } else if (
      shaderType !== gl.VERTEX_SHADER &&
      shaderType !== gl.FRAGMENT_SHADER
    ) {
      throw '*** Error: unknown shader type'
    }
  }

  return loadShader(
    gl,
    shaderSource,
    opt_shaderType ? opt_shaderType : shaderType,
    opt_errorCallback
  )
}

function createProgram(
  gl,
  shaders,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  const errFn = opt_errorCallback
  const program = gl.createProgram()
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader)
  })
  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(
        program,
        opt_locations ? opt_locations[ndx] : ndx,
        attrib
      )
    })
  }
  gl.linkProgram(program)

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program)
    errFn('Error in program linking:' + lastError)

    gl.deleteProgram(program)
    return null
  }
  return program
}

function createProgramFromScripts(
  gl,
  shaderScriptIds,
  opt_attribs,
  opt_locations,
  opt_errorCallback
) {
  const shaders = []
  for (let ii = 0; ii < shaderScriptIds.length; ++ii) {
    shaders.push(
      createShaderFromScript(
        gl,
        shaderScriptIds[ii],
        gl[defaultShaderType[ii]],
        opt_errorCallback
      )
    )
  }
  return createProgram(
    gl,
    shaders,
    opt_attribs,
    opt_locations,
    opt_errorCallback
  )
}

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector('#canvas')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  // setup GLSL program
  var program = createProgramFromScripts(gl, [
    'vertex-shader-2d',
    'fragment-shader-2d',
  ])
  gl.useProgram(program)

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, 'a_position')

  // lookup uniforms
  var colorLocation = gl.getUniformLocation(program, 'u_color')
  var matrixLocation = gl.getUniformLocation(program, 'u_matrix')

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer()

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  requestAnimationFrame(drawScene)

  // Draw the scene.
  function drawScene(now) {
    now *= 0.001 // convert to seconds

    resizeCanvasToDisplaySize(gl.canvas)

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program)

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation)

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2 // 2 components per iteration
    var type = gl.FLOAT // the data is 32bit floats
    var normalize = false // don't normalize the data
    var stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0 // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    )

    // Set Geometry.
    var radius =
      Math.sqrt(
        gl.canvas.width * gl.canvas.width + gl.canvas.height * gl.canvas.height
      ) * 0.5
    var angle = 0
    var x = Math.cos(angle) * radius
    var y = Math.sin(angle) * radius
    var centerX = gl.canvas.width / 2
    var centerY = gl.canvas.height / 2
    setGeometry(gl, centerX + x, centerY + y, centerX - x, centerY - y)

    // Compute the matrices
    var projectionMatrix = projection(gl.canvas.width, gl.canvas.height)

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, projectionMatrix)

    // Draw in red
    gl.uniform4fv(colorLocation, [1, 0, 0, 1])

    // Draw the geometry.
    var primitiveType = gl.LINES
    var offset = 0
    var count = 2
    gl.drawArrays(primitiveType, offset, count)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    requestAnimationFrame(drawScene)
  }

  function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    // Check if the canvas is not the same size.
    const needResize =
      canvas.width !== displayWidth || canvas.height !== displayHeight

    if (needResize) {
      // Make the canvas the same size
      canvas.width = displayWidth
      canvas.height = displayHeight
    }

    return needResize
  }
}

// Fill the buffer with a line
function setGeometry(gl, x1, y1, x2, y2) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y2]),
    gl.STATIC_DRAW
  )
}

main()
