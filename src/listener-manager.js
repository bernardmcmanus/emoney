import EventHandler from 'event-handler';
import {
  $_each,
  $_defineProperties
} from 'helpers';

export const WILDCARD = '*';

export default class ListenerManager {
  constructor(){
    var that = this;
    $_defineProperties( that , {
      keys: { get: function(){
        return Object.keys( that );
      }}
    });
  }
  /*_has( type ){
    return this.keys.indexOf( type ) >= 0;
  }*/
  add( type , fn , args ){
    var that = this,
      evtHandler = new EventHandler( fn , args ),
      handlerArray = that._get( type );
    handlerArray.push( evtHandler );
    that[type] = handlerArray;
  }
  _get( eventType , wild ){
    var that = this,
      subset = that;
    if (eventType) {
      subset = subset[eventType] || [];
      if (wild && eventType != WILDCARD) {
        subset = that._get( WILDCARD ).concat( subset ).sort(function( a , b ){
          return a.uts - b.uts;
        });
      }
    }
    return subset;
  }
  invoke( evt , args ){
    var handlerArray = this._get( evt.type , true );
    $_each( handlerArray , function( evtHandler ){
      evtHandler.invoke( evt , args );
    });
  }
  remove( type , fn , wild ){
    var that = this,
      handlerArray = that._get( type ),
      i = 0,
      index,
      evtHandler;
    while (i < handlerArray.length) {
      index = (fn ? indexOfHandler( handlerArray , fn ) : i);
      if (index >= 0 && (wild || type != WILDCARD)) {
        handlerArray.splice( index , 1 );
        i--;
      }
      i++;
    }
    if (!handlerArray.length) {
      delete that[type];
    }
    else {
      that[type] = handlerArray;
    }
  }
}

function indexOfHandler( handlerArray , fn ){
  var arr = handlerArray.map(function( evtHandler ){
    return evtHandler.fn;
  });
  return arr.indexOf( fn );
}
