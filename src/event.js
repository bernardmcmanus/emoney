import {
  $CANCEL_BUBBLE,
  $DEFAULT_PREVENTED,
  $PROTO
} from 'static/constants';
import { $_uts } from 'static/shared';


export default function Event( target , type ) {
  var that = this;
  that.target = target;
  that.type = type;
  that[$CANCEL_BUBBLE] = false;
  that[$DEFAULT_PREVENTED] = false;
  that.timeStamp = $_uts();
}


Event[$PROTO] = {

  preventDefault: function() {
    this[$DEFAULT_PREVENTED] = true;
  },

  stopPropagation: function() {
    this[$CANCEL_BUBBLE] = true;
  }
};



















