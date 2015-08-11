import _          from "./lodash";

const URL_REGEX = /(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/


function getErrorStack(){
  let e = new Error();
  let stack = e.stack
  if(typeof stack !== 'string' || !stack){
    try{
      throw e
    } catch(err){
      stack = err.stack
    }
  }
  return stack
}
function getUrlFromStack(stack=""){
  let lines = stack.split('\n');
  let urls = _.reduce(lines, function(u, line){
    let t = line.match(URL_REGEX)
    if(t) {
      u.push(t[1])
    }
    return u
  },[]);
  // Eliminate Hull.js from the stack, get next closest URL
  return _.uniq(urls)[1]
}
function getCurrentScriptFromUrl(url, scripts){
  var i, script = null;

  if (typeof url === "string" && url) {
    for (i = scripts.length; i--; ) {
      if (scripts[i].src === url) {
        script = scripts[i];
        break;
      }
    }
  }
  return script;
}
function getCurrentScript(){
  let scripts = document.getElementsByTagName("script");
  let stack = getErrorStack();
  let url = getUrlFromStack(stack);
  return getCurrentScriptFromUrl(url, scripts);
}

module.exports = getCurrentScript
