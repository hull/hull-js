getDocument = (iframe)->
  try
    doc = iframe.contentDocument
  catch e
    try
      doc = iframe.document
    catch e
  return doc

getWindow = (iframe)->
  try
    w = iframe.contentWindow
  catch e
    try
      w = iframe.window
    catch e

  return w if w?    

  doc = getDocument(iframe)

  return undefined unless doc?
  try
    w = doc.defaultView
  catch e
    try
      w = doc.parentWindow
    catch e
  return w if w?



module.exports = 
  window: getWindow
  document: getDocument
