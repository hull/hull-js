var SHIM_ATTRIBUTE = 'shim-shadowdom';
var SHIMMED_ATTRIBUTE = 'shim-shadowdom-css';
var NO_SHIM_ATTRIBUTE = 'no-shim';

// document.addEventListener('DOMContentLoaded', function() {
//   if (window.HTMLImports && !HTMLImports.useNative) {
//     var SHIM_SHEET_SELECTOR = 'link[rel=stylesheet]';
//     HTMLImports.importer.documentPreloadSelectors += ',' + SHIM_SHEET_SELECTOR;
//     HTMLImports.importer.importsPreloadSelectors += ',' + SHIM_SHEET_SELECTOR;

//     HTMLImports.parser.documentSelectors = [
//       HTMLImports.parser.documentSelectors,
//       SHIM_SHEET_SELECTOR,
//     ].join(',');

//     var originalParseGeneric = HTMLImports.parser.parseGeneric;

//     HTMLImports.parser.parseGeneric = function(elt) {
//       if (elt[SHIMMED_ATTRIBUTE]) {
//         return;
//       }
//       var style = elt.__importElement || elt;
//       if (!style.hasAttribute(SHIM_ATTRIBUTE)) {
//         originalParseGeneric.call(this, elt);
//         return;
//       }
//       // if (elt.__resource) {
//       //   style = elt.ownerDocument.createElement('style');
//       //   style.textContent = elt.__resource;
//       // }
//       // relay on HTMLImports for path fixup
//       // HTMLImports.path.resolveUrlsInStyle(style, elt.href);
//       style.textContent = ShadowCSS.shimStyle(style);
//       style.removeAttribute(SHIM_ATTRIBUTE, '');
//       style.setAttribute(SHIMMED_ATTRIBUTE, '');
//       style[SHIMMED_ATTRIBUTE] = true;

//       // place in document
//       if (style.parentNode !== head) {
//         // replace links in head
//         if (elt.parentNode === head) {
//           head.replaceChild(style, elt);
//         } else {
//           this.addElementToDocument(style);
//         }
//       }

//       style.__importParsed = true;
//       this.markParsingComplete(elt);
//       this.parseNext();

//     }

//     var hasResource = HTMLImports.parser.hasResource;
//     HTMLImports.parser.hasResource = function(node) {
//       if (node.localName === 'link' && node.rel === 'stylesheet' && node.hasAttribute(SHIM_ATTRIBUTE)) {
//         return (node.__resource);
//       } else {
//         return hasResource.call(this, node);
//       }
//     }

//   }
// });
