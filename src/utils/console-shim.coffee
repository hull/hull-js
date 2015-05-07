methods = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"]

unless window.console and console.log
  (->
    noop = ()-> 
    console = window.console = {}
    console[method] = noop for method in methods
  )()
else if typeof console.log=='object'
  log = console.log
  console.log = (args...)-> log(args)
