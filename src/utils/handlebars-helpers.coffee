define ['underscore', 'moment'], (_, moment)->
  __seq = new Date().getTime()

  (app)->
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
      return unless date?
      moment(date).fromNow()

    ###*
     * Auto-links URLs in text.
     * Uses [twitter-text.js](https://github.com/twitter/twitter-text-js) behind the scenes.
     *
     *     snippet="You have to try http://hull.io/try"
     *
     *
     *     <p class='content'>{{autoLink snippet}}</p>
     *     => <p class='content'>You have to try <a href="http://hull.io/try">http://hull.io/try</a></p>
     *
     * @param  {String} date The content
     * @return {String}      The content with clickable URLs
    ###
    HandlebarsHelpers.autoLink = (content)->
      return unless content?
      twttr.txt.autoLink(content)

    ###*
     * Return a formatted date
     * Uses [moment.js](http://momentjs.com/) behind the scenes.
     *
     *     <span class='date'>{{formatTime date "h:mm A"}}</span>
     *     => <span class='date'>5:30 PM</span>
     *
     * @param  {String} date The date string to format, can be any format moment.js understands
     * @param  {String} format A format string
     * @return {String}  A formatted date
    ###
    HandlebarsHelpers.formatTime = (date, format)->
      moment(date).format(format)

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

    ###*
     * write text if value equals another value
     *
     *      foo='bar'
     *
     *      1. {{outputIf foo 'bar'}}
     *      2. {{outputIf foo 'baz' 'checked'}}
     *
     *      =>
     *      1.
     *      2. 'checked'
    ###
    HandlebarsHelpers.outputIf = (obj, compare, output='', fallback='')->
        if obj == compare then output else fallback;

    ###*
     * write a value or a fallback if the value is falsy
     *
     *      foo='bar'
     *      baz=0
     *
     *      1. {{fallback foo 'default_value'}}
     *      2. {{fallback baz 'default_value'}}
     *
     *      =>
     *      1. 'bar'
     *      2. 'default_value'
    ###

    HandlebarsHelpers.fallback = (obj, fb)->
      if (obj) then obj else fb


    ###*
     * Maps an activity stream to english actions, with fallbacks from a hash
     *
     *      {{activity map activity_entry}}
     *
     *      =>
     *      'reviewed'
    ###
    HandlebarsHelpers.activity = (map, entry)->
        return '' unless entry? and map?

        verb = entry.verb
        type = entry.object?.type
        return '' unless type? and verb?

        sentence = map[verb]?[type]
        return sentence if sentence?

        fallback = map.fallback
        return '' unless fallback?

        type = (entry.object?.uid if type is 'entity') || fallback.object[type] || entry.object.name || entry.object.description

        (fallback.verb[verb]||verb) + ' ' + type


    ###*
     * Finds a string to show in an object, with fallbacks
     *
     *      obj = {
     *          name:''
     *          uid:'Pothole on the street'
     *          description:''
     *      }
     *
     *      {{named obj}}
     *
     *      =>
     *      'Pothole on the street'
     *
    ###
    HandlebarsHelpers.to_s = (object)->
        return '' unless object?
        object.name||object.title||object.uid||object.description||object

    ###*
     * prune {{ prune string 140 "more..." }}
     * Elegant version of truncate. Makes sure the pruned string
     * does not exceed the original length.
     * Avoid half-chopped words when truncating.
    ###
    HandlebarsHelpers.prune = (string, length, pruneString)->
      _.str.prune string, length, pruneString


    ###*
     * truncate {{ truncate string 140 "more..." }}
     * truncate string to a max number of character
     * optional truncateString argument
    ###
    HandlebarsHelpers.truncate = (string, length, truncateString)->
      _.str.truncate string, length, truncateString

    HandlebarsHelpers
