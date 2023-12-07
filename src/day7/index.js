import { dirname, parse, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

const cardStrength = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    T: 10,
    J: 11, // Jack
    Q: 12, // Queen
    K: 13, // King
    A: 14, // Ace
}

const cardHands = [
    [/[2-9TJQKA]/], // any card...value is 0
    [/([2-9TJQKA])\1{1}/], // onePair
    [/([2-9TJQKA])\1{1}/, /([2-9TJQKA])\1{1}/], // twoPair
    [/([2-9TJQKA])\1{2}/], // threeOfAKind
    [/([2-9TJQKA])\1{2}/, /([2-9TJQKA])\1{1}/], // fullHouse
    [/([2-9TJQKA])\1{3}/], // fourOfAKind
    [/([2-9TJQKA])\1{4}/], // fiveOfAKind
]

const sortHand = (a) => {
    return a
        .split('')
        .sort((a, b) => cardStrength[a] - cardStrength[b])
        .join('')
}

const strongerHand = (a = '', b = '') => {
    for (let i = 0; i < a.length; i++) {
        if (cardStrength[a[i]] > cardStrength[b[i]]) return a
        if (cardStrength[a[i]] < cardStrength[b[i]]) return b
    }
    return null
}

const evaluatePokerHand = (hand = '') => {
    for (let i = cardHands.length - 1; i >= 0; i--) {
        let orderedHand = sortHand(hand)
        const evalHand = cardHands[i]
        const remainingHand = evalHand.reduce((acc = '', handCheck, idx) => {
            if (idx !== 0 && acc === orderedHand) {
                // If we didn't match all the regexp in the group, return the original ordered hand
                return orderedHand
            }
            const regex = new RegExp(handCheck)
            const handMatch = regex.test(acc)
            if (handMatch) {
                return acc.replace(regex, '')
            }
            return orderedHand
        }, orderedHand)
        if (remainingHand !== orderedHand) {
            return i
        }
    }
    return 0
}

const sortHandsByRank = ([a], [b]) => {
    const scoreA = evaluatePokerHand(a)
    const scoreB = evaluatePokerHand(b)
    if (scoreA > scoreB) return 1
    if (scoreA < scoreB) return -1
    // Same score, check the cards
    const stronger = strongerHand(a, b)
    if (stronger === a) return 1
    return stronger ? -1 : 0
}

export const part1 = async () => {
    // Simple sorting function
    const orderedHands = str
        .split('\n')
        .map((val) => val.split(' '))
        .sort(sortHandsByRank)

    return orderedHands
        .map(([, bid]) => bid)
        .reduce((acc, bidString, rank) => {
            return acc + parseInt(bidString, 10) * (rank + 1)
        }, 0)
}

export const part2 = async () => {
    throw new Error('Not answered')
}
