import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const dir = path.join(dirname(fileURLToPath(import.meta.url)), 'input.txt')
export const str = readFileSync(dir, 'utf8')

export const part1 = async () => {
    throw new Error('Not answered')
}

export const part2 = async () => {
    throw new Error('Not answered')
}
