import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

const pipeDirections = {
    J: 'WN',
    L: 'EN',
    7: 'WS',
    F: 'ES',
    '-': 'WE',
    '|': 'NS',
}

function findNext(rows) {
    const { row, col, direction, next, prev } = this
    const current = rows[row][col]
    switch (current) {
        case 'S': {
            if (prev) {
                return true
            }
            if (direction === 'N') {
                return new PipeNode(row - 1, col, 'N')
            } else if (direction === 'S') {
                return new PipeNode(row + 1, col, 'S')
            } else if (direction === 'E') {
                return new PipeNode(row, col + 1, 'E')
            } else if (direction === 'W') {
                return new PipeNode(row, col - 1, 'W')
            }
        }
        case 'J':
            if (direction === 'E') {
                return new PipeNode(row - 1, col, 'N')
            } else if (direction === 'S') {
                return new PipeNode(row, col - 1, 'W')
            }
            throw new Error('Invalid direction')
        case 'L':
            if (direction === 'W') {
                return new PipeNode(row - 1, col, 'N')
            } else if (direction === 'S') {
                return new PipeNode(row, col + 1, 'E')
            }
            throw new Error('Invalid direction')
        case '7':
            if (direction === 'E') {
                return new PipeNode(row + 1, col, 'S')
            } else if (direction === 'N') {
                return new PipeNode(row, col - 1, 'W')
            }
            throw new Error('Invalid direction')
        case 'F':
            if (direction === 'W') {
                return new PipeNode(row + 1, col, 'S')
            } else if (direction === 'N') {
                return new PipeNode(row, col + 1, 'E')
            }
            throw new Error('Invalid direction')
        case '-':
            if (direction === 'E') {
                return new PipeNode(row, col + 1, 'E')
            } else if (direction === 'W') {
                return new PipeNode(row, col - 1, 'W')
            }
            throw new Error('Invalid direction')
        case '|':
            if (direction === 'N') {
                return new PipeNode(row - 1, col, 'N')
            } else if (direction === 'S') {
                return new PipeNode(row + 1, col, 'S')
            }
            throw new Error('Invalid direction')
    }
    throw new Error('Invalid direction')
}

const pipeLeftFillChecks = {
    WN: [
        [0, -1],
        [1, -1],
        [1, 0],
    ],
    SE: [[-1, 1]],
    SW: [
        [1, 0],
        [1, 1],
        [0, 1],
    ],
    EN: [[-1, -1]],
    NE: [
        [-1, 0],
        [-1, -1],
        [0, -1],
    ],
    WS: [[1, 1]],
    ES: [
        [0, 1],
        [-1, 1],
        [-1, 0],
    ],
    NW: [[1, -1]],
    SS: [
        [0, 1],
        [1, 1],
        [-1, 1],
    ],
    NN: [
        [0, -1],
        [1, -1],
        [-1, -1],
    ],
    WW: [
        [1, 0],
        [1, 1],
        [1, -1],
    ],
    EE: [
        [-1, 0],
        [-1, 1],
        [-1, -1],
    ],
}

class PipeNode {
    next = null
    prev = null

    constructor(row, col, direction) {
        this.row = row
        this.col = col
        this.direction = direction
    }

    findNext(rows) {
        return findNext.call(this, rows)
    }

    left() {
        return (
            pipeLeftFillChecks[`${this.direction}${this.next?.direction}`] ?? []
        )
    }
}

/**
 * @param {string[]} rows
 * @return {PipeNode|true}
 */
function findStart(rows) {
    const startRow = rows.findIndex((row) => row.includes('S'))
    const startCol = rows[startRow].indexOf('S')
    const attempts = ['N', 'S', 'W', 'E']
    let direction = attempts.shift()
    let current = new PipeNode(startRow, startCol, direction)
    while (current !== null) {
        try {
            const next = findNext.call(current, rows)
            current.next = next
            return current
        } catch (e) {
            if (attempts.length === 0) {
                current = null
            } else {
                direction = attempts.shift()
                current = new PipeNode(startRow, startCol, direction)
            }
        }
    }
    throw new Error('No start found')
}

function findLoopPath(rows) {
    const start = findStart(rows)
    const path = []
    let current = start
    while (current !== true) {
        path.push(current)
        try {
            const next = current.findNext(rows)
            if (next === true) {
                break
            }
            current.next = next
            next.prev = current
            current = next
        } catch (e) {
            throw new Error(`Something went wrong: ${e.message}`)
        }
    }
    // Remove the last item because it's the start again
    path.pop()
    path[0].prev = path[path.length - 1]
    return path
}

// This is a visual representation of the path...looks pretty cool
const visualPipeDirections = {
    WN: '╰',
    SE: '╰',
    SW: '╯',
    EN: '╯',
    NE: '╭',
    WS: '╭',
    NW: '╮',
    ES: '╮',
    NN: '│',
    SS: '│',
    EE: '─',
    WW: '─',
}
const visualChars = [...Object.values(visualPipeDirections), '@']
const visualRegExReplace = /[^@╰╯╭╮│─]/g

function visualPath(node) {
    const { row, col } = node
    let arrow =
        visualPipeDirections[`${node.direction}${node.next?.direction}`] || '@'
    return arrow
}

function floodFill(fillChar, lookup, row, col, rowInc = 0, colInc = 0) {
    if (
        row + rowInc >= 0 &&
        col + colInc >= 0 &&
        row + rowInc < lookup.length &&
        col + colInc < lookup[0].length &&
        lookup[row + rowInc] &&
        lookup[row + rowInc][col + colInc] &&
        ![...visualChars, fillChar].includes(
            lookup[row + rowInc][col + colInc]
        ) &&
        lookup[row + rowInc][col + colInc] !== fillChar
    ) {
        lookup[row + rowInc][col + colInc] = fillChar
        floodFill(fillChar, lookup, row, col, rowInc - 1, colInc)
        floodFill(fillChar, lookup, row, col, rowInc + 1, colInc)
        floodFill(fillChar, lookup, row, col, rowInc, colInc - 1)
        floodFill(fillChar, lookup, row, col, rowInc, colInc + 1)
    } else {
        return
    }
}

export const part1 = async () => {
    const rows = str.split('\n')
    const path = findLoopPath(rows)
    const answer = path.length / 2
    return answer
}

export const part2 = async () => {
    const rows = str.split('\n')
    const visual = rows.map((row) => new Array(row.length).fill(' '))
    const path = findLoopPath(rows)
    path.forEach((node) => {
        const { row, col } = node
        visual[row][col] = visualPath(node)
    })
    path.forEach((node) => {
        let { row, col } = node
        const outside = node.left()
        outside.forEach((check) => {
            const [rowInc, colInc] = check
            floodFill('#', visual, row, col, rowInc, colInc)
        })
    })

    // Pretty
    // console.log(visual.map((row) => row.join('')).join('\n'))

    return visual.map((row) => row.join('').replace(/[^#]/g, '')).join('')
        .length
}
