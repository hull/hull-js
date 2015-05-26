module.exports = function(scope){
  scope = scope || window
  if (scope.HTMLImports && !scope.HTMLImports.useNative) {

    var LINK_STYLE_SELECTOR = 'link[rel=stylesheet]';

    scope.HTMLImports.importer.importsPreloadSelectors += ',' + LINK_STYLE_SELECTOR;

    var originalParseGeneric = scope.HTMLImports.parser.parseGeneric;
    scope.HTMLImports.parser.parseGeneric = function(elt) {
      debugger
      console.log('---------------parse generic', elt)
      var style = elt.__importElement || elt;
      if(
          (style.nodeName=='STYLE' ||
            (style.nodeName=='LINK' && style.getAttribute('rel')==='stylesheet')
          )
          &&
          (style.ownerDocument !== document || this.rootImportForElement(style).getAttribute('rel')==='import')
        ){
        console.log('shortcut generic', elt)
        this.markParsingComplete(style);
        this.parseNext();
      } else {
        originalParseGeneric.call(this, elt);
      }
    }

    var hasResource = scope.HTMLImports.parser.hasResource;
    scope.HTMLImports.parser.hasResource = function(node) {
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
