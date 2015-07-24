module.exports = (api)->
  (id)->
    api
      provider: "hull"
      path: [id, 'flag'].join('/')
    ,'post'
