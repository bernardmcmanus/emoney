export function isObject( subject ){
	return subject && typeof subject == 'object';
}

export function isFunction( subject ){
	return typeof subject == 'function';
}

export function toArray( subject ){
	return Array.prototype.slice.call( subject , 0 );
}

export function each( subject , cb ){
	if (Array.isArray( subject )) {
		for (var i = 0; i < subject.length; i++) {
			cb( subject[i] , i );
		}
	}
	else if (isObject( subject )) {
		for (var key in subject) {
			if (subject.hasOwnProperty( key )) {
				cb( subject[key] , key );
			}
		}
	}
	else if (subject) {
		cb( subject , 0 );
	}
}
