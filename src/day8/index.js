import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

/**
 * @typedef {Object} MapNode
 * @property {string} L - the left node
 * @property {string} R - the right node
 * // Part 2
 * @property {boolean} start - is this the start node?
 */

function makeLinkedList(input) {
    /** @type {Map<string,MapNode>} */
    const map = new Map()
    const nodes = input.split('\n').map((val) => {
        const [name, connectedNodes] = val.split(' = ')
        const [L, R] = connectedNodes.replace(/[^A-Z,]/g, '').split(',')
        const node = map.has(name)
            ? map.get(name)
            : {
                  L,
                  R,
                  start: name[name.length - 1] === 'A', // Part 2
              }
        map.set(name, node)
    })
    return map
}

function countSteps(list, start, isEnd /* helps with Part 2 */, directions) {
    let steps = 0
    let current = start
    let index = 0
    while (!isEnd(current)) {
        const direction = directions[index]
        const node = list.get(current)
        if (node[direction]) {
            current = node[direction]
            steps++
        } else {
            throw new Error('No path found')
        }
        index++
        if (index >= directions.length) {
            index = 0
        }
    }
    return steps
}

export const part1 = async () => {
    // Linked list
    const [input, listStr] = str.split('\n\n')
    const list = makeLinkedList(listStr)
    const directions = input.split('')
    return countSteps(list, 'AAA', (v) => v === 'ZZZ', directions)
}

/** https://www.geeksforgeeks.org/lcm-of-given-array-elements/ */

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function gcd(a, b) {
    if (b == 0) return a
    return gcd(b, a % b)
}

/**
 * @param {number[]} [arr=[]]
 * @return {number}
 */
function findLCM(arr = []) {
    let ans = arr[0] || Number.NaN
    for (let i = 1; i < arr.length; i++) {
        ans = (arr[i] * ans) / gcd(arr[i], ans)
    }
    return ans
}

export const part2 = async () => {
    // Brute force is not gonna work here, you have to determine how many steps
    // it takes to get to the end node from each start node, and then find the
    // LCM of all the step counts
    const [input, listStr] = str.split('\n\n')
    const list = makeLinkedList(listStr)
    const directions = input.split('')
    const start = Array.from(list.entries()).filter(([, node]) => node.start)
    const steps = start.map(([name]) => {
        return countSteps(
            list,
            name,
            (v) => v[v.length - 1] === 'Z',
            directions
        )
    })
    return findLCM(steps)
}
