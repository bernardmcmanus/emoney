import Event from 'event';
import Stack from 'stack';
import {
  WILDCARD,
  default as ListenerManager
} from 'listener-manager';
import {
  $_toArray,
  $_is,
  $_void,
  $_each,
  $_defineProperties
} from 'helpers';
import {
  whenParser,
  emitParser,
  dispelParser
} from 'argument-parsers';

export default class E$ {
  static is( subject ) {
    return !!(subject && $_is( subject , 'object' ) && 'handleE$' in subject);
  }
  static create( subjectProto ){
    var extendedProto = Object.create( E$.prototype );
    $_each( subjectProto , function( method , name ){
      extendedProto[name] = method;
    });
    return extendedProto;
  }
  static construct( instance ){
    $_defineProperties( instance , {
      $__stack: { value: new Stack() },
      $__listeners: { value: new ListenerManager() },
      $__events: { get: function(){
        return instance.$__listeners.keys;
      }},
      handleE$: {
        value: (instance.handleE$ || $_void).bind( instance )
      },
      _handleWild: {
        value: function(){
          var args = $_toArray( arguments ),
            evt = args.shift();
          instance.$__listeners.invoke( evt , args );
        }
      }
    });
  }
  constructor( seed ){
    var that = this;
    if (that == $global || that == UNDEFINED) {
      return new E$( seed );
    }
    $_each( seed , function( value , key ){
      that[key] = value;
    });
    E$.construct( that );
  }
  $watch( emitters ){
    var that = this;
    emitters = $_is( emitters , Array ) ? emitters : [ emitters ];
    $_each( emitters , function( emitter , key ){
      emitter
        .$when( WILDCARD , that )
        .$when( WILDCARD , that._handleWild );
    });
    return that;
  }
  $unwatch( emitters ){
    var that = this;
    emitters = $_is( emitters , Array ) ? emitters : [ emitters ];
    $_each( emitters , function( emitter ){
      emitter
        .$dispel( WILDCARD , true , that )
        .$dispel( WILDCARD , true , that._handleWild );
    });
    return that;
  }
  $once(){
    var that = this;
    whenParser( that , arguments , function( eventList , handlerArgs , handlerFn ){
      that.$when( eventList , handlerArgs , function once(){
        handlerFn.apply( UNDEFINED , arguments );
        that.$dispel( eventList , true , once );
      });
    });
    return that;
  }
  $when(){
    var that = this,
      stack = that.$__stack;
    whenParser( that , arguments , function( eventList , handlerArgs , handlerFn ){
      stack.enqueue(function(){
        $_each( eventList , function( type ){
          that.$__listeners.add( type , handlerFn , handlerArgs );
        });
      });
      stack.flush();
    });
    return that;
  }
  $emit(){
    var that = this,
      stack = that.$__stack;
    emitParser( that , arguments , function( eventList , handlerArgs , emitCb ){
      stack.enqueue(function(){
        $_each( eventList , function( type ){
          if (type != WILDCARD) {
            var evt = new Event( that , type );
            that.$__listeners.invoke( evt , handlerArgs );
            if ($_is( emitCb , 'function' ) && !evt.defaultPrevented) {
              emitCb.apply( UNDEFINED , [].concat( evt , handlerArgs ));
            }
          }
        });
      });
      stack.flush();
    });
    return that;
  }
  $dispel(){
    var that = this,
      stack = that.$__stack;
    dispelParser( that , arguments , function( eventList , wild , handlerFn ){
      stack.enqueue(function(){
        $_each( eventList , function( type ){
          that.$__listeners.remove( type , handlerFn , wild );
        });
      });
      stack.flush();
    });
    return that;
  }
}
