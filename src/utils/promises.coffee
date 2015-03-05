q = require 'q'

# q.longStackSupport = true
module.exports =   {
  deferred: q.defer
  when: q.when
  all: q.all
  allSettled: q.allSettled
}
