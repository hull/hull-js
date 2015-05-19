var SHIM_ATTRIBUTE = 'rel';
var SHIMMED_ATTRIBUTE = 'shim-shadowdom-css';
var NO_SHIM_ATTRIBUTE = 'no-shim';

module.exports = function(){
  if (window.HTMLImports && !HTMLImports.useNative) {
    var LINK_STYLE_SELECTOR = 'link[rel=stylesheet]';

    HTMLImports.importer.importsPreloadSelectors += ',' + LINK_STYLE_SELECTOR;

    var originalParseGeneric = HTMLImports.parser.parseGeneric;
    HTMLImports.parser.parseGeneric = function(elt) {

      if (elt[SHIMMED_ATTRIBUTE]) { return; }

      var style = elt.__importElement || elt;

      if(
          (style.nodeName=='STYLE' || style.nodeName=='LINK') &&
          (style.ownerDocument !== document || this.rootImportForElement(style).getAttribute('rel')==='import')
        ){
        style.__importParsed = true;
        this.markParsingComplete(style);
        this.parseNext();
      } else {
        originalParseGeneric.call(this, elt);
      }
    }

    var hasResource = HTMLImports.parser.hasResource;
    HTMLImports.parser.hasResource = function(node) {
      if (node.localName === 'link' && node.hasAttribute(SHIM_ATTRIBUTE) && node.rel === 'stylesheet' ) {
        return (node.__resource);
      } else {
        return hasResource.call(this, node);
      }
    }

  }
  true
}
