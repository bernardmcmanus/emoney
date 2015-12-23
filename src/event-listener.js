import { WILDCARD } from 'listener-manager';

export default function EventListener( types , fn , bindArgs ){
  types = [].concat( types );
  bindArgs = (bindArgs != UNDEFINED ? bindArgs : []);
  if (types.indexOf( WILDCARD ) >= 0 && types.length > 1) {
    throw new Error( 'Wildcard listeners cannot include other types.' );
  }
  this.fn = fn;
  this.types = types;
  this.invoke = function( evt , invokeArgs ){
    if (!evt.cancelBubble && (types[0] == WILDCARD || types.indexOf( evt.type ) >= 0)) {
      invokeArgs = (invokeArgs != UNDEFINED ? invokeArgs : []);
      fn.apply( UNDEFINED , [].concat( evt , bindArgs , invokeArgs ));
    }
  };
}
