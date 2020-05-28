# repl-playground

To start:
```shell
npm install && node index.js
```

Function to test multiline error:
```js
function cat() {
  console.log('chashu')
}
```

Function to test for multiline, but separate inputs errors, first setup an input
function:
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
