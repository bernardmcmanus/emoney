import { $_is } from 'static/shared';

export default function E$( seed ) {
  var that = this;
  if ($_is( that , E$ )) {
    that.__init( that , ( seed || {} ));
  }
  else {
    return new E$( seed );
  }
}



















