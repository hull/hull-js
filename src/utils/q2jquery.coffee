define ['jquery'], ($)->
  (qPromise)->
    $dfd = $.Deferred()
    qPromise.then $dfd.resolve, $dfd.reject
    $dfd.promise()

