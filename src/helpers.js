export function $_isObject( subject ){
  return subject && typeof subject == 'object';
}

export function $_isFunction( subject ){
  return typeof subject == 'function';
}

export function $_toArray( subject ){
  return Array.prototype.slice.call( subject , 0 );
}

export function $_each( subject , cb ){
  if (Array.isArray( subject )) {
    for (var i = 0; i < subject.length; i++) {
      cb( subject[i] , i );
    }
  }
  else if ($_isObject( subject )) {
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
