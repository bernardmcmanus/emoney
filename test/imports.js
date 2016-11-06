import E$ from 'main';
import EventListener from 'event-listener';
import Event from 'event';
import stack from 'stack';
import {
	WILDCARD,
	default as ListenerManager
} from 'listener-manager';

class E$Extended extends E$ {
	constructor(){
		super();
	}
	handleE$( e , cb ){
		if (cb) {
			cb();
		}
	}
}

module.exports = {
	E$: E$,
	WILDCARD: WILDCARD,
	Event: Event,
	EventListener: EventListener,
	stack: stack,
	ListenerManager: ListenerManager,
	E$Extended: E$Extended
};
