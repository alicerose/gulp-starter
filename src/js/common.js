/////////////////////////////////////////////////////////
// 変数定義

const hoge = 'fuga';
let piyo = 'hogera';

/////////////////////////////////////////////////////////
// アロー関数

const sample = () => {
  console.log('sample');
}
sample();

/////////////////////////////////////////////////////////
// class

class Hoge{
  constructor(fuga){
    this.fuga = fuga;
  }
  piyo(foo){
    alert(foo + this.fuga);
  }
}

class HogeSub extends Hoge{
  constructor(fugaSub){
    super(fugaSub);
  }
  piyoSub(){
    super.piyo('classの継承');
  }
}
var hogeSub = new HogeSub('できました！');
hogeSub.piyoSub();

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