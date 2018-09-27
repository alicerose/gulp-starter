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