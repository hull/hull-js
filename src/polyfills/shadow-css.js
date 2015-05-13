var SHIM_ATTRIBUTE = 'rel';
var SHIMMED_ATTRIBUTE = 'shim-shadowdom-css';
var NO_SHIM_ATTRIBUTE = 'no-shim';

module.exports = function(){
  if (window.HTMLImports && !HTMLImports.useNative) {

    var SHIM_SHEET_SELECTOR = 'link[rel=stylesheet]';
    HTMLImports.importer.documentPreloadSelectors += ',' + SHIM_SHEET_SELECTOR;
    HTMLImports.importer.importsPreloadSelectors += ',' + SHIM_SHEET_SELECTOR;

    HTMLImports.parser.documentSelectors = [
      HTMLImports.parser.documentSelectors,
      SHIM_SHEET_SELECTOR,
    ].join(',');

    var originalParseGeneric = HTMLImports.parser.parseGeneric;

    HTMLImports.parser.parseGeneric = function(elt) {
      if (elt[SHIMMED_ATTRIBUTE]) { return; }

      var style = elt.__importElement || elt;

      if(!(style.nodeName=='STYLE' || style.nodeName=='LINK')){
        originalParseGeneric.call(this, elt);
        return;
      }

      // if (elt.__resource) {
      //   style = elt.ownerDocument.createElement('style');
      //   style.textContent = elt.__resource;
      // }

      // relay on HTMLImports for path fixup
      // HTMLImports.path.resolveUrlsInStyle(style, elt.href);

      // style.setAttribute(SHIMMED_ATTRIBUTE, '');
      // style[SHIMMED_ATTRIBUTE] = true;

      // elt.parentNode.replaceChild(style, elt)
      // elt.ownerDocument.body.appendChild(style)

      // this.trackElement(elt);

      style.__importParsed = true;
      this.markParsingComplete(style);
      this.parseNext();
    }

    var hasResource = HTMLImports.parser.hasResource;
    HTMLImports.parser.hasResource = function(node) {
      if (node.localName === 'link' && node.rel === 'stylesheet' && node.hasAttribute(SHIM_ATTRIBUTE)) {
        return (node.__resource);
      } else {
        return hasResource.call(this, node);
      }
    }

  }
  true
}
