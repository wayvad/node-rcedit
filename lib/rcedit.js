const { canRunWindowsExeNatively, spawnExe } = require('cross-spawn-windows-exe')
const path = require('path')

const tupleSettings = ['custom-unicode-resource']
const pairSettings = ['version-string']
const singleSettings = ['file-version', 'product-version', 'icon', 'requested-execution-level']
const noPrefixSettings = ['application-manifest']

module.exports = async (exe, options) => {
  const rceditExe = process.arch === 'x64' ? 'rcedit-x64.exe' : 'rcedit.exe'
  const rcedit = path.resolve(__dirname, '..', 'bin', rceditExe)
  const args = [exe]

  for (const name of tupleSettings) {
    if (options[name]) {
      const entry = options[name];
      if (entry.length >= 3) {
        args.push(`--set-${name}`, entry[0], entry[1], entry[2])
      }
    }
  }

  for (const name of pairSettings) {
    if (options[name]) {
      for (const [key, value] of Object.entries(options[name])) {
        args.push(`--set-${name}`, key, value)
      }
    }
  }

  for (const name of singleSettings) {
    if (options[name]) {
      args.push(`--set-${name}`, options[name])
    }
  }

  for (const name of noPrefixSettings) {
    if (options[name]) {
      args.push(`--${name}`, options[name])
    }
  }

  const spawnOptions = {
    env: { ...process.env }
  }

  if (!canRunWindowsExeNatively()) {
    // Suppress "fixme:" stderr log messages
    spawnOptions.env.WINEDEBUG = '-all'
  }

  await spawnExe(rcedit, args, spawnOptions)
}
