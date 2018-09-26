/////////////////////////////////////////////////////////
// 変数定義

const hoge = fuga;
let piyo = hogera;

/////////////////////////////////////////////////////////
// アロー関数

const sample = () => {
  console.log('sample');
}
sample();

/////////////////////////////////////////////////////////
// class

class A{
  constructor(name){
    this.name;
  }
  say() {
    console.log(this.name)
  }
}

/////////////////////////////////////////////////////////
// async/await

function doSomethingAsync() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('I did something'), 3000)
  })
}

async function doSomething() {
  console.log(await doSomethingAsync())
}

doSomething();