var repl = require('repl')
var util = require('util')

var options = { useColors: true, writer: format }

var r = repl.start(options)

function format (output) {
  return util.inspect(output)
}
