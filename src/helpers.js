export function $_defineProperties( subject , descriptors ){
  $_each( descriptors , function( descriptor , key ){
    descriptor.configurable = true;
  });
  Object.defineProperties( subject , descriptors );
}

export function $_is( subject , test ){
  if (typeof test == 'string'){
    return typeof subject == test;
  }
  else if (test === Array){
    return Array.isArray( subject );
  }
  else if (test) {
    return subject.constructor === ($_is( test , 'function' ) ? test : test.constructor);
  }
  return subject === test;
}

export function $_toArray( subject ){
  return Array.prototype.slice.call( subject , 0 );
}

export function $_each( subject , cb ){
  if ($_is( subject , Array )) {
    for (var i = 0; i < subject.length; i++) {
      cb( subject[i] , i );
    }
  }
  else if ($_is( subject , 'object' )) {
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
