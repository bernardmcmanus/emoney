import {
  $CANCEL_BUBBLE,
  $DEFAULT_PREVENTED,
  $PROTO
} from 'static/constants';
import {
  $_uts,
  $_slice,
  $_ensureArray,
  $_ensureFunc
} from 'static/shared';


export default function EventHandler( func , context , bindArgs ) {

  var that = this;

  that.func = func;
  that.context = context;
  that.uts = $_uts();
  that.bindArgs = $_ensureArray( bindArgs );

  that._reset( that );
}

EventHandler[$PROTO] = {

  _reset: function( that ) {
    that.before = $_ensureFunc();
    that.after = $_ensureFunc();
  },

  invoke: function( evt , invArgs ) {

    var that = this;

    if (evt[$CANCEL_BUBBLE]) {
      return;
    }

    var func = that.func;
    var args = $_slice( that.bindArgs ).concat(
      $_ensureArray( invArgs )
    );

    args.unshift( evt );
    that.before( evt , func );
    func.apply( that.context , args );
    if (!evt[$DEFAULT_PREVENTED]) {
      that.after( evt , func );
    }

    that._reset( that );
  }

};



















