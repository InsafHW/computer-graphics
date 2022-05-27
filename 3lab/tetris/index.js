function prepareLayout() {
  const TETRIS_WIDTH_BLOCKS_COUNT = 10
  const TETRIS_HEIGHT_BLOCKS_COUNT = 20

  const container = document.getElementById('container')

  function _initLateralFace() {
    const leftSideBlock = container.querySelector('#left-side')
    const rightSideBlock = container.querySelector('#right-side')
    for (let i = 0; i < TETRIS_HEIGHT_BLOCKS_COUNT + 1; i++) {
      const leftBlock = document.createElement('div')
      const rightBlock = document.createElement('div')
      leftBlock.classList.add('block')
      rightBlock.classList.add('block')
      leftSideBlock.appendChild(leftBlock)
      rightSideBlock.appendChild(rightBlock)
    }
  }

  function _initBottomFace() {
    const bottomSideBlock = container.querySelector('#bottom-side')
    for (let i = 0; i < TETRIS_WIDTH_BLOCKS_COUNT; i++) {
      const block = document.createElement('div')
      block.classList.add('block')
      bottomSideBlock.appendChild(block)
    }
  }

  _initLateralFace()
  _initBottomFace()
}

prepareLayout()
