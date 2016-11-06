import EventListener from 'event-listener';
import stack from 'stack';
import * as _ from 'helpers';

export const WILDCARD = '*';

export default function ListenerManager(){
	Array.call( this );
}

ListenerManager.prototype = Object.create( Array.prototype );

ListenerManager.prototype.constructor = ListenerManager;

ListenerManager.prototype.add = function( types , fn , args ){
	var that = this;
	stack.digest(function(){
		that.push(
			new EventListener( types , fn , args )
		);
	});
};

ListenerManager.prototype.invoke = function( evt , args ){
	var that = this;
	stack.digest(function(){
		that.forEach(function( evtListener ){
			evtListener.invoke( evt , args );
		});
	});
};

ListenerManager.prototype.remove = function( removeTypes , fn , wild ){
	var that = this;
	removeTypes = [].concat( removeTypes );
	stack.digest(function(){
		_.each( removeTypes , function( removeType ){
			var len = that.length,
				i = 0,
				evtListener,
				handleTypes,
				index;
			while (i < len) {
				evtListener = that[i];
				if (!fn || evtListener.fn == fn) {
					handleTypes = evtListener.types;
					index = handleTypes.indexOf( removeType );
					if (index >= 0 && removeType != WILDCARD) {
						handleTypes.splice( index , 1 );
					}
					if (handleTypes.length < 1 || (removeType == WILDCARD && (wild || index < 0))) {
						that.splice( i , 1 );
						i--;
						len--;
					}
				}
				i++;
			}
		});
	});
};
