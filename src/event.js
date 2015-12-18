import { $_uts } from 'helpers';

export default class Event {
  constructor( target , type ){
    var that = this;
    that.target = target;
    that.type = type;
    that.cancelBubble = false;
    that.defaultPrevented = false;
    that.timeStamp = $_uts();
  }
  preventDefault(){
    this.defaultPrevented = true;
  }
  stopPropagation(){
    this.cancelBubble = true;
  }
}
