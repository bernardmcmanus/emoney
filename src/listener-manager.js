import EventHandler from 'event-handler';
import {
  $_each,
  // $_defineProperties
} from 'helpers';

export const WILDCARD = '*';

export default function ListenerManager(){
  Array.call( this );
}

ListenerManager.prototype = Object.create( Array.prototype );

ListenerManager.prototype.constructor = ListenerManager;

ListenerManager.prototype.add = function( type , fn , args ){
  this.push(
    new EventHandler( type , fn , args )
  );
};

ListenerManager.prototype.invoke = function( evt , args ){
  $_each( this , function( evtHandler ){
    if (evtHandler.type == evt.type || evtHandler.type == WILDCARD) {
      evtHandler.invoke( evt , args );
    }
  });
};

ListenerManager.prototype.remove = function( type , fn , wild ){
  var that = this,
    i = 0,
    len = that.length,
    evtHandler;
  while (i < len) {
    evtHandler = that[i];
    if ((wild || type == evtHandler.type || type == WILDCARD) && (!fn || evtHandler.fn == fn)) {
      that.splice( i , 1 );
      i--;
      len--;
    }
    i++;
  }
};


