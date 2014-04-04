Hull.component({
  templates: ['avatar'],
  beforeRender: function (data) {
    data.avatar = this.options.avatar || (this.options.baseUrl + '/avatar.png');
  }
});
