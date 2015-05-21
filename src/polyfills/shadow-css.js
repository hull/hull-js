module.exports = function(){
  if (window.HTMLImports && !HTMLImports.useNative) {

    var LINK_STYLE_SELECTOR = 'link[rel=stylesheet]';

    HTMLImports.importer.importsPreloadSelectors += ',' + LINK_STYLE_SELECTOR;

    var originalParseGeneric = HTMLImports.parser.parseGeneric;
    HTMLImports.parser.parseGeneric = function(elt) {
      var style = elt.__importElement || elt;
      if(
          (style.nodeName=='STYLE' ||
            (style.nodeName=='LINK' && style.getAttribute('rel')==='stylesheet')
          )
          &&
          (style.ownerDocument !== document || this.rootImportForElement(style).getAttribute('rel')==='import')
        ){
        this.markParsingComplete(style);
        this.parseNext();
      } else {
        originalParseGeneric.call(this, elt);
      }
    }

    var hasResource = HTMLImports.parser.hasResource;
    HTMLImports.parser.hasResource = function(node) {
      if (node.localName === 'link' && node.hasAttribute('rel') && node.getAttribute('rel') === 'stylesheet' ) {
        // Need to check for actual undefined || null, because if style is "" then it's considered falsy...
        // Style can be "" if no CORS and query failed.
        return (node.__resource!==undefined && node.__resource!==null);
      } else {
        return hasResource.call(this, node);
      }
    }

  }
  true
}
