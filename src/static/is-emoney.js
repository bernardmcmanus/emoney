import { $HANDLE_E$ , $OBJECT } from 'static/constants';
import { $_is } from 'static/shared';


export default function( subject ) {
  return subject && $_is( subject , $OBJECT ) && $HANDLE_E$ in subject;
}



















