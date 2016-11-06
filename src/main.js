import Event from 'event';
import stack from 'stack';
import * as _ from 'helpers';
import {
	WILDCARD,
	default as ListenerManager
} from 'listener-manager';
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
	_.each( seed , function( value , key ){
		that[key] = value;
	});
	var listeners = new ListenerManager(),
		descriptors = {
			$__listeners: { value: listeners },
			$__handleWild: { value: function(){
				var args = _.toArray( arguments ),
					evt = args.shift();
				listeners.invoke( evt , args );
			}},
			handleE$: {
				value: (that.handleE$ || function(){}).bind( that )
			},
		};
	_.each( descriptors , function( descriptor ){
		descriptor.configurable = true;
	});
	Object.defineProperties( that , descriptors );
}

E$.is = function( subject ) {
	return !!subject && _.isObject( subject ) && _.isFunction( subject.handleE$ );
};

E$.prototype = {
	constructor: E$,
	$watch: function( emitters ){
		var that = this;
		emitters = [].concat( emitters );
		_.each( emitters , function( emitter , key ){
			emitter
				.$when( WILDCARD , that )
				.$when( WILDCARD , that.$__handleWild );
		});
		return that;
	},
	$unwatch: function( emitters ){
		var that = this;
		emitters = [].concat( emitters );
		_.each( emitters , function( emitter ){
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
			_.each( eventTypes , function( type ){
				var evt = new Event( that , type );
				that.$__listeners.invoke( evt , listenerArgs );
				stack.digest(function(){
					if (_.isFunction( emitCb ) && !evt.defaultPrevented) {
						emitCb.apply( UNDEFINED , [].concat( evt , listenerArgs ));
					}
				});
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
