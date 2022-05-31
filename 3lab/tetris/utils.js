function getRandomRgba() {
  const red = Math.random() * 255
  const green = Math.random() * 255
  const blue = Math.random() * 255
  return `rgba(${red}, ${green}, ${blue}, 1)`
}

function getRandomArrayItem(array) {
  const min = 0
  const max = array.length - 1
  const index = Math.floor(Math.random() * (max - min + 1)) + min
  return array[index]
}

// https://codereview.stackexchange.com/a/186834
function rotate(matrix) {
  const N = matrix.length - 1
  const result = matrix.map((row, i) => row.map((_, j) => matrix[N - j][i]))
  return result
}

export { getRandomRgba, getRandomArrayItem, rotate }
