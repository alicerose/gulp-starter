import { enableJQuery } from './vendors/enableJQuery';
import SampleClass from './models/SampleClass';

enableJQuery.init();

const arrow = () => {
  return 'Arrow Function -> ok';
};
console.log(arrow());

const test = new SampleClass(1);
console.log('Class ->', test.ok);

const flatTest = [[1, 2], 3, 4].flat();
console.log(flatTest);
