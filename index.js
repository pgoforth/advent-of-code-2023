#!/usr/bin/env node

import { dirname, default as path } from 'path'

import { fileURLToPath } from 'url'
import { readdirSync } from 'fs'

const dayIndex = process.argv.indexOf('-d')
const partIndex = process.argv.indexOf('-p')
let dayValue
let partValue

const __dirname = dirname(fileURLToPath(import.meta.url))

if (dayIndex > -1) {
    // Retrieve the value after -d
    dayValue = process.argv[dayIndex + 1]
} else {
    dayValue = process.argv[2]
}

if (partIndex > -1) {
    // Retrieve the value after -p
    partValue = process.argv[partIndex + 1]
} else {
    partValue = process.argv[3]
}

if (parseInt(dayValue) < 1 || parseInt(dayValue) > 25) {
    console.error(`\x1b[31mDay must be between 1 and 25\x1b[0m`)
    process.exit(1)
}

if (parseInt(partValue) < 1 || parseInt(partValue) > 2) {
    console.error(`\x1b[31mPart must be 1 or 2\x1b[0m`)
    process.exit(1)
}

const srcDir = path.join(__dirname, 'src')

if (!dayValue && !partValue) {
    console.log(`\x1b[33mRunning All solutions\x1b[0m`)
} else if (!partValue) {
    console.log(`\x1b[33mRunning Solutions for Day ${dayValue}\x1b[0m`)
} else {
    console.error(
        `\x1b[31mYou must provide a day, day + part, or no value at all\x1b[0m`
    )
    process.exit(1)
}
;(async function () {
    console.log(`-`)
    let inc = 0
    if (!dayValue && !partValue) {
        // Get all folders in the src directory and run each index.js file in sequence
        const folders = readdirSync(srcDir)
        for (const folder of folders) {
            if (folder !== 'common') {
                const day = parseInt(/\d/g.exec(folder).join(''))
                if (day < 1 || day > 25 || isNaN(day)) {
                    continue
                }
                const index = await import(`${srcDir}/${folder}/index.js`)
                inc++
                if (!index.str) {
                    console.error(
                        `\n\x1b[31m-- No input found for day ${day}\x1b[0m`
                    )
                } else {
                    console.log(`\n\x1b[92mSolutions for Day ${day}\x1b[0m`)
                    try {
                        const answer = await index.part1()
                        if (answer === undefined) {
                            throw `No part 1 for day ${day}`
                        }
                        console.log(`\t\x1b[32mPart 1:\x1b[0m ${answer}`)
                    } catch (e) {
                        console.log(`\t\x1b[31m-- ${e}\x1b[0m`)
                    }
                    try {
                        const answer = await index.part2()
                        if (answer === undefined) {
                            throw `No part 2 for day ${day}`
                        }
                        console.log(`\t\x1b[32mPart 2:\x1b[0m ${answer}`)
                    } catch (e) {
                        console.log(`\t\x1b[31m-- ${e}\x1b[0m`)
                    }
                }
            }
        }
    } else {
        // Run the index.js file in the specified folder as a module
        try {
            const index = await import(`${srcDir}/day${dayValue}/index.js`)
            inc++
            if (!index.str) {
                console.error(
                    `\n\x1b[31m-- No input found for day ${dayValue}\x1b[0m`
                )
            } else {
                console.log(`\n\x1b[92mSolutions for Day ${dayValue}\x1b[0m`)
                if (partValue === '1' || partValue === undefined) {
                    try {
                        const answer = await index.part1()
                        if (answer === undefined) {
                            throw `No part 1 for day ${dayValue}`
                        }
                        console.log(`\t\x1b[32mPart 1:\x1b[0m ${answer}`)
                    } catch (e) {
                        console.log(`\t\x1b[31m-- ${e}\x1b[0m`)
                    }
                }
                if (partValue === '2' || partValue === undefined) {
                    try {
                        const answer = await index.part2()
                        if (answer === undefined) {
                            throw `No part 2 for day ${dayValue}`
                        }
                        console.log(`\t\x1b[32mPart 2:\x1b[0m ${answer}`)
                    } catch (e) {
                        console.log(`\t\x1b[31m-- ${e}\x1b[0m`)
                    }
                }
            }
        } catch (e) {
            console.error(`\x1b[31mError loading day ${dayValue}\x1b[0m`)
            inc++
        }
    }
    if (inc === 0) {
        console.error(`\x1b[31mNo valid days found\x1b[0m`)
    }
    console.log(`\n-\n\x1b[33mFinished\x1b[0m`)
})()
