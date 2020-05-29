var repl = require('repl')
var util = require('util')

var options = {
  useColors: true,
  ignoreUndefined: true,
  prompt: '>',
}

var r = repl.start(options)

var originalEval = util.promisify(r.eval)

r.eval = customEval

r.on('exit', () => {
  process.exit()
})

function customEval (input, context, filename, callback) {
  if (input === '\n' || input === '') return callback(null)
  
  evaluate(originalEval, input, context, filename)
    .then((result) => {
      return callback(null, result)
    })
    .catch((err) => {
      return callback(err)
    })
}

async function evaluate (originalEval, input, context, filename) {
  return await originalEval(input, context, filename);
}
