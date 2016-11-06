import { WILDCARD } from 'listener-manager';

export default function Event(target, type) {
	if (type == WILDCARD) {
		throw new Error('Invalid event type: ' + WILDCARD + '.');
	}
	var that = this;
	that.target = target;
	that.type = type;
	that.cancelBubble = false;
	that.defaultPrevented = false;
	that.timeStamp = Date.now();
}

Event.prototype.preventDefault = function() {
	this.defaultPrevented = true;
};

Event.prototype.stopPropagation = function() {
	this.cancelBubble = true;
};
