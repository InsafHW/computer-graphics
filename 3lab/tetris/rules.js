const LEVEL_PASSED_MULTIPLIER = 10

/**
 * @type {Map<number, {
 *    linesToDestroy: number,
 *    levelFps: number,
 * }>}
 */
const levelsConditionMap = new Map()

const DEFAULT_LINES_TO_DESTROY = 5
const DEFAULT_LEVEL_FPS = 35
for (let i = 0; i < 20; i++) {
  levelsConditionMap.set(i + 1, {
    linesToDestroy: DEFAULT_LINES_TO_DESTROY + i * 2,
    levelFps: Math.max(5, DEFAULT_LEVEL_FPS - i * 2),
  })
}

const SCORES_FOR_DELETE_ROWS = {
  1: 10,
  2: 30,
  3: 70,
  4: 150,
}

export { levelsConditionMap, SCORES_FOR_DELETE_ROWS, LEVEL_PASSED_MULTIPLIER }
