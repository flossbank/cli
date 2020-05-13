module.exports = ({ ui, config }) => {
  ui.stdout.write(config.getLastRunlog() + '\n')
  return 0
}
