E$
==
> A lightweight event emitter for clients and servers.

[![travis-ci](https://travis-ci.org/bernardmcmanus/emoney.svg)](https://travis-ci.org/bernardmcmanus/emoney)

Overview
--------

> E$ can be used as a standalone constructor, or to extend prototypical objects.

```javascript
// Standalone
var emoney = E$({
  handleE$: function(){ ... }
});

// ES5
function E$Extended(){
  E$.call( this );
}
E$Extended.prototype = Object.create( E$.prototype );
E$Extended.prototype.handleE$ = function(){ ... };

// ES6
class E$Extended {
  constructor(){
    super();
  }
  handleE$(){ ... }
}
```

> E$ provides a clean way to interface with object instances.

```javascript
emoney
  .$when( 'loading' , function( e , pct ){
    console.log( 'loading... (%s%)' , pct );
  })
  .$when( 'ready' , function(){
    console.log( 'ready!' );
  })
  .$when( 'error' , function( e , err ){
    console.error( err.stack );
  });
```

> E$ instances can communicate via the `handleE$` method.

```javascript
var watcher = E$({
  handleE$: function( e , str , obj ){
    expect( str ).to.eql( 'awesome' );
    expect( obj ).to.eql({ rad: true });
  }
});
watcher.$watch( emitter );
emitter.$emit( 'gnarly' , [ 'awesome' , { rad: true }]);
```

> E$ can be used to create a DOM-like event tree.

```javascript
var called = false;

watcher2
  .$watch( watcher1 )
  .$when( 'gnarly' , function( e ){
    called = true;
  });

watcher1
  .$watch( emitter )
  .$when( 'gnarly' , function( e ){
    expect( e.target ).to.equal( emitter );
    e.stopPropagation();
  });

emitter.$emit( 'gnarly' , function(){
  expect( called ).to.be.false;
});
```

Methods
-------

### _`(static)`_ E$.is( subject ) &#8594; _`{boolean}`_

> Returns true if subject is E$-ish, false otherwise.

```javascript
var emoney = E$();
var emoneyIsh = new E$Extended();
var somethingElse = new SomethingElse();

emoney instanceof E$;     // true
E$.is( emoney );          // true

emoneyIsh instanceof E$;  // false
E$.is( emoneyIsh );       // true

E$.is( somethingElse );   // false
```

### .$when( events , args<sub>_opt_</sub> , handler<sub>_opt_</sub> ) &#8594; _`{instance}`_

> Adds an event listener.

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `events` | `string`<br>`array` | The event(s) to be handled. | __yes__ |
| `args` | `variant`<br>`array` | The argument(s) to be bound to the event handler. | no |
| `handler` | `function`<br>`E$` | The event handler.<br>If `E$.is( handler ) == true`, the event will be bound to `instance.handleE$`.<br>If `handler` is falsy, the event will be bound to `emoney.handleE$`. | no |

```javascript
// basic use
emoney.$when( 'gnarly' , function(){ ... });

// bind an argument to multiple events
emoney.$when([ 'gnarly' , 'rad' ] , 'arg' , function(){ ... });
```

### .$once( events , args<sub>_opt_</sub> , handler<sub>_opt_</sub> ) &#8594; _`{instance}`_

> Adds an event listener that is removed after the first time it is invoked.

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `events` | `string`<br>`array` | The event(s) to be handled. | __yes__ |
| `args` | `variant`<br>`array` | The argument(s) to be bound to the event handler. | no |
| `handler` | `function`<br>`E$` | The event handler. | no |

```javascript
// basic use
emoney.$once( 'gnarly' , function(){ ... });

// bind an argument to multiple events
emoney.$once([ 'gnarly' , 'rad' ] , 'arg' , function(){ ... });
```

### .$emit( events , args<sub>_opt_</sub> , callback<sub>_opt_</sub> ) &#8594; _`{instance}`_

> Emits an event.

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `events` | `string`<br>`array` | The event(s) to be emitted. | __yes__ |
| `args` | `variant`<br>`array` | The argument(s) to be passed to the event handler. | no |
| `callback` | `function` | A function to be executed at the end of the event chain (see [event behavior](#behavior)). | no |

```javascript
// basic use
emoney.$emit( 'gnarly' , function(){ ... });

// pass an argument to multiple event handlers
emoney.$emit([ 'gnarly' , 'rad' ] , 'arg' , function(){ ... });

// pass multiple arguments to an event handler
emoney.$emit( 'gnarly' , [ 'arg1' , 'arg2' ] , function(){ ... });
```

### .$dispel( events , wild<sub>_opt_</sub> , handler<sub>_opt_</sub> ) &#8594; _`{instance}`_

> Removes an event listener.

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `events` | `string`<br>`array`<br>`null` | The event(s) to be removed. | __yes__ |
| `wild` | `boolean` | A boolean value denoting whether handlers bound to the wildcard event should be removed. | no |
| `handler` | `function`<br>`E$` | The event handler. | no |

```javascript
// remove any gnarly listeners bound to handlerFn
emoney.$dispel( 'gnarly' , handlerFn );

// remove all gnarly or rad listeners bound to any handler
emoney.$dispel([ 'gnarly' , 'rad' ]);

// remove all listeners bound to handlerFn except wildcard listeners
emoney.$dispel( null , handlerFn );

// remove all listeners bound to handlerFn
emoney.$dispel( null , true , handlerFn );

// remove all listeners
emoney.$dispel( null , true );
```

### .$watch( emitters ) &#8594; _`{instance}`_

> Starts watching E$ instance(s).

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `emitters` | `E$`<br>`array` | The E$ instance(s) to watch. | __yes__ |

```javascript
// watch a single emitter
listener.$watch( emitter1 );

// watch multiple emitters
listener.$watch([ emitter1 , emitter2 ]);
```

### .$unwatch( emitters ) &#8594; _`{instance}`_

> Stops watching E$ instance(s).

| Parameter | Type | Description | Required |
| --------- | ---- | ----------- | -------- |
| `emitters` | `E$`<br>`array` | The E$ instance(s) to stop watching. | __yes__ |

```javascript
// stop watching a single emitter
listener.$unwatch( emitter1 );

// stop watching multiple emitters
listener.$unwatch([ emitter1 , emitter2 ]);
```

Events
------

### Properties

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `target` | `E$` | `n/a` | The event target. |
| `type` | `string` | `n/a` | The event type. |
| `defaultPrevented` | `boolean` | `false` | A flag denoting whether default was prevented. |
| `cancelBubble` | `boolean` | `false` | A flag denoting whether propagation was stopped. |
| `timeStamp` | `number` | `n/a` | The time at which the event was first triggered. |

### Methods

#### .preventDefault()

> Prevents the $emit callback from being executed.

```javascript
emoney
.$when( 'gnarly' , function( e ){
  e.preventDefault();
  console.log( 'handler1' );
})
.$when( 'gnarly' , function(){
  console.log( 'handler2' );
})
.$emit( 'gnarly' , function(){
  console.log( 'callback' );
});

/**
 * > 'handler1'
 * > 'handler2'
 */
```

#### .stopPropagation()

> Stops execution of the event chain and executes the emit callback.

```javascript
emoney
.$when( 'gnarly' , function( e ){
  e.stopPropagation();
  console.log( 'handler1' );
})
.$when( 'gnarly' , function(){
  console.log( 'handler2' );
})
.$emit( 'gnarly' , function(){
  console.log( 'callback' );
});

/**
 * > 'handler1'
 * > 'callback'
 */
```

### Behavior
![normal execution](doc/E$_execution-normal.png "normal")

![defaultPrevented](doc/E$_execution-preventDefault.png "e.preventDefault")

![cancelBubble](doc/E$_execution-stopPropagation.png "e.stopPropagation")

Build & Test
------------

    npm i && npm run build
