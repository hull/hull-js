define({
  type: "Hull",
  templates: ['friends_list'],
  datasources: {
    friends: function() {
      return this.api("hull/me/friends");
    }
  }
})