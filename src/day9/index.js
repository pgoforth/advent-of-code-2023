import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

export const part1 = async () => {
    const extrapolations = str.split('\n').map((line) => {
        const values = line.split(' ').map(Number)
        const rows = [values]
        let current = [...values]
        while (current.length > 0 && current.some((value) => value !== 0)) {
            current = current.reduce((acc, value, idx, list) => {
                if (idx === 0) {
                    return acc
                }
                const last = current[idx - 1]
                return [...acc, value - last]
            }, [])
            rows.push(current)
        }
        return rows.reduce((acc, row) => {
            const last = row[row.length - 1]
            return acc + last
        }, 0)
    })
    return extrapolations.reduce((acc, value) => acc + value, 0)
}

export const part2 = async () => {
    throw new Error('Not answered')
}
