    ;
  };

  var __hull__flash = function (message) {
    var d = document.createElement('div');
    var docs = document.createElement('a');
    docs.target = '_blank';
    docs.href="http://hull.io/docs/hull_js";
    docs.innerHTML = "Documentation";
    var aStyles = [
      "float: right",
      "background-color: whitesmoke",
      "padding: 0px 10px",
      "color: #C70040",
      "border-radius: 2px",
      "margin: 0 30px 0 0",
      "text-decoration: none"
    ];
    docs.setAttribute("style", aStyles.join(";"))
    var styles = [
      "position:fixed",
      "top:0",
      "left:0",
      "right:0",
      "padding: 15px 0",
      "font-size: 18px",
      "background-color:#C70040",
      "text-align: center",
      "color: white",
      "font-family: sans-serif",
      "line-height: 20px"
    ];
    d.setAttribute("style", styles.join(";"))
    var text = document.createElement('span');
    text.innerHTML = message;
    d.appendChild(docs);
    d.appendChild(text);
    document.write(d.outerHTML);
  };

  var location = this.location;
  if (location.protocol && !location.protocol.match(/^http/)) {
    __hull__flash("Hull.js can't be run from a local file.");
    throw message;
  } else {
    lib.call(root);
  }
})();
