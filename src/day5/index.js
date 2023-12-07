import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

/**
 * @typedef {Object} SourceToDestMap
 * @property {number} dest - the destination start value
 * @property {number} source - the source start value
 * @property {number} range - the range of values
 */

/**
 * @typedef {Object} Destination
 * @property {string} from - the source key
 * @property {string} to - the destination key
 * @property {SourceToDestMap[]} map - scripts rule-classification key-value pairs
 */

/**
 * @typedef {Object} SeedRange
 * @property {number} start - the start of the seed range
 * @property {number} spread - the number of values in the seed range
 * @property {string} [match] - the area of the seed range that matches the destination
 * @property {SeedRange?} [from] - the source seed range
 */

/**
 * @param {string} [input='']
 * @return {SourceToDestMap[]}
 */
function makeMap(input = '') {
    return (
        input
            .split('\n')
            .map((line) => {
                return line
                    .split(' ')
                    .map((s) => s.trim())
                    .map((s) => parseInt(s, 10))
            })
            // Sort by source so we can move through the table in order
            .sort(([, s1 = 0], [, s2 = 0]) => s1 - s2)
            .map(([dest = 0, source = 0, range = 0]) => {
                return { dest, source, range }
            })
    )
}

/**
 * @return {{input: string, dest: Destination[]}}
 */
function formatInputDest() {
    const [input, ...maps] = str.split('\n\n').map((s) => s.trim())
    const dest = maps.map((s) => {
        const [mapName = '', value] = s.split(' map:\n')
        const [from = '', to = ''] = mapName.split('-to-')
        return { from, map: makeMap(value), to }
    })
    return { input, dest }
}

/**
 * @param {number} [value=0]
 * @param {Destination[]} dest - the destination table
 * @return {number} - the mapped value from the start to the end
 */
function mapValue(value = 0, dest = []) {
    return dest.reduce((v, { map }) => {
        const newValue = map.reduce((acc, { dest, source, range }) => {
            if (acc > 0) {
                /*
                 *  Why compare to 0 and not v? Because a mapped value could potentially === v,
                 * and we want to get the right mapped value
                 */
                return acc
            }
            const offset = v - source
            if (offset >= 0 && offset < range) {
                // value is in range
                return dest + offset
            }
            return acc
        }, 0)
        if (newValue <= 0) {
            // Value was not mapped, so according to the rules, it's the same value
            return v
        }
        return newValue
    }, value)
}

/**
 * @param {SeedRange} seedRange
 * @param {SourceToDestMap[]} [map=[]]
 * @return {SeedRange[]}
 */
function mapRange(seedRange, map = []) {
    const { start, spread } = seedRange
    const mapMatches = map.filter(({ source, range }) => {
        return (
            (start <= source && start + spread >= source) || // Range starts before the map and ends inside the map
            (start >= source && start <= source + range) || // Range starts inside the map and ends after the map
            (start <= source && start + spread >= source + range) || // Range starts before the map and ends after the map
            (start >= source && start + spread <= source + range) // Range starts inside the map and ends inside the map
        )
    })
    let remain = spread
    let begin = start
    const newRanges = []
    mapMatches.forEach(({ dest, source, range }) => {
        let offset = begin - source
        if (offset < 0) {
            /**
             * Part of the range lies before the map source begins,
             * so we need to adjust our start, add a partial range
             */
            const newRange = {
                start: begin,
                spread: source - begin,
            }
            newRanges.push(newRange)
            begin = source
            remain -= source - begin
            offset = 0
        }
        // Check if the entire range is above the map
        if (offset > range) {
            // Entire range is above this map, so lets continue to the next map
            return
        }
        /**
         * our range starts at or after this map source begins,
         * so lets check if is entirely inside
         */
        if (offset + remain <= range) {
            // Entire range is inside this map, so lets map to `dest` and continue to the next range
            const newRange = {
                start: dest + offset,
                spread: remain,
            }
            newRanges.push(newRange)
            remain = 0
        } else {
            /**
             * Part of the range lies outside the map,
             * so we need to adjust our start, add a partial map to `dest`, and continue to the next map
             */
            const remainingRange = range - offset
            const newRange = {
                start: dest + offset,
                spread: remainingRange,
            }
            newRanges.push(newRange)
            begin += remainingRange
            remain -= remainingRange
        }
    })
    // If we have any remaining range, add it to the end
    if (remain > 0) {
        const newRange = {
            start: begin,
            spread: remain,
        }
        newRanges.push(newRange)
    }
    return newRanges
}

export const part1 = async () => {
    const { dest, input } = formatInputDest()
    return input
        .split(': ')[1]
        .split(' ')
        .map((value) => mapValue(parseInt(value, 10), dest)) // Map from start to end
        .reduce((acc, value) => Math.min(acc, value), Number.MAX_SAFE_INTEGER) // Closest location
}

export const part2 = async () => {
    const { dest, input } = formatInputDest()
    let seedRanges = input?.split(':')[1] || ''
    let rangeRegex = / (\d+) (\d+)/g
    let array1
    /** @type {SeedRange[]} */
    let ranges = []

    while ((array1 = rangeRegex.exec(seedRanges)) !== null) {
        const [, startStr = '', spreadStr = ''] = array1
        const start = parseInt(startStr, 10)
        const spread = parseInt(spreadStr, 10)
        ranges.push({ start, spread })
    }

    ranges.sort((a, b) => a.start - b.start)

    // We have to map each range and return new ranges to apply to the next table
    const newRanges = dest.reduce((acc, { from, map, to }, idx, list) => {
        const newRanges = []
        for (const range of acc) {
            newRanges.push(...mapRange(range, map))
        }
        // Sort the new ranges by start ASC
        return (
            newRanges
                .sort((a, b) => a.start - b.start)
                // Remove any duplicate ranges
                .filter(
                    (r, i, l) =>
                        l.findIndex(
                            (a) => a.spread === r.spread && a.start === r.start
                        ) == i
                )
        )
    }, ranges)

    return newRanges.reduce((loc, { start, spread }) => {
        return Math.min(loc, start)
    }, Number.MAX_SAFE_INTEGER)
}
