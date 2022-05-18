import {
  getDefaultVertexShader,
  getRenderProgramVertexShader,
  getDropProgramFragmentShader,
  getUpdateProgramFragmentShader,
  getRenderProgramFragmentShader,
} from './utils/shaders.js'

let gl = null

function createProgram(vertexSource, fragmentSource) {
  function compileSource(type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('compile error: ' + gl.getShaderInfoLog(shader))
    }
    return shader
  }

  const program = {
    id: gl.createProgram(),
    uniforms: {},
    locations: {},
  }

  gl.attachShader(program.id, compileSource(gl.VERTEX_SHADER, vertexSource))
  gl.attachShader(program.id, compileSource(gl.FRAGMENT_SHADER, fragmentSource))
  gl.linkProgram(program.id)
  if (!gl.getProgramParameter(program.id, gl.LINK_STATUS)) {
    throw new Error('link error: ' + gl.getProgramInfoLog(program.id))
  }

  // Fetch the uniform and attribute locations
  gl.useProgram(program.id)
  gl.enableVertexAttribArray(0)
  let match = null
  const regex = /uniform (\w+) (\w+)/g
  const shaderCode = vertexSource + fragmentSource
  while ((match = regex.exec(shaderCode)) != null) {
    const name = match[2]
    program.locations[name] = gl.getUniformLocation(program.id, name)
  }

  return program
}

function bindTexture(texture, unit) {
  gl.activeTexture(gl.TEXTURE0 + (unit || 0))
  gl.bindTexture(gl.TEXTURE_2D, texture)
}

function extractUrl(value) {
  const urlMatch = /url\(["']?([^"']*)["']?\)/.exec(value)
  if (urlMatch == null) {
    return null
  }

  return urlMatch[1]
}

// RIPPLES CLASS DEFINITION
// =========================

const Ripples = function () {
  this.ripplesElement = document.getElementById('ripples')
  this.ripplesElement.classList.add('jquery-ripples')
  this.canvasElement = document.getElementById('canvas')
  const that = this

  // Init properties from options
  this.resolution = 256
  this.textureDelta = new Float32Array([
    1 / this.resolution,
    1 / this.resolution,
  ])

  this.perturbance = 0.03
  this.dropRadius = 20

  this.canvasElement.width = this.ripplesElement.clientWidth
  this.canvasElement.height = this.ripplesElement.clientHeight

  this.gl = gl = this.canvasElement.getContext('webgl')

  // Init rendertargets for ripple data.
  this.textures = []
  this.framebuffers = []
  this.bufferWriteIndex = 0
  this.bufferReadIndex = 1

  this.loadConfig()

  for (let i = 0; i < 2; i++) {
    const texture = gl.createTexture()
    const framebuffer = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.resolution,
      this.resolution,
      0,
      gl.RGBA,
      gl.FLOAT,
      new Float32Array(this.resolution * this.resolution * 4)
    )

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    )

    this.textures.push(texture)
    this.framebuffers.push(framebuffer)
  }

  // Init GL stuff
  this.quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, +1, -1, +1, +1, -1, +1]),
    gl.STATIC_DRAW
  )

  this.initShaders()
  this.initTexture()
  this.loadImage()
  this.setupPointerEvents()

  // Set correct clear color and blend mode (regular alpha blending)
  gl.clearColor(0, 0, 0, 0)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  // Init animation
  function startAnimation() {
    that.step()
    requestAnimationFrame(startAnimation)
  }

  requestAnimationFrame(startAnimation)
}

Ripples.prototype = {
  setupPointerEvents: function () {
    this.ripplesElement.addEventListener('mousedown', ({ pageX, pageY }) =>
      this.drop(pageX, pageY, this.dropRadius * 1.5, 0.14)
    )
  },

  loadImage: function () {
    const image = new Image()
    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.backgroundTexture)
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      )
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image
      )

      this.backgroundWidth = image.width
      this.backgroundHeight = image.height
    }
    image.src = extractUrl(
      getComputedStyle(this.ripplesElement).backgroundImage
    )
  },

  step: function () {
    this.computeTextureBoundaries()
    this.update()
    this.render()
  },

  drawQuad: function () {
    const gl = this.gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  },

  render: function () {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.viewport(0, 0, this.canvasElement.width, this.canvasElement.height)

    gl.enable(gl.BLEND)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(this.renderProgram.id)

    bindTexture(this.backgroundTexture, 0)
    bindTexture(this.textures[0], 1)

    gl.uniform1f(this.renderProgram.locations.perturbance, this.perturbance)
    gl.uniform2fv(
      this.renderProgram.locations.topLeft,
      this.renderProgram.uniforms.topLeft
    )
    gl.uniform2fv(
      this.renderProgram.locations.bottomRight,
      this.renderProgram.uniforms.bottomRight
    )
    gl.uniform2fv(
      this.renderProgram.locations.containerRatio,
      this.renderProgram.uniforms.containerRatio
    )
    gl.uniform1i(this.renderProgram.locations.samplerBackground, 0)
    gl.uniform1i(this.renderProgram.locations.samplerRipples, 1)

    this.drawQuad()
    gl.disable(gl.BLEND)
  },

  update: function () {
    const gl = this.gl
    gl.viewport(0, 0, this.resolution, this.resolution)

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex])
    bindTexture(this.textures[this.bufferReadIndex])
    gl.useProgram(this.updateProgram.id)

    this.drawQuad()

    this.swapBufferIndices()
  },

  swapBufferIndices: function () {
    this.bufferWriteIndex = 1 - this.bufferWriteIndex
    this.bufferReadIndex = 1 - this.bufferReadIndex
  },

  computeTextureBoundaries: function () {
    const { clientHeight, clientWidth } = this.ripplesElement
    const scale = Math.max(
      clientWidth / this.backgroundWidth,
      clientHeight / this.backgroundHeight
    )
    const backgroundWidth = this.backgroundWidth * scale
    const backgroundHeight = this.backgroundHeight * scale

    this.renderProgram.uniforms.topLeft = new Float32Array([0, 0])
    this.renderProgram.uniforms.bottomRight = new Float32Array([
      clientWidth / backgroundWidth,
      clientHeight / backgroundHeight,
    ])

    const maxSide = Math.max(
      this.canvasElement.width,
      this.canvasElement.height
    )

    this.renderProgram.uniforms.containerRatio = new Float32Array([
      this.canvasElement.width / maxSide,
      this.canvasElement.height / maxSide,
    ])
  },

  initShaders: function () {
    const gl = this.gl
    const vertexShader = getDefaultVertexShader()
    const renderProgramVertexShader = getRenderProgramVertexShader()
    const dropProgramFragmentShader = getDropProgramFragmentShader()
    const updateProgramFragmentShader = getUpdateProgramFragmentShader()
    const renderProgramFragmentShader = getRenderProgramFragmentShader()

    this.dropProgram = createProgram(vertexShader, dropProgramFragmentShader)
    this.updateProgram = createProgram(
      vertexShader,
      updateProgramFragmentShader
    )
    gl.uniform2fv(this.updateProgram.locations.delta, this.textureDelta)

    this.renderProgram = createProgram(
      renderProgramVertexShader,
      renderProgramFragmentShader
    )
    gl.uniform2fv(this.renderProgram.locations.delta, this.textureDelta)
  },

  initTexture: function () {
    const gl = this.gl
    this.backgroundTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  },

  drop: function (x, y, radius, strength) {
    const gl = this.gl
    const { clientWidth, clientHeight } = this.ripplesElement
    const longestSide = Math.max(clientWidth, clientHeight)

    radius = radius / longestSide

    const dropPosition = new Float32Array([
      (2 * x - clientWidth) / longestSide,
      (clientHeight - 2 * y) / longestSide,
    ])

    gl.viewport(0, 0, this.resolution, this.resolution)

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex])
    bindTexture(this.textures[this.bufferReadIndex])

    gl.useProgram(this.dropProgram.id)
    gl.uniform2fv(this.dropProgram.locations.center, dropPosition)
    gl.uniform1f(this.dropProgram.locations.radius, radius)
    gl.uniform1f(this.dropProgram.locations.strength, strength)

    this.drawQuad()

    this.swapBufferIndices()
  },

  loadConfig: function () {
    const gl = this.gl
    const texture = gl.createTexture()
    const framebuffer = gl.createFramebuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.FLOAT, null)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    )
    gl.getExtension('OES_texture_float')
    gl.getExtension('OES_texture_float_linear')
  },
}

const ripples = new Ripples()
