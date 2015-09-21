'use strict';

export function addEvent(node, eventName, handler) {
  if (node.attachEvent) {
    node.attachEvent(`on${eventName}`, handler);
  } else {
    node.addEventListener(eventName, handler, false);
  }
}

export function removeEvent(node, eventName, handler) {
  if (node.detachEvent) {
    node.detachEvent(`on${eventName}`, handler);
  } else {
    node.removeEventListener(eventName, handler, false);
  }
}
