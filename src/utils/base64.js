const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function encode(input) {
  var output = '';
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

  input = encodeUTF8(input);

  var i = 0;
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output = output
      + KEYS.charAt(enc1)
      + KEYS.charAt(enc2)
      + KEYS.charAt(enc3)
      + KEYS.charAt(enc4);
  }

  return output;
}

function decode(input) {
  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  var i = 0;
  while (i < input.length) {
    enc1 = KEYS.indexOf(input.charAt(i++));
    enc2 = KEYS.indexOf(input.charAt(i++));
    enc3 = KEYS.indexOf(input.charAt(i++));
    enc4 = KEYS.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) { output = output + String.fromCharCode(chr2); }
    if (enc4 != 64) { output = output + String.fromCharCode(chr3); }
  }

  output = decodeUTF8(output);

  return output;
}

function encodeURL(input) {
  return encode(input)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=+$/, '');
}

function decodeURL(input) {
  input = (input + '===')
    .slice(0, input.length + (input.length % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return decode(input);
}

function encodeUTF8(input) {
  input = input.replace(/\r\n/g, "\n");

  var output = '';
  for ( var n = 0; n < input.length; n++) {
    var c = input.charCodeAt(n);

    if (c < 128) {
      output += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      output += String.fromCharCode((c >> 6) | 192);
      output += String.fromCharCode((c & 63) | 128);
    } else {
      output += String.fromCharCode((c >> 12) | 224);
      output += String.fromCharCode(((c >> 6) & 63) | 128);
      output += String.fromCharCode((c & 63) | 128);
    }
  }

  return output;
}

function decodeUTF8(input) {
  var output = '';
  var i = 0;
  var c = 0, c1 = 0, c2 = 0, c3 = 0;

  while (i < input.length) {
    c = input.charCodeAt(i);

    if (c < 128) {
      output += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c2 = input.charCodeAt(i + 1);
      output += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = input.charCodeAt(i + 1);
      c3 = input.charCodeAt(i + 2);
      output += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }

  return output;
}

export default {
  encode: encode,
  decode: decode,
  encodeURL: encodeURL,
  decodeURL: decodeURL
}
