import { $HANDLE_E$ } from 'static/constants';
import {
  $_defineProperty,
  $_keys,
  $_ensureFunc
} from 'static/shared';


export default function( subject ) {

  $_defineProperty( subject , '__stack' , {
    value: []
  });

  $_defineProperty( subject , '__inprog' , {
    value: false,
    writable: true
  });

  $_defineProperty( subject , '__events' , {
    get: function() {
      return $_keys( subject.handlers );
    }
  });

  $_defineProperty( subject , 'handlers' , {
    value: {}
  });

  $_defineProperty( subject , $HANDLE_E$ , {
    value: $_ensureFunc( subject[ $HANDLE_E$ ] ).bind( subject )
  });
}



















