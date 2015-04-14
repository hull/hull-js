module.exports = (iframe) ->
  return iframe.contentWindow if iframe.contentWindow
  return iframe.window if iframe.window
  doc = iframe.contentDocument if !doc && iframe.contentDocument
  doc = iframe.document if !doc && iframe.document
  return undefined unless doc?
  return doc.defaultView if doc.defaultView
  return doc.parentWindow if doc.parentWindow
  return undefined;
