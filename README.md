# repl-playground

To start REPL with mongosh evaluation, use `index.js`. You need to have mongodb
installed and mongod running:
```shell
npm install && node index.js
```

There are two other files. Regular evaluation repl is setup in default-repl.js
and produces no problems.

`custom-repl` sets up a 'custom' evaluator, which is
actually just the regular evaluate that's wrapped in async/await and is resolved
in a `customEval` function that's similar to how mongosh evaluation happens.
This does not need to have mongodb installed.


Here is a sure way to test differences in output between custom and default
evaluations.

function to setup ahead of time:
```
function input (x) { console.log(x); return x  }
```
Then paste a few calls:
```
input(1)
input(2)
input(3)
input(4)
input(5)
```
