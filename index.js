var CliServiceProvider = require('@mongosh/service-provider-server').CliServiceProvider
var ShellEvaluator = require('@mongosh/shell-evaluator').default
var isRecoverableError = require('is-recoverable-error')
var Nanobus = require('nanobus')
var repl = require('repl')
var util = require('util')

var Recoverable = repl.Recoverable

connect(function (err, serviceProvider) {
  if (err) process.exit()
  var serviceProvider = serviceProvider
  var shellEvaluator = new ShellEvaluator(serviceProvider, new Nanobus())

  var options = {
    useColors: true,
    ignoreUndefined: true,
    writer: formatOutput,
    prompt: '>',
  }

  var r = repl.start(options)

  var originalEval = util.promisify(r.eval)

  function customEval (input, context, filename, callback) {
    if (isRecoverableError(input)) {
      return callback(new Recoverable(new SyntaxError()));
    }

    shellEvaluator.customEval(originalEval, input, context, filename)
      .then((result) => {
        callback(null, result)
        return;
      })
      .catch((err) => {
        callback(err)
        return
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
