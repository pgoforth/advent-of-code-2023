import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

export const part1 = async (gLookup = {}) => {
    return str
        .split('\n')
        .map((line) => {
            const [cardNumber, numbers] = line.split(':')
            return {
                cardNumber: parseInt(cardNumber.replace(/[^\d]/g, ''), 10),
                winHave: numbers.split('|').map((numbers) => {
                    return numbers
                        .trim()
                        .replace(/\s+/g, ' ')
                        .split(' ')
                        .map((val) => parseInt(val, 10))
                }),
            }
        })
        .map(({ cardNumber, winHave: [win, have] }) => {
            const winners = have.filter((val) => win.indexOf(val) >= 0)
            // BEGIN : Part 2 lookup table
            gLookup[cardNumber] = { winners, total: 1 }
            //  END  : Part 2 lookup table
            return { cardNumber, winners }
        })
        .reduce((acc, { cardNumber, winners }) => {
            // BEGIN : Part 2 lookup table
            const current = gLookup[cardNumber]
            for (let i = 0; i < current.total; i++) {
                winners.forEach((_, idx) => {
                    const nextCard = cardNumber + idx + 1
                    if (gLookup[nextCard]) {
                        ++gLookup[nextCard].total
                    }
                })
            }
            //  END  : Part 2 lookup table
            return acc + winners.reduce((a, winner) => (a ? a * 2 : 1), 0)
        }, 0)
}

export const part2 = async () => {
    const gLookup = {}
    // Calling Part 1 to populate the lookup table
    await part1(gLookup)
    return Object.values(gLookup).reduce((acc, { total }) => acc + total, 0)
}
