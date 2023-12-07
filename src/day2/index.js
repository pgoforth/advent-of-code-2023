import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

const ORDERED_COLORS = ['red', 'green', 'blue']

function mapGame(line = '') {
    return {
        gameNum: parseInt(line.split(':')[0].replace(/[^\d]/g, '')),
        handfuls: line
            .split(':')[1]
            .split(';')
            .map((val) =>
                val
                    .split(',')
                    .map((count) => count.trim())
                    // Sort the colors by the order in ORDERED_COLORS, in case they're out of order
                    .sort(
                        (a, b) =>
                            ORDERED_COLORS.indexOf(
                                a.toLowerCase().replace(/[^a-z]/g, '')
                            ) -
                            ORDERED_COLORS.indexOf(
                                b.toLowerCase().replace(/[^a-z]/g, '')
                            )
                    )
                    .reduce(
                        (acc, countColor, index, list) => {
                            const len = list.length
                            const colorName = countColor
                                .toLowerCase()
                                .replace(/[^a-z]/g, '')
                            const idx = ORDERED_COLORS.indexOf(colorName)
                            if (idx !== -1) {
                                // Only store valid colors...in case there's a purple in there
                                acc[idx] = parseInt(
                                    countColor.replace(/[^\d]/g, ''),
                                    10
                                )
                            }
                            return acc
                        },
                        [0, 0, 0]
                    )
            ),
    }
}

export const part1 = async () => {
    // Actual totals of valid games
    const totals = [12, 13, 14]

    return str
        .split('\n')
        .map(mapGame)
        .filter(({ handfuls }) => {
            return handfuls.every((handful = [], i) => {
                if (handful.length > 3) {
                    // More than 3 colors...unlikely, but checked anyway
                    return false
                }
                if (handful.some((count) => count < 0)) {
                    // Negative counts...unlikely, but checked anyway
                    return false
                }
                const k = handful.findIndex((count, j) => {
                    return count > totals[j]
                })
                if (k >= 0) {
                    // Too many of a color
                    return false
                }
                return true
            })
        })
        .reduce((sum, { gameNum }) => {
            return sum + gameNum
        }, 0)
}

export const part2 = async () => {
    return str
        .split('\n')
        .map(mapGame)
        .reduce((sum, { handfuls }) => {
            const minimums = handfuls.reduce(
                (acc, handful = [], i) => {
                    return [
                        Math.max(acc[0], handful[0]),
                        Math.max(acc[1], handful[1]),
                        Math.max(acc[2], handful[2]),
                    ]
                },
                [0, 0, 0]
            )
            return sum + minimums.reduce((acc, count, i) => acc * count, 1)
        }, 0)
}
