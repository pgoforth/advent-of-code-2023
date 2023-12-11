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
    const { row, col, direction } = this
    const current = rows[row][col]
    switch (current) {
        case 'S': {
            return true
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
}

/**
 * @param {string[]} rows
 * @return {PipeNode|true}
 */
function findStart(rows) {
    const startRow = rows.findIndex((row) => row.includes('S'))
    const startCol = rows[startRow].indexOf('S')
    const attempts = [
        [startRow - 1, startCol, 'N'],
        [startRow + 1, startCol, 'S'],
        [startRow, startCol - 1, 'W'],
        [startRow, startCol + 1, 'E'],
    ]
    let [row, col, direction] = attempts.shift()
    let current = new PipeNode(row, col, direction)
    while (current !== null) {
        try {
            findNext.call(current, rows)
            return current
        } catch (e) {
            if (attempts.length === 0) {
                current = null
            } else {
                ;[row, col, direction] = attempts.shift()
                current = new PipeNode(row, col, direction)
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
            current = current.findNext(rows)
        } catch (e) {
            throw new Error('Something went wrong')
        }
    }
    return path
}

export const part1 = async () => {
    const rows = str.split('\n')
    const path = findLoopPath(rows)
    const answer = path.length / 2
    if (answer !== 7093) {
        throw new Error('Incorrect answer')
    }
    return answer
}

export const part2 = async () => {
    throw new Error('Not answered')
}
