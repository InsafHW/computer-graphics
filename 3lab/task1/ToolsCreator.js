import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'

class ToolsCreator {
    static createCamera() {
        return new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
    }

    static createScene() {
        return new THREE.Scene()
    }

    static createRenderer() {
        return new THREE.WebGLRenderer()
    }
}

export {
    ToolsCreator
}
