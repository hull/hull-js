// Need help for patterns ?
// ==> http://html5pattern.com/
define(function() { return [
  {
    name : "name",
    type : "text",
    label : "Nom",
    value : "",
    placeholder : "Bob",
    error : "Please enter your name",
    required: true,
    autocomplete: "off"
  },
  {
    name : "color",
    type : "text",
    label : "Your favorite color",
    value : "",
    placeholder : "#fff",
    error : "Please enter a valid color",
    required: true,
    pattern: "^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
  },
  {
    name : "url",
    type : "url",
    label : "Url",
    value : "",
    required: true,
    placeholder : "http://www.google.fr",
    error : "Invalid URL"
  },
  {
    name : "email",
    type : "email",
    label : "Email",
    value : "",
    required: true,
    placeholder : "you@awesome.com",
    error : "Invalid Email"
  },
  {
    name : "tel",
    type : "tel",
    label : "Tel",
    value : "",
    required: true,
    placeholder : "123-456-7890",
    error : "Invalid Tel"
  },
  {
    name : "gender",
    type : "select",
    label : "Gender",
    required: true,
    options: [
      {"label": "Male", "value":"Male"},
      {"label": "Female", "value":"Female"}
    ],
    error : "Please select something"
  },
  {
    name : "notifications",
    type : "checkbox",
    label : "",
    checkboxLabel: "Subscribe to notifications"
  }
];});
