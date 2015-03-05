_pool = _pool || {}
createPool = (name)->
  _pool[name] ?= []
  (args...)-> _pool[name].push args
deletePool = (name)->
  delete _pool[name]
run = (name, obj)->
  obj[name](data...) for data in _pool[name]
  deletePool(name)

module.exports={
  create:createPool,
  delete:deletePool,
  run:run
}
