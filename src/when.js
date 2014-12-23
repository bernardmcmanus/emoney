import Event from 'event';
import EventHandler from 'eventHandler';
import isE$ from 'static/is-emoney';
import {
  $WHEN,
  $EMIT,
  $DISPEL,
  $FUNCTION,
  $WILDCARD
} from 'static/constants';
import {
  $_length,
  $_shift,
  $_pop,
  $_slice,
  $_indexOf,
  $_last,
  $_ensureArray,
  $_forEach,
  $_is,
  $_delete,
  $_ensureFunc,
  $_getHandlerFunc,
  $_getHandlerContext
} from 'static/shared';

function indexOfHandler( handlerArray , func ) {
  var arr = handlerArray.map(function( evtHandler ) {
    return evtHandler.func;
  });
  return $_indexOf( arr , func );
}

export default {

  /*parsed == [ eventList , [args] , [E$Handler] ]*/
  $once: function() {

    var that = this;
    var parsed = that.__parse( $WHEN , arguments );

    that._$when( arguments , function( evtHandler ) {
      evtHandler.before = function( evt , func ) {
        that.$dispel( parsed[0] , true , func );
      };
    });

    that.$flush();

    return that;
  },

  $when: function() {
    var that = this;
    that._$when( arguments );
    that.$flush();
    return that;
  },

  /*parsed == [ eventList , [args] , [callback] ]*/
  $emit: function() {

    var that = this;
    var parsed = that.__parse( $EMIT , arguments );

    that.$enq(function() {
      $_forEach( parsed[0] , function( type ) {
        if (type != $WILDCARD) {
          that.__invoke( type , parsed[1] , parsed[2] );
        }
      });
    });

    that.$flush();

    return that;
  },

  /*parsed == [ [eventList] , [wild] , [E$Handler] ]*/
  $dispel: function() {

    var that = this;
    var parsed = that.__parse( $DISPEL , arguments );
    var func = $_getHandlerFunc( parsed[2] );

    that.$enq(function() {
      $_forEach( parsed[0] , function( type ) {
        that.__remove( type , func , !!parsed[1] );
      });
    });

    that.$flush();

    return that;
  },

  /*args == parsed == [ eventList , [bindArgs] , [E$Handler] ]*/
  _$when: function( args , callback ) {

    callback = $_ensureFunc( callback );

    var that = this;
    var parsed = that.__parse( $WHEN , args );
    
    var func = $_getHandlerFunc( parsed[2] );
    var context = $_getHandlerContext( parsed[2] , func );

    that.$enq(function() {
      $_forEach( parsed[0] , function( type , i ) {
        var evtHandler = that.__add( type , func , context , parsed[1] );
        callback( evtHandler );
      });
    });
  },

  __parse: function( type , args ) {

    var that = this;
    var parsed = [];
    var events = that.__events;

    args = $_slice( args );

    $_forEach([ 0 , 1 , 2 ] , function( i ) {

      // eventList
      if (!i) {
        parsed[0] = $_shift( args ) || (type == $DISPEL ? that.__events : $WILDCARD);
      }
      
      // E$Handler / func
      else if (i < 2) {
        parsed[2] = $_is($_last( args ) , $FUNCTION ) || isE$($_last( args )) ? $_pop( args ) : null;
        parsed[2] = type != $DISPEL ? (parsed[2] || that) : parsed[2];
      }

      // args / wild
      else {
        parsed[1] = args[0];
      }
    });

    return parsed;
  },

  __get: function( eventType , wild ) {
    var that = this;
    var handlers = that.handlers;
    var targetSet = eventType ? $_ensureArray( handlers[eventType] ) : handlers;
    if (eventType && wild && eventType != $WILDCARD) {
      targetSet = that.__get( $WILDCARD ).concat( targetSet ).sort(function( a , b ) {
        return a.uts - b.uts;
      });
    }
    return targetSet;
  },

  __invoke: function( type , args , callback ) {

    var that = this;
    var handlers = that.__get( type , true );
    var evt = new Event( that , type );

    callback = $_ensureFunc( callback );
    
    $_forEach( handlers , function( evtHandler ) {
      evtHandler.after = callback;
      evtHandler.invoke( evt , args );
    });
  },

  __add: function( type , func , context , args ) {
    
    var that = this;
    var evtHandler = new EventHandler( func , context , args );
    var handlerArray = that.__get( type );

    handlerArray.push( evtHandler );
    that.handlers[type] = handlerArray;

    return evtHandler;
  },

  __remove: function( type , func , wild ) {

    var that = this;
    var handlers = that.__get();
    var handlerArray = that.__get( type );
    var i = 0, index, evtHandler;

    while (i < $_length( handlerArray )) {
      index = (func ? indexOfHandler( handlerArray , func ) : i);
      if (index >= 0 && (wild || type != $WILDCARD)) {
        handlerArray.splice( index , 1 );
        i--;
      }
      i++;
    }
    
    if (!$_length( handlerArray )) {
      $_delete( handlers , type );
    }
    else {
      handlers[type] = handlerArray;
    }
  }
};



















