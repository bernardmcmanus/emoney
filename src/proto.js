import when from 'when';
import construct from 'static/construct';
import { $WILDCARD } from 'static/constants';
import {
  $_create,
  $_shift,
  $_length,
  $_forEach
} from 'static/shared';


export default Proto();


function Proto() {

  var proto = $_create( when );

  proto.__init = function( that , seed ) {
    for (var key in seed) {
      that[key] = seed[key];
    }
    construct( that );
  };

  proto.$watch = function( emitters ) {
    var that = this;
    $_forEach( emitters , function( emitter ) {
      emitter.$when( $WILDCARD , that );
    });
    return that;
  };

  proto.$ignore = function( emitters ) {
    var that = this;
    $_forEach( emitters , function( emitter ) {
      emitter.$dispel( $WILDCARD , true , that );
    });
    return that;
  };

  proto.$$enq = function( task ) {
    var that = this;
    that.__stack.push( task );
  };

  proto.$$flush = function( clear ) {
    
    var that = this;
    var stack = that.__stack;
    var task;

    if (that.__inprog && !clear) {
      return;
    }

    that.__inprog = true;

    while ($_length( stack )) {
      try {
        task = $_shift( stack );
        if (!clear) {
          task();
        }
      }
      catch( err ) {
        that.$$flush( true );
        throw err;
      }
    }
    
    that.__inprog = false;
  };

  return proto;
}



















