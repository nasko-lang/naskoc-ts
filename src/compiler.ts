import { Nasko } from "./nasko"
import { NaskoUtils } from "./utils"
import { promisify } from "util"
import { existsSync, readFileSync, writeFileSync } from "fs"
import chalk from "chalk"

const sleep = promisify(setTimeout)
const argv = process.argv.filter(v => v != process.argv0)
let v = false

const errLog = (err: string) => {
  console.log(`${chalk.redBright("Error:")} ${chalk.whiteBright(err)}`)
}

const logVital = (t: string, content: string, ...opt: any[]) => {
  console.log(`${chalk.greenBright(t)}: ${chalk.whiteBright(content)}`, ...opt);
}
const log = (content: string, ...opt: any[]) => {
  if(v)
    logVital("Debug", content, ...opt)
}


const run = async () => {
  let args = NaskoUtils.parseArgv(argv, [
    ["v", { double: false, coerce: 'boolean', default: false }],
    ["o", { double: false, default: '' }],
    ["i", { double: false, default: '' }],
    ["h", { double: false, default: false, coerce: 'boolean' }],
    ["help", { double: true, default: false, coerce: 'boolean' }]
  ])
  
  if(args.h || args.help) {
    console.log(`Usage: naskoc <options>`)
    console.log(`\n\t-h: Show this help message`)
    console.log(`\n\t-v: Set verbose output`)
    console.log(`\n\t-o: Specifies an output file`)
    console.log(`\n\t-i: Specifies an input file`)
    process.exit(0)
  }

  v = args.v as boolean

  if(!(args.o || args.i)) {
    errLog("you must supply an output file (-o) and input file (-i)")
    process.exit(1)
  }

  try {
    if (!existsSync(args.i as string)) {
      errLog(`source file does not exist...`)
      process.exit(1)
    }

    const source = readFileSync(args.i as string).toString()
    let bytecode = Nasko.parse(source, v).join("")

    writeFileSync(args.o as string, bytecode)

    logVital("Info", "compiled successfully")
  } catch(e) {
    errLog(e.toString())
    logVital("Info", "failed to compile")
  }
}

run()
