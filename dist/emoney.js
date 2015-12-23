/*! emoney - 1.0.0 - Bernard McManus - 4429d46 - 2015-12-23 */

(function($global,Array,Object,Date,Error,UNDEFINED){
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
      eventTypes = args.shift() || _listenerManager.WILDCARD,
      listenerFn = getListenerFunc(lastIsFunctionOrEmoney(args) ? args.pop() : instance),
      listenerArgs = args[0];
  cb(eventTypes, listenerArgs, listenerFn);
}

function emitParser(instance, _arguments, cb) {
  var args = (0, _helpers.$_toArray)(_arguments),
      eventTypes = args.shift() || [],
      emitCb = lastIsFunctionOrEmoney(args) ? args.pop() : UNDEFINED,
      listenerArgs = args[0];
  cb(eventTypes, listenerArgs, emitCb);
}

function dispelParser(instance, _arguments, cb) {
  var args = (0, _helpers.$_toArray)(_arguments),
      eventTypes = args.shift() || _listenerManager.WILDCARD,
      listenerFn = getListenerFunc(lastIsFunctionOrEmoney(args) ? args.pop() : UNDEFINED),
      wild = !!args[0];
  cb(eventTypes, wild, listenerFn);
}

function lastIsFunctionOrEmoney(args) {
  var last = args.slice(-1)[0];
  return (0, _helpers.$_is)(last, 'function') || _main2.default.is(last);
}

function getListenerFunc(subject) {
  return subject && subject.handleE$ || subject;
}

},{"helpers":4,"listener-manager":6,"main":7}],2:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventListener;

var _listenerManager = _dereq_('listener-manager');

function EventListener(types, fn, bindArgs) {
  types = [].concat(types);
  bindArgs = bindArgs != UNDEFINED ? bindArgs : [];
  if (types.indexOf(_listenerManager.WILDCARD) >= 0 && types.length > 1) {
    throw new Error('Wildcard listeners cannot include other types.');
  }
  this.fn = fn;
  this.types = types;
  this.invoke = function (evt, invokeArgs) {
    if (!evt.cancelBubble && (types[0] == _listenerManager.WILDCARD || types.indexOf(evt.type) >= 0)) {
      invokeArgs = invokeArgs != UNDEFINED ? invokeArgs : [];
      fn.apply(UNDEFINED, [].concat(evt, bindArgs, invokeArgs));
    }
  };
}

},{"listener-manager":6}],3:[function(_dereq_,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listenerManager = _dereq_('listener-manager');

function _classCallCheck() {}

var Event = (function () {
  function Event(target, type) {
    _classCallCheck(this, Event);

    if (type == _listenerManager.WILDCARD) {
      throw new Error('Invalid event type: ' + _listenerManager.WILDCARD + '.');
    }
    var that = this;
    that.target = target;
    that.type = type;
    that.cancelBubble = false;
    that.defaultPrevented = false;
    that.timeStamp = Date.now();
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

},{"listener-manager":6}],4:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$_defineProperties = $_defineProperties;
exports.$_is = $_is;
exports.$_toArray = $_toArray;
exports.$_each = $_each;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WILDCARD = undefined;
exports.default = ListenerManager;

var _eventListener = _dereq_('event-listener');

var _eventListener2 = _interopRequireDefault(_eventListener);

var _stack = _dereq_('stack');

var _stack2 = _interopRequireDefault(_stack);

var _helpers = _dereq_('helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WILDCARD = exports.WILDCARD = '*';

function enqueue(fn) {
  _stack2.default.enqueue(fn);
  _stack2.default.flush();
}

function ListenerManager() {
  Array.call(this);
}

ListenerManager.prototype = Object.create(Array.prototype);

ListenerManager.prototype.constructor = ListenerManager;

ListenerManager.prototype.add = function (types, fn, args) {
  var that = this;
  enqueue(function () {
    that.push(new _eventListener2.default(types, fn, args));
  });
};

ListenerManager.prototype.invoke = function (evt, args) {
  var that = this;
  enqueue(function () {
    that.forEach(function (evtListener) {
      evtListener.invoke(evt, args);
    });
  });
};

ListenerManager.prototype.remove = function (removeTypes, fn, wild) {
  var that = this;
  removeTypes = [].concat(removeTypes);
  enqueue(function () {
    (0, _helpers.$_each)(removeTypes, function (removeType) {
      var len = that.length,
          i = 0,
          evtListener,
          handleTypes,
          index;
      while (i < len) {
        evtListener = that[i];
        if (!fn || evtListener.fn == fn) {
          handleTypes = evtListener.types;
          index = handleTypes.indexOf(removeType);
          if (index >= 0 && removeType != WILDCARD) {
            handleTypes.splice(index, 1);
          }
          if (handleTypes.length < 1 || removeType == WILDCARD && (wild || index < 0)) {
            that.splice(i, 1);
            i--;
            len--;
          }
        }
        i++;
      }
    });
  });
};

},{"event-listener":2,"helpers":4,"stack":8}],7:[function(_dereq_,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _event = _dereq_('event');

var _event2 = _interopRequireDefault(_event);

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
      var listeners = new _listenerManager2.default();
      (0, _helpers.$_defineProperties)(instance, {
        $__listeners: { value: listeners },
        $__handleWild: { value: function value() {
            var args = (0, _helpers.$_toArray)(arguments),
                evt = args.shift();
            listeners.invoke(evt, args);
          } },
        handleE$: {
          value: (instance.handleE$ || function () {}).bind(instance)
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
      emitters = [].concat(emitters);
      (0, _helpers.$_each)(emitters, function (emitter, key) {
        emitter.$when(_listenerManager.WILDCARD, that).$when(_listenerManager.WILDCARD, that.$__handleWild);
      });
      return that;
    }
  }, {
    key: '$unwatch',
    value: function $unwatch(emitters) {
      var that = this;
      emitters = [].concat(emitters);
      (0, _helpers.$_each)(emitters, function (emitter) {
        emitter.$dispel(_listenerManager.WILDCARD, true, that).$dispel(_listenerManager.WILDCARD, true, that.$__handleWild);
      });
      return that;
    }
  }, {
    key: '$once',
    value: function $once() {
      var that = this,
          called;
      (0, _argumentParsers.whenParser)(that, arguments, function (eventTypes, listenerArgs, listenerFn) {
        that.$when(eventTypes, listenerArgs, function once() {
          if (!called) {
            called = true;
            listenerFn.apply(UNDEFINED, arguments);
            that.$dispel(eventTypes, true, once);
          }
        });
      });
      return that;
    }
  }, {
    key: '$when',
    value: function $when() {
      var that = this;
      (0, _argumentParsers.whenParser)(that, arguments, function (eventTypes, listenerArgs, listenerFn) {
        that.$__listeners.add(eventTypes, listenerFn, listenerArgs);
      });
      return that;
    }
  }, {
    key: '$emit',
    value: function $emit() {
      var that = this;
      (0, _argumentParsers.emitParser)(that, arguments, function (eventTypes, listenerArgs, emitCb) {
        (0, _helpers.$_each)(eventTypes, function (type) {
          var evt = new _event2.default(that, type);
          that.$__listeners.invoke(evt, listenerArgs);
          if ((0, _helpers.$_is)(emitCb, 'function') && !evt.defaultPrevented) {
            emitCb.apply(UNDEFINED, [].concat(evt, listenerArgs));
          }
        });
      });
      return that;
    }
  }, {
    key: '$dispel',
    value: function $dispel() {
      var that = this;
      (0, _argumentParsers.dispelParser)(that, arguments, function (eventTypes, wild, listenerFn) {
        that.$__listeners.remove(eventTypes, listenerFn, wild);
      });
      return that;
    }
  }]);

  return E$;
})();

exports.default = E$;

},{"argument-parsers":1,"event":3,"helpers":4,"listener-manager":6}],8:[function(_dereq_,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var stack,
    index = 0,
    length = 0,
    inprog = false;

exports.default = stack = Object.create({
  /* jshint -W033 */
  get index() {
    return index;
  },
  get length() {
    return length;
  },
  get inprog() {
    return inprog;
  },
  enqueue: function enqueue(fn) {
    stack[length] = fn;
    length++;
  },
  flush: function flush() {
    var fn, caught;
    if (!inprog) {
      inprog = true;
      /* jshint -W084 */
      while (fn = next()) {
        try {
          fn();
        } catch (err) {
          caught = err;
          empty();
          break;
        }
      }
      inprog = false;
      if (caught) {
        throw caught;
      }
    }
  }
});

function drop() {
  delete stack[index];
}

function empty() {
  index = length;
  while (index > 0) {
    index--;
    drop();
  }
  length = index = 0;
}

function next() {
  var fn = stack[index];
  drop();
  index++;
  if (index >= length) {
    empty();
  }
  return fn;
}

},{}]},{},[5])(5)
});
//# sourceMappingURL=emoney.js.map


}(this,Array,Object,Date,Error))