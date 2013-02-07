/**
 * Friends list Widget
 *
 * Displays the list of your friends in the application
 *
 * ### Templates
 *
 * * ```friends_list```: Displays the list of the user's friends using the application
 *
 * ### Datasources
 *
 * * ```friends```: Specify how the list should be displayed
 *
 */
define({
  type: "Hull",
  templates: ['friends_list'],
  datasources: {
    friends: function() {
      return this.api("hull/me/friends");
    }
  }
})
