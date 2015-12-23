import Event from 'event';
import {
  WILDCARD,
  default as ListenerManager
} from 'listener-manager';
import {
  $_toArray,
  $_isObject,
  $_isFunction,
  $_each
} from 'helpers';
import {
  whenParser,
  emitParser,
  dispelParser
} from 'argument-parsers';

export default function E$( seed ){
  var that = this;
  if (that == $global || that == UNDEFINED) {
    return new E$( seed );
  }
  $_each( seed , function( value , key ){
    that[key] = value;
  });
  E$.construct( that );
}

E$.is = function( subject ) {
  return !!(subject && $_isObject( subject ) && 'handleE$' in subject);
};

E$.create = function( subjectProto ){
  var extendedProto = Object.create( E$.prototype );
  $_each( subjectProto , function( method , name ){
    extendedProto[name] = method;
  });
  return extendedProto;
};

E$.construct = function( instance ){
  var listeners = new ListenerManager(),
    descriptors = {
      $__listeners: { value: listeners },
      $__handleWild: { value: function(){
        var args = $_toArray( arguments ),
          evt = args.shift();
        listeners.invoke( evt , args );
      }},
      handleE$: {
        value: (instance.handleE$ || function(){}).bind( instance )
      },
    };
  $_each( descriptors , function( descriptor ){
    descriptor.configurable = true;
  });
  Object.defineProperties( instance , descriptors );
};

E$.prototype = {
  constructor: E$,
  $watch: function( emitters ){
    var that = this;
    emitters = [].concat( emitters );
    $_each( emitters , function( emitter , key ){
      emitter
        .$when( WILDCARD , that )
        .$when( WILDCARD , that.$__handleWild );
    });
    return that;
  },
  $unwatch: function( emitters ){
    var that = this;
    emitters = [].concat( emitters );
    $_each( emitters , function( emitter ){
      emitter
        .$dispel( WILDCARD , true , that )
        .$dispel( WILDCARD , true , that.$__handleWild );
    });
    return that;
  },
  $once: function(){
    var that = this,
      called;
    whenParser( that , arguments , function( eventTypes , listenerArgs , listenerFn ){
      that.$when( eventTypes , listenerArgs , function once(){
        if (!called) {
          called = true;
          listenerFn.apply( UNDEFINED , arguments );
          that.$dispel( eventTypes , true , once );
        }
      });
    });
    return that;
  },
  $when: function(){
    var that = this;
    whenParser( that , arguments , function( eventTypes , listenerArgs , listenerFn ){
      that.$__listeners.add( eventTypes , listenerFn , listenerArgs );
    });
    return that;
  },
  $emit: function(){
    var that = this;
    emitParser( that , arguments , function( eventTypes , listenerArgs , emitCb ){
      $_each( eventTypes , function( type ){
        var evt = new Event( that , type );
        that.$__listeners.invoke( evt , listenerArgs );
        if ($_isFunction( emitCb ) && !evt.defaultPrevented) {
          emitCb.apply( UNDEFINED , [].concat( evt , listenerArgs ));
        }
      });
    });
    return that;
  },
  $dispel: function(){
    var that = this;
    dispelParser( that , arguments , function( eventTypes , wild , listenerFn ){
      that.$__listeners.remove( eventTypes , listenerFn , wild );
    });
    return that;
  }
};
