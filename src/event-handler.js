import { $_uts } from 'helpers';

export default function EventHandler( fn , bindArgs ){
  bindArgs = (bindArgs != UNDEFINED ? bindArgs : []);
  return {
    fn: fn,
    uts: $_uts(),
    invoke: function( evt , invokeArgs ){
      if (!evt.cancelBubble) {
        invokeArgs = (invokeArgs != UNDEFINED ? invokeArgs : []);
        fn.apply( UNDEFINED , [].concat( evt , bindArgs , invokeArgs ));
      }
    }
  };
}

/*export default class EventHandler {
  static invoke( fn , evt , bindArgs , invokeArgs ){
    fn.apply( UNDEFINED , [].concat( evt , bindArgs || [] , invokeArgs || [] ));
  }
  constructor( fn , bindArgs ){
    var that = this;
    that.fn = fn;
    that.uts = $_uts();
    that.bindArgs = bindArgs;
  }
  invoke( evt , invokeArgs ){
    if (!evt.cancelBubble) {
      EventHandler.invoke( this.fn , evt , this.bindArgs , invokeArgs );
    }
  }
}*/
