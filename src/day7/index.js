import { dirname, parse, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

/** @typedef {'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'T'|'J'|'Q'|'K'|'A'} HandCode */
/**
 * @template {string} T
 * @typedef {Record<T,number>} StrengthRecord */
/**
 * @template {string} T
 * @typedef {`${T}${T}${T}${T}${T}`} HandString
 */

/**
 * @typedef {Object} Hand
 * @property {RegExp[]} tests
 * @property {number} score
 */

/** @type {StrengthRecord<HandCode>} */
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

/** @type {StrengthRecord<HandCode>} */
const wildCardStrength = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    T: 10,
    J: 1, // Joker
    Q: 12, // Queen
    K: 13, // King
    A: 14, // Ace
}

/** @type {Hand[]} */
const cardHands = [
    { score: 0, tests: [/[2-9TJQKA]/] }, // any card...value is 0
    { score: 1, tests: [/([2-9TJQKA])\1{1}/] }, // onePair
    { score: 2, tests: [/([2-9TJQKA])\1{1}/, /([2-9TJQKA])\1{1}/] }, // twoPair
    { score: 3, tests: [/([2-9TJQKA])\1{2}/] }, // threeOfAKind
    { score: 4, tests: [/([2-9TJQKA])\1{2}/, /([2-9TJQKA])\1{1}/] }, // fullHouse
    { score: 5, tests: [/([2-9TJQKA])\1{3}/] }, // fourOfAKind
    { score: 6, tests: [/([2-9TJQKA])\1{4}/] }, // fiveOfAKind
]

/** @type {Hand[]} */
const wildCardHands = [
    { score: 0, tests: [/[2-9TQKA]/] }, // any card...value is 0
    { score: 1, tests: [/J{1}/] }, // onePair using a Joker
    { score: 1, tests: [/([2-9TJQKA])\1{1}/] }, // onePair
    // There is no two pair with 2 Jokers because that would be 4 of a kind
    // There is no two pair with 1 Joker because that would be 3 of a kind
    { score: 2, tests: [/([2-9TJQKA])\1{1}/, /([2-9TJQKA])\1{1}/] }, // twoPair
    { score: 3, tests: [/J{2}/] }, // threeOfAKind using 2 Joker
    { score: 3, tests: [/J{1}.?.?([2-9TQKA])\1{1}/] }, // threeOfAKind using 1 Joker (this was the tricky one)
    { score: 3, tests: [/([2-9TJQKA])\1{2}/] }, // threeOfAKind
    // There is no full house with 3 Jokers because that would be 4 of a kind
    // There is no full house with 2 Jokers because that would be 4 of a kind
    { score: 4, tests: [/J{1}.?([2-9TQKA])\1{1}/, /([2-9TQKA])\1{1}/] }, // fullHouse using 1 Joker
    { score: 4, tests: [/([2-9TJQKA])\1{2}/, /([2-9TJQKA])\1{1}/] }, // fullHouse
    { score: 5, tests: [/J{3}/] }, // fourOfAKind using 3 Joker
    { score: 5, tests: [/J{2}.?([2-9TQKA])\1{1}/] }, // fourOfAKind using 2 Joker
    { score: 5, tests: [/J{1}.?([2-9TQKA])\1{2}/] }, // fourOfAKind using 1 Joker
    { score: 5, tests: [/([2-9TJQKA])\1{3}/] }, // fourOfAKind
    { score: 6, tests: [/J{4}/] }, // fiveOfAKind using 4 Joker
    { score: 6, tests: [/J{3}.?([2-9TQKA])\1{1}/] }, // fiveOfAKind using 3 Joker
    { score: 6, tests: [/J{2}.?([2-9TQKA])\1{2}/] }, // fiveOfAKind using 2 Joker
    { score: 6, tests: [/J{1}.?([2-9TQKA])\1{3}/] }, // fiveOfAKind using 1 Joker
    { score: 6, tests: [/([2-9TJQKA])\1{4}/] }, // fiveOfAKind
]

/**
 * @param {HandString<string>} hand
 * @param {StrengthRecord<HandCode>} sort
 * @return {HandString<string>}
 */
const sortHand = (hand, sort = cardStrength) => {
    return hand
        .split('')
        .sort((a, b) => sort[a] - sort[b])
        .join('')
}

/**
 *
 *
 * @param {string} [a='']
 * @param {string} [b='']
 * @param {StrengthRecord<HandCode>} [strength=cardStrength]
 * @return {string|null} the stronger hand or null if they are equal
 */
const strongerHand = (a = '', b = '', strength = cardStrength) => {
    // Then we need to break ties by the strength of the cards
    for (let i = 0; i < a.length; i++) {
        if (strength[a[i]] > strength[b[i]]) return a
        if (strength[a[i]] < strength[b[i]]) return b
    }
    return null
}

const evaluatePokerHand = (
    hand = '',
    handScores = cardHands,
    strength = cardStrength
) => {
    const orderedHand = sortHand(hand, strength)
    // log(orderedHand)
    for (let i = handScores.length - 1; i >= 0; i--) {
        const { score, tests } = handScores[i]
        const remainingHand = tests.reduce((acc = '', handCheck, idx) => {
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
            return score
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

const sortWildHandsByRank = ([a], [b]) => {
    const scoreA = evaluatePokerHand(a, wildCardHands, wildCardStrength)
    const scoreB = evaluatePokerHand(b, wildCardHands, wildCardStrength)
    if (scoreA > scoreB) return 1
    if (scoreA < scoreB) return -1
    // Same score, check the card strength in order
    const stronger = strongerHand(a, b, wildCardStrength)
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
    const orderedHands = str
        .split('\n')
        .map((val) => val.split(' '))
        .sort(sortWildHandsByRank)
        .map(([hand, bid]) => [
            hand,
            bid,
            `${evaluatePokerHand(hand, wildCardHands, wildCardStrength)}`,
        ])

    return orderedHands
        .map(([, bid]) => bid)
        .reduce((acc, bidString, rank) => {
            return acc + parseInt(bidString, 10) * (rank + 1)
        }, 0)
}
