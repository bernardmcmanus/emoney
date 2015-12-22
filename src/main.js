import Event from 'event';
import {
  WILDCARD,
  default as ListenerManager
} from 'listener-manager';
import {
  $_toArray,
  $_is,
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
    var listeners = new ListenerManager();
    $_defineProperties( instance , {
      $__listeners: { value: listeners },
      $__handleWild: { value: function(){
        var args = $_toArray( arguments ),
          evt = args.shift();
        listeners.invoke( evt , args );
      }},
      handleE$: {
        value: (instance.handleE$ || function(){}).bind( instance )
      },
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
    emitters = [].concat( emitters );
    $_each( emitters , function( emitter , key ){
      emitter
        .$when( WILDCARD , that )
        .$when( WILDCARD , that.$__handleWild );
    });
    return that;
  }
  $unwatch( emitters ){
    var that = this;
    emitters = [].concat( emitters );
    $_each( emitters , function( emitter ){
      emitter
        .$dispel( WILDCARD , true , that )
        .$dispel( WILDCARD , true , that.$__handleWild );
    });
    return that;
  }
  $once(){
    var that = this,
      called;
    whenParser( that , arguments , function( eventTypes , handlerArgs , handlerFn ){
      that.$when( eventTypes , handlerArgs , function once(){
        if (!called) {
          called = true;
          handlerFn.apply( UNDEFINED , arguments );
          that.$dispel( eventTypes , true , once );
        }
      });
    });
    return that;
  }
  $when(){
    var that = this;
    whenParser( that , arguments , function( eventTypes , handlerArgs , handlerFn ){
      that.$__listeners.add( eventTypes , handlerFn , handlerArgs );
    });
    return that;
  }
  $emit(){
    var that = this;
    emitParser( that , arguments , function( eventTypes , handlerArgs , emitCb ){
      $_each( eventTypes , function( type ){
        var evt = new Event( that , type );
        that.$__listeners.invoke( evt , handlerArgs );
        if ($_is( emitCb , 'function' ) && !evt.defaultPrevented) {
          emitCb.apply( UNDEFINED , [].concat( evt , handlerArgs ));
        }
      });
    });
    return that;
  }
  $dispel(){
    var that = this;
    dispelParser( that , arguments , function( eventTypes , wild , handlerFn ){
      that.$__listeners.remove( eventTypes , handlerFn , wild );
    });
    return that;
  }
}
