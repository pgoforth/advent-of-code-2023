import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

function getDistance(time, totalTime) {
    return time * (totalTime - time)
}

export const part1 = async () => {
    // Creates a bell curve (normal distribution) of the distance traveled
    const [time, distance] = str.split('\n').map((val) =>
        val
            .split(':')[1]
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .map((val) => parseInt(val, 10))
    )
    const races = time.map((val, i) => ({
        time: val,
        distanceToBeat: distance[i],
    }))
    const timesToBeatTheRecordPerRage = races.map((race) => {
        const { time, distanceToBeat } = race
        const aboveTheCurve = []
        for (let i = 0; i < time; i++) {
            if (getDistance(i, time) > distanceToBeat) {
                aboveTheCurve.push(i)
            }
        }
        return aboveTheCurve
    })
    return timesToBeatTheRecordPerRage.reduce((acc, val) => acc * val.length, 1)
}

export const part2 = async () => {
    const [time, distanceToBeat] = str
        .split('\n')
        .map((val) =>
            parseInt(val.split(':')[1].trim().replace(/\s+/g, ''), 10)
        )
    /**
     * So, I've opted to brute force this one. The better way is to
     * find the min and max X value that is above the curve at Y = distanceToBeat
     */
    const aboveTheCurve = []
    for (let i = 0; i < time; i++) {
        if (getDistance(i, time) > distanceToBeat) {
            aboveTheCurve.push(i)
        }
    }

    return aboveTheCurve.length
}
