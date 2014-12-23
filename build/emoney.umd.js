import E$ from './index';

if (typeof define == 'function' && define.amd) {
  define([], function() { return E$ });
}
else if (typeof exports == 'object') {
  module.exports = E$;
}
else {
  this.E$ = E$;
}