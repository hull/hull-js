// https://code.google.com/p/stringencoders/source/browse/trunk/javascript/base64.js?r=230

const PADCHAR = '=';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function makeDOMException() {
  // sadly in FF,Safari,Chrome you can't make a DOMException
  var e, tmp;

  try {
    return new DOMException(DOMException.INVALID_CHARACTER_ERR);
  } catch (tmp) {
    // not available, just passback a duck-typed equiv
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
    var ex = new Error("DOM Exception 5");

    // ex.number and ex.description is IE-specific.
    ex.code = ex.number = 5;
    ex.name = ex.description = "INVALID_CHARACTER_ERR";

    // Safari/Chrome output format
    ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
    return ex;
  }
}

function getbyte64(s,i) {
  // This is oddly fast, except on Chrome/V8.
  // Minimal or no improvement in performance by using a
  // object with properties mapping chars to value (eg. 'A': 0)
  var idx = ALPHA.indexOf(s.charAt(i));
  if (idx === -1) {
    throw makeDOMException();
  }
  return idx;
}

function getbyte(s,i) {
  var x = s.charCodeAt(i);
  if (x > 255) {
    throw makeDOMException();
  }
  return x;
}

function encode(s) {
  if (arguments.length !== 1) {
    throw new SyntaxError("Not enough arguments");
  }
  var padchar = PADCHAR;
  var alpha   = ALPHA;

  var i, b10;
  var x = [];

  // convert to string
  s = '' + s;

  var imax = s.length - s.length % 3;

  if (s.length === 0) {
    return s;
  }
  for (i = 0; i < imax; i += 3) {
    b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
    x.push(alpha.charAt(b10 >> 18));
    x.push(alpha.charAt((b10 >> 12) & 0x3F));
    x.push(alpha.charAt((b10 >> 6) & 0x3f));
    x.push(alpha.charAt(b10 & 0x3f));
  }
  switch (s.length - imax) {
    case 1:
      b10 = getbyte(s,i) << 16;
    x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
           padchar + padchar);
    break;
    case 2:
      b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
    x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
           alpha.charAt((b10 >> 6) & 0x3f) + padchar);
    break;
  }
  return x.join('');
}

function decode(s) {
  // convert to string
  s = '' + s;
  var pads, i, b10;
  var imax = s.length
  if (imax === 0) {
    return s;
  }

  if (imax % 4 !== 0) {
    throw makeDOMException();
  }

  pads = 0
  if (s.charAt(imax - 1) === PADCHAR) {
    pads = 1;
    if (s.charAt(imax - 2) === PADCHAR) {
      pads = 2;
    }
    // either way, we want to ignore this last block
    imax -= 4;
  }

  var x = [];
  for (i = 0; i < imax; i += 4) {
    b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
      (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
  }

  switch (pads) {
    case 1:
      b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
    break;
    case 2:
      b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
    x.push(String.fromCharCode(b10 >> 16));
    break;
  }
  return x.join('');
}

function encodeURL(input) {
  return encodeURIComponent(encode(input).replace(/\+/g, '-').replace(/\//g, '_'));
}

function decodeURL(input) {
  return decode(decodeURIComponent(input).replace(/-/g, '+').replace(/_/g, '/'));
}

export default {
  encode: encode,
  decode: decode,
  encodeURL: encodeURL,
  decodeURL: decodeURL
};

