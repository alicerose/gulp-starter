import {exportHoge} from "./test";
import {SOME_NUMBER} from "./constants/common";

import $ from "jquery";

exportHoge(SOME_NUMBER);
const text = $('header h1').text();
alert(text);
console.log('hogehogehoge')