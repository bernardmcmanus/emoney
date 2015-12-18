/*! emoney - 1.0.0 - Bernard McManus - af590a7 - 2015-12-21 */

(function($global,Array,Object,Date,Math,Error,UNDEFINED){
"use strict";

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.E$ = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.whenParser = whenParser;
exports.emitParser = emitParser;
exports.dispelParser = dispelParser;

var _main = _dereq_('main');

var _main2 = _interopRequireDefault(_main);

var _listenerManager = _dereq_('listener-manager');

var _helpers = _dereq_('helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function whenParser(instance, _arguments, cb) {
  var args = (0, _helpers.$_toArray)(_arguments),
      eventList = args.shift() || [_listenerManager.WILDCARD],
      handlerFn = getHandlerFunc(lastIsFunctionOrEmoney(args) ? args.pop() : instance),
      handlerArgs = args[0];
  cb(eventList, handlerArgs, handlerFn);
}

function emitParser(instance, _arguments, cb) {
  var args = (0, _helpers.$_toArray)(_arguments),
      eventList = args.shift() || instance.$__events,
      emitCb = lastIsFunctionOrEmoney(args) ? args.pop() : UNDEFINED,
      handlerArgs = args[0];
  cb(eventList, handlerArgs, emitCb);
}

function dispelParser(instance, _arguments, cb) {
  var args = (0, _helpers.$_toArray)(_arguments),
      eventList = args.shift() || instance.$__events,
      handlerFn = getHandlerFunc(lastIsFunctionOrEmoney(args) ? args.pop() : UNDEFINED),
      wild = !!args[0];
  cb(eventList, wild, handlerFn);
}

function lastIsFunctionOrEmoney(args) {
  var last = args.slice(-1)[0];
  return (0, _helpers.$_is)(last, 'function') || _main2.default.is(last);
}

function getHandlerFunc(subject) {
  return subject && subject.handleE$ || subject;
}

},{"helpers":4,"listener-manager":6,"main":7}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventHandler;

var _helpers = _dereq_('helpers');

function EventHandler(fn, bindArgs) {
  return {
    fn: fn,
    uts: (0, _helpers.$_uts)(),
    invoke: function invoke(evt, invokeArgs) {
      if (!evt.cancelBubble) {
        // invoke( fn , evt , bindArgs , invokeArgs );
        fn.apply(UNDEFINED, [].concat(evt, bindArgs || [], invokeArgs || []));
      }
    }
  };
}

/*function invoke( fn , evt , bindArgs , invokeArgs ){
  fn.apply( UNDEFINED , [].concat( evt , bindArgs || [] , invokeArgs || [] ));
}*/

/*export default class EventHandler {
  static invoke( fn , evt , bindArgs , invokeArgs ){
    fn.apply( UNDEFINED , [].concat( evt , bindArgs || [] , invokeArgs || [] ));
  }
  constructor( fn , bindArgs ){
    var that = this;
    that.fn = fn;
    that.uts = $_uts();
    that.bindArgs = bindArgs;
  }
  invoke( evt , invokeArgs ){
    if (!evt.cancelBubble) {
      EventHandler.invoke( this.fn , evt , this.bindArgs , invokeArgs );
    }
  }
}*/

},{"helpers":4}],3:[function(_dereq_,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = _dereq_('helpers');

function _classCallCheck() {}

var Event = (function () {
  function Event(target, type) {
    _classCallCheck(this, Event);

    var that = this;
    that.target = target;
    that.type = type;
    that.cancelBubble = false;
    that.defaultPrevented = false;
    that.timeStamp = (0, _helpers.$_uts)();
  }

  _createClass(Event, [{
    key: 'preventDefault',
    value: function preventDefault() {
      this.defaultPrevented = true;
    }
  }, {
    key: 'stopPropagation',
    value: function stopPropagation() {
      this.cancelBubble = true;
    }
  }]);

  return Event;
})();

exports.default = Event;

},{"helpers":4}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$_void = $_void;
exports.$_defineProperties = $_defineProperties;
exports.$_is = $_is;
exports.$_toArray = $_toArray;
exports.$_each = $_each;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var $_uts = exports.$_uts = (function () {
  var last,
      inc = 0.001;
  return function $_uts() {
    var now = Date.now();
    last = (now === Math.floor(last) ? last : now) + inc;
    return last;
  };
})();

function $_void(value) {
  return value;
}

function $_defineProperties(subject, descriptors) {
  $_each(descriptors, function (descriptor, key) {
    descriptor.configurable = true;
  });
  Object.defineProperties(subject, descriptors);
}

function $_is(subject, test) {
  if (typeof test == 'string') {
    return (typeof subject === 'undefined' ? 'undefined' : _typeof(subject)) == test;
  } else if (test === Array) {
    return Array.isArray(subject);
  } else if (test) {
    return subject.constructor === ($_is(test, 'function') ? test : test.constructor);
  }
  return subject === test;
}

function $_toArray(subject) {
  return Array.prototype.slice.call(subject, 0);
}

function $_each(subject, cb) {
  if ($_is(subject, Array)) {
    for (var i = 0; i < subject.length; i++) {
      cb(subject[i], i);
    }
  } else if ($_is(subject, 'object')) {
    for (var key in subject) {
      if (subject.hasOwnProperty(key)) {
        cb(subject[key], key);
      }
    }
  } else if (subject) {
    cb(subject, 0);
  }
}

},{}],5:[function(_dereq_,module,exports){
'use strict';

var _main = _dereq_('main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Can't do "export default E$..." here due to
 * https://github.com/babel/babelify/issues/139
 */
module.exports = _main2.default;

},{"main":7}],6:[function(_dereq_,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WILDCARD = undefined;

var _eventHandler = _dereq_('event-handler');

var _eventHandler2 = _interopRequireDefault(_eventHandler);

var _event = _dereq_('event');

var _event2 = _interopRequireDefault(_event);

var _helpers = _dereq_('helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck() {}

var WILDCARD = exports.WILDCARD = '*';

var ListenerManager = (function () {
  function ListenerManager() {
    _classCallCheck(this, ListenerManager);

    var that = this;
    (0, _helpers.$_defineProperties)(that, {
      keys: { get: function get() {
          return Object.keys(that);
        } }
    });
  }
  /*_has( type ){
    return this.keys.indexOf( type ) >= 0;
  }*/

  _createClass(ListenerManager, [{
    key: 'add',
    value: function add(type, fn, args) {
      var that = this,
          evtHandler = new _eventHandler2.default(fn, args),
          handlerArray = that._get(type);
      handlerArray.push(evtHandler);
      that[type] = handlerArray;
      // return evtHandler;
    }
  }, {
    key: '_get',
    value: function _get(eventType, wild) {
      var that = this,
          subset = that;
      if (eventType) {
        subset = subset[eventType] || [];
        if (wild && eventType != WILDCARD) {
          subset = that._get(WILDCARD).concat(subset).sort(function (a, b) {
            return a.uts - b.uts;
          });
        }
      }
      return subset;
    }
  }, {
    key: 'invoke',
    value: function invoke(target, type, args) {
      var handlerArray = this._get(type, true),
          evt = new _event2.default(target, type);
      (0, _helpers.$_each)(handlerArray, function (evtHandler) {
        evtHandler.invoke(evt, args);
      });
      return evt;
    }
  }, {
    key: 'remove',
    value: function remove(type, fn, wild) {
      var that = this,
          handlerArray = that._get(type),
          i = 0,
          index,
          evtHandler;
      while (i < handlerArray.length) {
        index = fn ? indexOfHandler(handlerArray, fn) : i;
        if (index >= 0 && (wild || type != WILDCARD)) {
          handlerArray.splice(index, 1);
          i--;
        }
        i++;
      }
      if (!handlerArray.length) {
        delete that[type];
      } else {
        that[type] = handlerArray;
      }
    }
  }]);

  return ListenerManager;
})();

exports.default = ListenerManager;

function indexOfHandler(handlerArray, fn) {
  var arr = handlerArray.map(function (evtHandler) {
    return evtHandler.fn;
  });
  return arr.indexOf(fn);
}

},{"event":3,"event-handler":2,"helpers":4}],7:[function(_dereq_,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stack = _dereq_('stack');

var _stack2 = _interopRequireDefault(_stack);

var _listenerManager = _dereq_('listener-manager');

var _listenerManager2 = _interopRequireDefault(_listenerManager);

var _helpers = _dereq_('helpers');

var _argumentParsers = _dereq_('argument-parsers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck() {}

var E$ = (function () {
  _createClass(E$, null, [{
    key: 'is',
    value: function is(subject) {
      return !!(subject && (0, _helpers.$_is)(subject, 'object') && 'handleE$' in subject);
    }
  }, {
    key: 'create',
    value: function create(subjectProto) {
      var extendedProto = Object.create(E$.prototype);
      (0, _helpers.$_each)(subjectProto, function (method, name) {
        extendedProto[name] = method;
      });
      return extendedProto;
    }
  }, {
    key: 'construct',
    value: function construct(instance) {
      (0, _helpers.$_defineProperties)(instance, {
        $__stack: { value: new _stack2.default() },
        $__listeners: { value: new _listenerManager2.default() },
        $__events: { get: function get() {
            return instance.$__listeners.keys;
          } },
        handleE$: {
          value: (instance.handleE$ || _helpers.$_void).bind(instance)
        }
      });
    }
  }]);

  function E$(seed) {
    _classCallCheck(this, E$);

    var that = this;
    if (that == $global || that == UNDEFINED) {
      return new E$(seed);
    }
    (0, _helpers.$_each)(seed, function (value, key) {
      that[key] = value;
    });
    E$.construct(that);
  }

  _createClass(E$, [{
    key: '$watch',
    value: function $watch(emitters) {
      var that = this;
      emitters = (0, _helpers.$_is)(emitters, Array) ? emitters : [emitters];
      (0, _helpers.$_each)(emitters, function (emitter, key) {
        emitter.$when(_listenerManager.WILDCARD, that);
      });
      return that;
    }
  }, {
    key: '$ignore',
    value: function $ignore(emitters) {
      var that = this;
      emitters = (0, _helpers.$_is)(emitters, Array) ? emitters : [emitters];
      (0, _helpers.$_each)(emitters, function (emitter) {
        emitter.$dispel(_listenerManager.WILDCARD, true, that);
      });
      return that;
    }
  }, {
    key: '$once',
    value: function $once() {
      var that = this;
      (0, _argumentParsers.whenParser)(that, arguments, function (eventList, handlerArgs, handlerFn) {
        that.$when(eventList, handlerArgs, function once() {
          handlerFn.apply(UNDEFINED, arguments);
          that.$dispel(eventList, true, once);
        });
      });
      return that;
    }
    /*$once(){
      var that = this,
        _arguments = arguments;
      whenParser( that , _arguments , function( eventList ){
        that._$when( _arguments , function( evtHandler ){
          evtHandler.before = function( evt , fn ){
            that.$dispel( eventList , true , fn );
          };
        });
        that.$__stack.flush();
      });
      return that;
    }*/
    /*$when(){
      var that = this;
      that._$when( arguments );
      that.$__stack.flush();
      return that;
    }*/

  }, {
    key: '$when',
    value: function $when() {
      var that = this,
          stack = that.$__stack;
      (0, _argumentParsers.whenParser)(that, arguments, function (eventList, handlerArgs, handlerFn) {
        stack.enqueue(function () {
          (0, _helpers.$_each)(eventList, function (type) {
            that.$__listeners.add(type, handlerFn, handlerArgs);
          });
        });
        stack.flush();
      });
      return that;
    }
  }, {
    key: '$emit',
    value: function $emit() {
      var that = this,
          stack = that.$__stack;
      (0, _argumentParsers.emitParser)(that, arguments, function (eventList, handlerArgs, emitCb) {
        stack.enqueue(function () {
          (0, _helpers.$_each)(eventList, function (type) {
            if (type != _listenerManager.WILDCARD) {
              var evt = that.$__listeners.invoke(that, type, handlerArgs);
              if ((0, _helpers.$_is)(emitCb, 'function') && !evt.defaultPrevented) {
                // emitCb( evt );
                emitCb.apply(UNDEFINED, [].concat(evt, handlerArgs));
              }
            }
          });
        });
        stack.flush();
      });
      return that;
    }
  }, {
    key: '$dispel',
    value: function $dispel() {
      var that = this,
          stack = that.$__stack;
      (0, _argumentParsers.dispelParser)(that, arguments, function (eventList, wild, handlerFn) {
        stack.enqueue(function () {
          (0, _helpers.$_each)(eventList, function (type) {
            that.$__listeners.remove(type, handlerFn, wild);
          });
        });
        stack.flush();
      });
      return that;
    }
    /*_$when( _arguments , cb ){
      var that = this;
      whenParser( that , _arguments , function( eventList , handlerArgs , handlerFn ){
        that.$__stack.enqueue(function(){
          $_each( eventList , function( type ){
            var evtHandler = that.$__listeners.add( type , handlerFn , handlerArgs );
            if (cb) {
              cb( evtHandler );
            }
          });
        });
      });
    }*/

  }]);

  return E$;
})();

exports.default = E$;

},{"argument-parsers":1,"helpers":4,"listener-manager":6,"stack":8}],8:[function(_dereq_,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck() {}

var Stack = (function () {
  function Stack() {
    _classCallCheck(this, Stack);

    var that = this;
    that.index = 0;
    that.length = 0;
    that.inprog = false;
  }

  _createClass(Stack, [{
    key: "enqueue",
    value: function enqueue(fn) {
      var that = this;
      that[that.length] = fn;
      that.length++;
    }
  }, {
    key: "empty",
    value: function empty() {
      this.length = this.index = 0;
    }
  }, {
    key: "next",
    value: function next() {
      var that = this,
          fn = that[that.index];
      delete that[that.index];
      that.index++;
      if (that.index >= that.length) {
        that.empty();
      }
      return fn;
    }
  }, {
    key: "flush",
    value: function flush() {
      var that = this,
          fn,
          caught;
      if (!that.inprog) {
        that.inprog = true;
        /* jshint -W084 */
        while (fn = that.next()) {
          try {
            fn();
          } catch (err) {
            caught = err;
            that.empty();
          }
        }
        that.inprog = false;
        if (caught) {
          throw caught;
        }
      }
    }
  }]);

  return Stack;
})();

exports.default = Stack;

},{}]},{},[5])(5)
});
//# sourceMappingURL=emoney.js.map


}(this,Array,Object,Date,Math,Error))