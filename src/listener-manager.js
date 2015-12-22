import Stack from 'stack';
import EventHandler from 'event-handler';
import { $_each } from 'helpers';

export const WILDCARD = '*';

export default function ListenerManager(){
  Array.call( this );
  this.stack = new Stack();
}

ListenerManager.prototype = Object.create( Array.prototype );

ListenerManager.prototype.constructor = ListenerManager;

ListenerManager.prototype._enqueue = function( fn ){
  var stack = this.stack;
  stack.enqueue( fn );
  stack.flush();
};

ListenerManager.prototype.add = function( types , fn , args ){
  var that = this;
  that._enqueue(function(){
    that.push(
      new EventHandler( types , fn , args )
    );
  });
};

ListenerManager.prototype.invoke = function( evt , args ){
  var that = this;
  that._enqueue(function(){
    that.forEach(function( evtHandler ){
      evtHandler.invoke( evt , args );
    });
  });
};

ListenerManager.prototype.remove = function( removeTypes , fn , wild ){
  var that = this;
  removeTypes = [].concat( removeTypes );
  that._enqueue(function(){
    $_each( removeTypes , function( removeType ){
      var len = that.length,
        i = 0,
        evtHandler,
        handleTypes,
        index;
      while (i < len) {
        evtHandler = that[i];
        if (!fn || evtHandler.fn == fn) {
          handleTypes = evtHandler.types;
          index = handleTypes.indexOf( removeType );
          if (index >= 0 && removeType != WILDCARD) {
            handleTypes.splice( index , 1 );
          }
          if (handleTypes.length < 1 || (removeType == WILDCARD && (wild || index < 0))) {
            that.splice( i , 1 );
            i--;
            len--;
          }
        }
        i++;
      }
    });
  });
};
