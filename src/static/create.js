import proto from 'proto';
import { $_create } from 'static/shared';


export default function( subjectProto ) {
  var extendedProto = $_create( proto );
  for (var key in subjectProto) {
    extendedProto[key] = subjectProto[key];
  }
  return extendedProto;
}



















