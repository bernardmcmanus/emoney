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

  proto.$listen = function( emitters ) {
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

  proto.$enq = function( task ) {
    var that = this;
    that.__stack.push( task );
  };

  proto.$flush = function() {
    
    var that = this;
    var stack = that.__stack;

    if (that.__inprog) {
      return;
    }

    that.__inprog = true;

    while ($_length( stack )) {
      $_shift( stack )();
    }
    
    that.__inprog = false;
  };

  return proto;
}



















