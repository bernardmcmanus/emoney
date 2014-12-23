import {
  $Date,
  $Math,
  $Array,
  $Object,
  $HANDLE_E$,
  $PROTO,
  $FUNCTION,
  $STRING,
  $UNDEFINED
} from 'static/constants';

export function $_uts() {
  var now = $Date.now();
  var last = $_uts.last;
  var inc = 0.001;
  last = (now === $Math.floor( last ) ? last : now) + inc;
  $_uts.last = last;
  return last;
}

export function $_length( subject ) {
  return subject.length;
}

export function $_indexOf( subject , element ) {
  return subject.indexOf( element );
}

export function $_isArray( subject ) {
  return $Array.isArray( subject );
}

export function $_ensureArray( subject ) {
  return ($_isArray( subject ) ? subject : ( subject !== $UNDEFINED ? [ subject ] : [] ));
}

export function $_forEach( subject , callback ) {
  return $_ensureArray( subject ).forEach( callback );
}

export function $_create( subject ) {
  return $Object.create( subject );
}

export function $_defineProperty( subject , property , descriptor ) {
  $Object.defineProperty( subject , property , descriptor );
}

export function $_delete( subject , key ) {
  delete subject[key];
}

export function $_keys( subject ) {
  return $Object.keys( subject );
}

export function $_shift( subject ) {
  return $Array[$PROTO].shift.call( subject );
}

export function $_pop( subject ) {
  return $Array[$PROTO].pop.call( subject );
}

export function $_slice( subject , start , end ) {
  return $Array[$PROTO].slice.call( subject , start || 0 , end );
}

export function $_last( subject ) {
  return subject[$_length( subject ) - 1];
}

export function $_is( subject , test ) {
  return (typeof test == $STRING) ? (typeof subject == test) : (subject instanceof test);
}

/*export function $_has( subject , key ) {
  return subject.hasOwnProperty( key );
}*/

export function $_ensureFunc( subject ) {
  return $_is( subject , $FUNCTION ) ? subject : function(){};
}

export function $_defineProto( proto ) {
  var nonEnumerableProto = {};
  for (var key in proto) {
    $_defineProperty( nonEnumerableProto , key , {
      value: proto[key]
    });
  }
  return nonEnumerableProto;
}

export function $_getHandlerFunc( subject ) {
  return (subject || {})[ $HANDLE_E$ ] ? subject[ $HANDLE_E$ ] : subject;
}

export function $_getHandlerContext( handler , func ) {
  return handler === func ? null : handler;
}



















