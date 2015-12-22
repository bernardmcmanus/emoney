import { WILDCARD } from 'listener-manager';

export default class Event {
  constructor( target , type ){
    if (type == WILDCARD) {
      throw new Error( 'Invalid event type: ' + WILDCARD + '.' );
    }
    var that = this;
    that.target = target;
    that.type = type;
    that.cancelBubble = false;
    that.defaultPrevented = false;
    that.timeStamp = Date.now();
  }
  preventDefault(){
    this.defaultPrevented = true;
  }
  stopPropagation(){
    this.cancelBubble = true;
  }
}
