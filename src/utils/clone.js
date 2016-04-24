module.exports = function(obj){
  if (obj === undefined){ return obj; }
  return JSON.parse(JSON.stringify(obj))
}
