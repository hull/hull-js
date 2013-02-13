define(function() { return [
  {
    name : "name",
    type : "text",
    label : "Nom",
    value : "",
    placeholder : "Bob",
    error : "Please enter your name"
  },
  {
    name : "email",
    type : "text",
    label : "Email",
    value : "",
    placeholder : "bob@host.com",
    error : "Invalid Email"
  },
  {
    name : "gender",
    type : "select",
    label : "Gender",
    options: [
      {"label": "Male", "value":"Male"},
      {"label": "Female", "value":"Female"}
    ],
    error : "Please select something"
  }
]});
