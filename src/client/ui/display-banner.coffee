_           = require '../../utils/lodash'

banners = {
  platform: """
    <div style="position:fixed;
      top:0;
      left:0;
      right:0;
      padding:30px 0;
      background:white;
      -webkit-font-smoothing:antialiased;
      text-align: center">
      <h3 style="color:#666;
        margin:0 0 5px 0;
        font-size: 24px;
        font-weight: normal;
        font-family:'Helvetica Neue',Helvetica,arial,sans-serif;
        "
      >Congratulations! Hull is ready.</h3>
      <p style="font-size: 14px;
        margin:0 0 10px 0;
        color:#838383;
        font-weight: normal;
        font-family:'Helvetica Neue',Helvetica,arial,sans-serif;
        "
      >This banner is only visible to you. you can test login below.</p>
      <a data-hull-intent="hull.intent.login" href="#" style="-webkit-border-radius: 3px;
        margin:0;
        -moz-border-radius:3px;
        border-radius: 3px;
        background: white;
        color:#33ADEC;
        border:1px solid #33ADEC;
        padding:10px 30px;
        font-size: 14px;
        line-height: 50px;
        font-weight: normal"
      >Login</a>
    </div>    
  """
}

module.exports = (banner)->
  node = document.createElement('div');
  node.innerHTML = banners[banner];
  a=node.getElementsByTagName('a');
  _.each a, (element)->
    intent = element.getAttribute('data-hull-intent')
    element.addEventListener 'click',(e)->
      e.stopPropagation()
      e.preventDefault()
      Hull.emit(intent)
  document.body.appendChild(node);
