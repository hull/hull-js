import EventEmitter from "eventemitter2";
var emitter = new EventEmitter({
  wildcard: true,
  maxListeners: 200,
  newListener: false,
  delimiter: "."
});
export default emitter;
