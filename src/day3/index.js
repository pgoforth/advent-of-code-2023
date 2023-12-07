import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

function partsMapFilter(sIdx = [], gLookup = {}) {
    return str
        .split('\n')
        .map((line, row) => {
            let array1
            const parts = []
            let range = []
            let integer = ''
            const regex = /\d/g
            while ((array1 = regex.exec(line)) !== null) {
                if (range.length === 0) {
                    integer = `${array1[0]}`
                    range.push(array1.index)
                } else {
                    if (array1.index - range[range.length - 1] === 1) {
                        // sequential digits
                        integer += `${array1[0]}`
                        if (range.length === 1) {
                            range.push(array1.index)
                        } else {
                            range[range.length - 1] = array1.index
                        }
                    } else {
                        parts.push([
                            parseInt(integer, 10),
                            Math.max(range[0] - 1, 0),
                            Math.min(
                                range[range.length - 1] + 1,
                                line.length - 1
                            ),
                        ])
                        integer = `${array1[0]}`
                        range = []
                        range.push(array1.index)
                    }
                }
            }
            if (range.length > 0) {
                parts.push([
                    parseInt(integer, 10),
                    Math.max(range[0] - 1, 0),
                    Math.min(range[range.length - 1] + 1, line.length - 1),
                ])
            }
            return parts
        })
        .map((parts, row) =>
            parts.filter(([partNumber, start, end]) => {
                const prev = sIdx[row - 1]
                const current = sIdx[row]
                const next = sIdx[row + 1]
                const pMatch = prev
                    ? prev.filter((pIdx) => pIdx >= start && pIdx <= end)
                    : []
                const match = current
                    ? current.filter((pIdx) => pIdx >= start && pIdx <= end)
                    : []
                const nMatch = next
                    ? next.filter((pIdx) => pIdx >= start && pIdx <= end)
                    : []
                if (
                    pMatch.length > 0 ||
                    match.length > 0 ||
                    nMatch.length > 0
                ) {
                    // BEGIN : Part 2 lookup table
                    if (pMatch.length > 0) {
                        for (let i = 0; i < pMatch.length; i++) {
                            try {
                                gLookup[`${row - 1}:${pMatch[i]}`].push(
                                    partNumber
                                )
                            } catch (e) {
                                // Not a gear toucher
                            }
                        }
                    }
                    if (match.length > 0) {
                        for (let i = 0; i < match.length; i++) {
                            try {
                                gLookup[`${row}:${match[i]}`].push(partNumber)
                            } catch (e) {
                                // Not a gear toucher
                            }
                        }
                    }
                    if (nMatch.length > 0) {
                        for (let i = 0; i < nMatch.length; i++) {
                            try {
                                gLookup[`${row + 1}:${nMatch[i]}`].push(
                                    partNumber
                                )
                            } catch (e) {
                                // Not a gear toucher
                            }
                        }
                    }
                    //  END  : Part 2 lookup table
                    return true
                } else {
                    return false
                }
            })
        )
}

export const part1 = async (gLookup = {}) => {
    const sIdx = str.split('\n').map((line, row) => {
        let array1
        const symbolindecies = []
        const regex = /[^\d\.]/g
        while ((array1 = regex.exec(line)) !== null) {
            symbolindecies.push(array1.index)
        }
        return symbolindecies
    })

    return partsMapFilter(sIdx, gLookup).reduce((acc, parts, row) => {
        return (
            acc +
            parts
                .map(([partNumber]) => partNumber)
                .reduce((acc, partNumber) => acc + partNumber, 0)
        )
    }, 0)
}

export const part2 = async () => {
    let gLookup = {}
    let sIdx = str.split('\n').map((line, row) => {
        let array1
        const symbolindecies = []
        const regex = /\*/g
        while ((array1 = regex.exec(line)) !== null) {
            gLookup[`${row}:${array1.index}`] = []
            symbolindecies.push(array1.index)
        }
        return symbolindecies
    })

    partsMapFilter(sIdx, gLookup)

    return Object.entries(gLookup)
        .filter(([key, value]) => {
            return value.length === 2
        })
        .reduce((acc, [key, value]) => {
            return acc + value.reduce((a, partNumber) => a * partNumber, 1)
        }, 0)
}
