_              = require '../../utils/lodash'
getIframeWindow= require '../../utils/get-iframe-window'
findUrl        = require '../../utils/find-url'
setStyle       = require '../../utils/set-style'
clone          = require '../../utils/clone'
SandboxedShare = require '../sharer/sandboxed-sharer'
assign         = require 'object-assign'
ScopedCss      = require 'scopedcss/lib/';
MutationSummary = require 'mutation-summary'

class Sandbox
  constructor : (ship, deployment)->
    @ship = ship
    @deployment = deployment

    @_sandboxedShare =  new SandboxedShare({
      share:   Hull.share
    });

    sandboxedTrack = (name, event={})=>
      event.ship_id = @ship.id
      Hull.track(name, event)

    @_hull = assign({}, window.Hull, {
      track        : sandboxedTrack
      share        : @_sandboxedShare.share
    });

  setContainer : (iframe)->
    return @_hull unless iframe

    @_sandboxedShare.setContainer(iframe)

    applyStyles = (container)=>
      id = @ship.id
      observer = new MutationSummary
        callback: (changes)->
          _.map changes, (summary)->
            _.map summary.added, (node)->
              node.parentNode.removeChild(node)
              scoped = new ScopedCss(".ship-#{id}", null, node)
              scoped.process()
        rootNode: container
        queries: [{element: 'style'}]

      # observer = new MutationObserver (mutations)=>
      #   _.map mutations, (mutation)=>
      #     node = mutation.target
      #     # _.map mutation.addedNodes, (node)=>
      #     console.log(".ship-#{@ship.id}", mutation)
      #     # if node.nodeName=='STYLE'
      #       # node.parentNode.removeChild(node)
      #       # scoped = new ScopedCss(".ship-#{@ship.id}", null, node)
      #       # scoped.process(".ship-#{@ship.id}")
      # observer.observe container, {
      #   childList: true,
      #   characterData: false,
      #   attributes: false,
      #   attributeOldValue: false
      #   subtree:true
      # }
    @_hull = assign(@_hull, {

      applyStyles : applyStyles

      onEmbed : (args...)->
        args.shift() if args.length == 2
        Hull.onEmbed(iframe.contentDocument, args...)
        true

      setShipSize : (size={})=>
        style = assign({},size)
        style.width = size.width if size.width?
        style.height = size.height if size.height?
        setStyle.style(iframe,style)
        true

      setShipStyle : (style={})->
        setStyle.style(iframe,style)
        true

      autoSize : ()->
        setStyle.autoSize(iframe)
        true

      findUrl : ()-> findUrl(iframe)
    });

    w = getIframeWindow(iframe)
    w.Hull = @_hull
    

  get : ()-> @_hull

module.exports = Sandbox
