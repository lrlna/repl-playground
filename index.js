var CliServiceProvider = require('@mongosh/service-provider-server').CliServiceProvider
var ShellEvaluator = require('@mongosh/shell-evaluator').default
var { default: PQueue } = require('p-queue')
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
    prompt: '>',
  }

  var r = repl.start(options)

  var originalEval = util.promisify(r.eval)

  var queue = new PQueue({ concurrency: 1 })

  var customEval = async(input, context, filename, callback) => {
    var result

    await queue.onIdle().then(queue.add(queueTask))

    async function queueTask() {
      console.log('here')
      try {
        result = await shellEvaluator.customEval(originalEval, input, context, filename)
      } catch (err) {
        console.log('queue error')
        if (isRecoverableError(input)) {
          return callback(new Recoverable(err))
        }
        result = err
      }
      callback(null, result)
    }

  }

  r.eval = customEval

  r.on('exit', () => {
    process.exit()
  })

})

function writer(input) {
  util.inspect(input)
}

function connect(callback) {
  CliServiceProvider.connect('mongodb://127.0.0.1:27017', {})
    .then((provider, reject) => {
      callback(null, provider)
    })
}
