import E$ from 'main';
import { WILDCARD } from 'listener-manager';
import { $_is, $_toArray } from 'helpers';

export function whenParser( instance , _arguments , cb ){
  var args = $_toArray( _arguments ),
    eventList = args.shift() || [ WILDCARD ],
    handlerFn = getHandlerFunc( lastIsFunctionOrEmoney( args ) ? args.pop() : instance ),
    handlerArgs = args[0];
  cb( eventList , handlerArgs , handlerFn );
}

export function emitParser( instance , _arguments , cb ){
  var args = $_toArray( _arguments ),
    // eventList = args.shift() || instance.$__events,
    eventList = args.shift() || [ WILDCARD ],
    emitCb = (lastIsFunctionOrEmoney( args ) ? args.pop() : UNDEFINED),
    handlerArgs = args[0];
  cb( eventList , handlerArgs , emitCb );
}

export function dispelParser( instance , _arguments , cb ){
  var args = $_toArray( _arguments ),
    // eventList = args.shift() || instance.$__events,
    eventList = args.shift() || [ WILDCARD ],
    handlerFn = getHandlerFunc( lastIsFunctionOrEmoney( args ) ? args.pop() : UNDEFINED ),
    wild = !!args[0];
  cb( eventList , wild , handlerFn );
}

function lastIsFunctionOrEmoney( args ){
  var last = args.slice( -1 )[0];
  return $_is( last , 'function' ) || E$.is( last );
}

function getHandlerFunc( subject ){
  return subject && subject.handleE$ || subject;
}
