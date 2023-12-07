import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

const STR_NUMBERS = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
]

export const part1 = async () => {
    return str
        .split('\n') // split into lines
        .map((val) => val.replace(/[^\d]/g, '')) // remove non-digits
        .map((val) => parseInt(`${val[0]}${val[val.length - 1]}`, 10)) // get first and last digit
        .reduce((acc, val) => acc + val, 0) // sum
}

export const part2 = async () => {
    return str
        .split('\n') // split into lines
        .map((val) => {
            const matches = []
            const regex =
                /one|two|three|four|five|six|seven|eight|nine|zero|\d/gi
            let match = regex.exec(val)
            while (match != null) {
                matches.push(match[0])
                // Handles string cases like this 'Onetwoneighthree'
                regex.lastIndex = match.index + 1
                match = regex.exec(val)
            }
            return matches
                .reduce((acc, val) => {
                    if (STR_NUMBERS.includes(`${val}`.toLowerCase())) {
                        acc.push(STR_NUMBERS.indexOf(val))
                    } else {
                        acc.push(val)
                    }
                    return acc
                }, [])
                .join('')
        }) // remove non-digits and convert named digits to numbers
        .map((val) => parseInt(`${val[0]}${val[val.length - 1]}`, 10)) // get first and last digit
        .reduce((acc, val) => acc + val, 0) // sum
}
