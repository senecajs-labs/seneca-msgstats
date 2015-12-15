module.exports = {
  runDocker: false,
  proxy: 'docker',
  tail: true,
  exclude: [
    '**/node_modules',
    '**/*.log'
  ]
}
