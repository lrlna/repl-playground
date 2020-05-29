var CliServiceProvider = require('@mongosh/service-provider-server').CliServiceProvider
var ShellEvaluator = require('@mongosh/shell-evaluator').default
var isRecoverableError = require('is-recoverable-error')
// var pipeline = require('stream').pipeline
// var through2= require('through2')
var Nanobus = require('nanobus')
// var split2 = require('split2')
var repl = require('repl')
var util = require('util')

var Recoverable = repl.Recoverable

connect(function (err, serviceProvider) {
  if (err) process.exit()
  var serviceProvider = serviceProvider
  var shellEvaluator = new ShellEvaluator(serviceProvider, new Nanobus())

  // var inputStream = pipeline(process.stdin, through2(transformStream), (err) => console.log(err))

  // function transformStream (chunk, enc, cb) {
  //   this.push(chunk)
  //   cb()
  // }
  // inputStream.on('data', function (data) {
  // })

  // inputStream.on('end', function () {
  //   console.log('end')
  // })

  var options = {
    useColors: true,
    ignoreUndefined: true,
    // input: inputStream,
    // output: process.stdout,
    writer: formatOutput,
    prompt: '>',
  }

  var r = repl.start(options)

  var originalEval = util.promisify(r.eval)

  function customEval (input, context, filename, callback) {
    if (input === '\n' || input === '') return callback(null)
    
    if (isRecoverableError(input)) {
      return callback(new Recoverable(new SyntaxError()))
    }

    shellEvaluator.customEval(originalEval, input, context, filename)
      .then((result) => {
        callback(null, result)
        return
      })
      .catch((err) => {
        return callback(err)
      })
  }

  r.eval = customEval

  r.on('exit', () => {
    process.exit()
  })

  shellEvaluator.setCtx(r.context);

  function formatOutput(output) {
    return util.inspect(output.value);
  }
})


function connect(callback) {
  CliServiceProvider.connect('mongodb://127.0.0.1:27017', {})
    .then((provider, reject) => {
      callback(null, provider)
    })
}
