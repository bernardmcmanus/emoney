import E$ from 'main';
import proto from 'proto';
import construct from 'static/construct';
import create from 'static/create';
import isE$ from 'static/is-emoney';
import { $PROTO } from 'static/constants';

E$[$PROTO] = proto;
E$.is = isE$;
E$.create = create;
E$.construct = construct;

export default E$;