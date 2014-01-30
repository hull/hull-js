    ;
  };

  var location = this.location;
  if (location.protocol && !location.protocol.match(/^http/)) {
    var d = document.createElement('div');
    var docs = document.createElement('a');
    docs.href="http://hull.io/docs/hull_js";
    docs.innerHTML = "Documentation";
    var aStyles = [
      "float: right",
      "background-color: lightgrey",
      "padding: 4px 7px",
      "font-weight: bold",
      "color: #C7006F",
      "border-radius: 5px",
      "margin: 0 30px"
    ];
    docs.setAttribute("style", aStyles.join(";"))
    var styles = [
      "position:fixed",
      "top:0",
      "left:0",
      "right:0",
      "padding: 15px 0",
      "font-size: 18px",
      "background-color:#C7006F",
      "text-align: center",
      "color: white",
      "font-family: sans-serif",
      "line-height: 20px"
    ];
    d.setAttribute("style", styles.join(";"))
    var message = "Hull.js can't be run from a local file.";
    var text = document.createElement('span');
    text.innerHTML = message;
    d.appendChild(docs);
    d.appendChild(text);
    document.write(d.outerHTML);
    
    throw message;
  } else {
    lib.call(root);
  }
})();
