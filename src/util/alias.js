const { writeFile, readFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')
const detectProfile = require('./profile')
const {
  SHEBANG,
  ALIAS_FILE,
  PROJECT_NAME,
  SUPPORTED_PMS
} = require('../constants')

const writeFileAsync = promisify(writeFile)
const readFileAsync = promisify(readFile)

function createAlias (cmd) {
  return `alias ${cmd}="${PROJECT_NAME} ${cmd}"`
}

function createRemoveAlias (cmd) {
  return `unalias ${cmd}`
}

function jsonToShell (json) {
  const lines = Object.keys(json).reduce((file, alias) => file + json[alias] + '\n', '')
  return SHEBANG + '\n\n' + lines
}

function Alias ({ config }) {
  this.config = config
}

Alias.prototype.getSourceFilePath = function getSourceFilePath () {
  return join(this.config.getPath(), ALIAS_FILE)
}

Alias.prototype.getSourceCommand = function getSourceCommand () {
  return ['source', this.getSourceFilePath()].join(' ')
}

Alias.prototype.list = function list () {
  return this.config.getAliases()
}

Alias.prototype.aliasAll = async function aliasAll () {
  SUPPORTED_PMS.forEach((pm) => this.addAlias(pm))
  return this.writeSourceFile()
}

Alias.prototype.unaliasAll = async function unaliasAll () {
  SUPPORTED_PMS.forEach((pm) => this.removeAlias(pm))
  return this.writeSourceFile()
}

Alias.prototype.addAlias = function addAlias (cmd) {
  return this.config.addAlias(cmd, createAlias(cmd))
}

Alias.prototype.removeAlias = function removeAlias (cmd) {
  return this.config.removeAlias(cmd, createRemoveAlias(cmd))
}

Alias.prototype.writeSourceFile = async function writeSourceFile () {
  await writeFileAsync(this.getSourceFilePath(), jsonToShell(this.list()))

  return this.addToProfile()
}

Alias.prototype.addToProfile = async function addToProfile () {
  const profilePaths = detectProfile()

  const profiles = await Promise.all(
    profilePaths
      .map(profPath => readFileAsync(profPath, 'utf8')
        .then((prof) => ({ profile: prof, path: profPath }))
      ))

  const profilesToUpdate = profiles.filter(prof => !prof.profile.includes(this.getSourceCommand()))

  if (!profilesToUpdate.length) return

  return Promise.all(
    profilesToUpdate.map(prof => writeFileAsync(prof.path, prof.profile + '\n\n' + this.getSourceCommand()))
  )
}

module.exports = Alias
