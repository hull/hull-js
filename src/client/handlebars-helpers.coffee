define ['aura-extensions/hull-utils', 'handlebars'], (utils, handlebars)->

  (app)->

    __seq = new Date().getTime()

    HandlebarsHelpers = {}

    ###*
     * # Template Helpers
     * The helpers below are bundled in, so you can start to use them immediately in your handlebars templates.
     * Feel free to add your own or override those to fit your needs.
     *
     * # Inflections
     * The inflections helpers proxy the [inflection.js](http://code.google.com/p/inflection-js/) library.
    ###


    ###*
     * Generates an image representation for a social object.
     *
     *     <img src="{{imageUrl "4bb5c26bacb93e0000000007" 'small' 'http://placehold.it/200x200'}}"/>
     *     => <img src="//hull.io/img/4bb5c26bacb93e0000000007/small"/>
     *
     * @param  {String} id           The Object's ID
     * @param  {String} size="small" An optional size preset. See docs for available presets
     * @param  {String} fallback=""  If the ID is null, this url will be returned
     * @return {String}              An image URL
    ###
    HandlebarsHelpers.imageUrl = (id, size="small", fallback="")->
      id = id() if _.isFunction(id)
      return fallback unless id
      id = id.replace(/\/(large|small|medium|thumb)$/,'')
      size = 'small' unless _.isString(size)
      "//#{app.config.assetsUrl}/img/#{id}/#{size}"


    ###*
     * Return a relative date.
     * Uses [moment.js](http://momentjs.com/) behind the scenes.
     *
     *     <span class='date'>{{fromNow date}}</span>
     *     => <span class='date'>2 days ago</span>
     *
     * @param  {String} date The date string to format, can be any format moment.js understands
     * @return {String}      A pretty date
    ###
    HandlebarsHelpers.fromNow = (date)->
      moment(date).fromNow()

    ###*
     * Return the Stringified version of an object.
     *
     *     {{json object}}
     *     => string dump of object
     *
     * Mainly for debug purposes
     *
     * @param  {Object} obj Any javascript object
     * @return {String}     A String dump of the object
    ###
    HandlebarsHelpers.json = (obj)->
      JSON.stringify obj


    ###*
     * Create a loop where `key` is the key of the hash, and `value` is it's value.
     *
     * In your code :
     *
     *     h = {
     *       propertyName  : propertyValue,
     *       propertyName2 : propertyValue2,
     *       …
     *      }
     *
     * propertyValue can be anything, including another hash.
     * In your templates :
     *
     *     <div class='list'>
     *       {{#key_value h}}
     *         <span>{{key}} is <b>{{value}}</b></span> !
     *       {{/key_value}}
     *     </div>
     *
     *     =>
     *
     *     <div class='list'>
     *       <span>propertyName is <b>propertyValue</b></span> !
     *       <span>propertyName2 is <b>propertyValue2</b></span> !
     *     </div>
     *
     *
     * @param  {Object} hash    The hash to iterate on
    ###
    HandlebarsHelpers.key_value = (hash, options)->
      (options.fn(key: key, value: value) for own key, value of hash).join('')

    ###*
     * Output a page-unique sequential number.
     * Mainly useful to assign a unique id to each entry in a list
     *
     *     <div class="{{seq "cool"}}"></div>
     *     <div class="{{seq "cool"}}"></div>
     *
     *     =>
     *
     *       <div class="cool-1352299623728"></div>
     *       <div class="cool-1352299623729"></div>
     *
     * @param  {String} prefix='seq' The sequence's prefix
     * @return {String}              An Unique identifier, incremented everytime `seq` is called
    ###
    HandlebarsHelpers.seq = (prefix='seq')->
      "#{prefix}-#{__seq++}"



    ###*
     * Renders a lower case underscored word into camel case.
     * Also translates "/" into "::" (underscore does the opposite)
     *
     *     {{camelize "resource/image_gallery"}}
     *     => 'Resource::ImageGallery'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.camelize = (string)->
      _.str.camelize string

    ###*
     * Renders a camel cased word into words seperated by underscores
     * also translates "::" back into "/" (camelize does the opposite)
     *
     *     {{underscore "Resource::ImageGallery"}}
     *     => 'resource/image_gallery'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.underscore = (string)->
      _.str.underscored string

    ###*
     * Renders a lower case and underscored word into human readable form defaults to making the first letter capitalized unless you pass true
     *
     *     {{humanize "image_gallery"}}
     *     => 'Image Gallery'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.humanize = (string)->
      _.str.humanize string

    ###*
     * 
     *      {{pluralize collection.length 'quiz' 'quizzes'}}
     *
     * @param  {number} number
     * @param  {string} single
     * @param  {string} plural
     * @return {string}       
    ###
    HandlebarsHelpers.pluralize = (number, single, plural) ->
        (if (number <= 1) then single else plural)
   

    ###*
     * Renders all characters to lower case and then makes the first upper
     *
     *     {{capitalize "image gallery"}}
     *     => 'Image gallery'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.capitalize = (string)->
      _.str.capitalize string

    ###*
     * Renders all underbars and spaces as dashes
     *
     *     {{dasherize "image_gallery one"}}
     *     => 'image-gallery-one'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.dasherize = (string)->
      _.str.dasherize string

    ###*
     * Renders words into title casing (as for book titles)
     *
     *     {{titleize "image_gallery one"}}
     *     => 'Image Gallery One'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.titlelize = (string)->
      _.str.titlelize string


    ###*
     * Renders an underscored word into its camel cased form
     *
     *     {{classify "image_gallery"}}
     *     => 'ImageGallery'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.classify = (string)->
      _.str.classify string

    ###*
     * Remove surrounding whitespace
     *
     *     {{trim "  images   "}}
     *     => 'images'
     *
     * @param  {String} string A text string
     * @return {String}        A processed string
    ###
    HandlebarsHelpers.trim = (string)->
      _.str.trim string


    ###*
     * Compare two values and enters the scope if true
     *
     *     var color = 'blue'
     *
     *     {{#ifEqual color "red"}}
     *     {{else}}
     *       The Color is not red !
     *     {{/ifEqual}}
     *     {{#ifEqual color "blue"}}
     *       The Color is blue !
     *     {{/ifEqual}}
     *
     *     =>
     *       'The Color is not red'
     *       'The Color is blue !'
     *
     * @param  {Anything} v1    Left side of comparison
     * @param  {Anything} v2    Right side of comparison
    ###
    HandlebarsHelpers.ifEqual = (v1, v2, options)->
      if v1 is v2 then options.fn(@) else options.inverse(@) if _.isFunction(options.inverse)


    ###*
     * loops over an array and provides a .index property on the object so you can use it as a counter.
     *
     *     var counter = [{name:10},{name:11},{name:12}]
     *
     *     {{#eachWithIndex count}}
     *       Name : {{name}}, Index : {{index}} |
     *     {{/eachWithIndex}}
     *     => Name : 10, Index : 0 | Name : 11, Index : 1 | Name : 12, Index : 2 |
     *
     * @param  {Array}   array  The Array of objects to iterate on
    ###
    HandlebarsHelpers.eachWithIndex = (array, fn)->
      buffer = []
      for i, index in array
        item = i
        item.index = index
        buffer.push fn(item)
      buffer.join('')

    ###*
     * joins the elements of an array
     *
     *     var list = ['a', 'b', 'c']
     *
     *     {{join list ","}}
     *     => a,b,c
     *
     * @param  {Array}   array  The Array of objects
    ###

    HandlebarsHelpers.join = (items, options)->
      if options && _.isFunction(options.fn)
        items = _.map items, (i)-> options.fn(i)
      sep = options.hash['sep'] || ', '
      last = items.splice(-1) if options.hash['lastSep'] && items.length > 1
      ret = items.join sep
      ret += options.hash['lastSep'] + last if last
      ret
    ###*
    * THE DEBUG HELPER
    *
    *      usage: {{debug}} or {{debug someValue}}
    *
    * @param  {Anything}  optional value to debug
    ###
    HandlebarsHelpers.debug = (optionalValue)->
        console.log("Current Context")
        console.log("====================")
        console.log(@)

        if (optionalValue)
          console.log("Value")
          console.log("====================")
          console.log(optionalValue)


    handlebars.registerHelper(k, v) for k,v of HandlebarsHelpers
