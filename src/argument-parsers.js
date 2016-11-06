import E$ from 'main';
import { WILDCARD } from 'listener-manager';
import * as _ from 'helpers';

export function whenParser( instance , _arguments , cb ){
	var args = _.toArray( _arguments ),
		eventTypes = args.shift() || WILDCARD,
		listenerFn = getListenerFunc( lastIsFunctionOrEmoney( args ) ? args.pop() : instance ),
		listenerArgs = args[0];
	cb( eventTypes , listenerArgs , listenerFn );
}

export function emitParser( instance , _arguments , cb ){
	var args = _.toArray( _arguments ),
		eventTypes = args.shift() || [],
		emitCb = (lastIsFunctionOrEmoney( args ) ? args.pop() : UNDEFINED),
		listenerArgs = args[0];
	cb( eventTypes , listenerArgs , emitCb );
}

export function dispelParser( instance , _arguments , cb ){
	var args = _.toArray( _arguments ),
		eventTypes = args.shift() || WILDCARD,
		listenerFn = getListenerFunc( lastIsFunctionOrEmoney( args ) ? args.pop() : UNDEFINED ),
		wild = !!args[0];
	cb( eventTypes , wild , listenerFn );
}

function lastIsFunctionOrEmoney( args ){
	var last = args.slice( -1 )[0];
	return _.isFunction( last ) || E$.is( last );
}

function getListenerFunc( subject ){
	return subject && subject.handleE$ || subject;
}
