(function(){
  'use strict';

  var util = require( 'util' );
  var chai = require( 'chai' );
  var expect = chai.expect;

  global.log = function(){
    var args = args = Array.prototype.map.call( arguments , function( arg ) {
      return util.inspect( arg , { depth: null, showHidden: true, colors: true });
    });
    console.log.apply( null , args );
  };

  var E$ = require( '../compiled/emoney.js' );
  var imports = require( './imports.compiled.js' );

  var SEED = { name: 'emoney' };
  function Test(){}
  function Test2(){}
  function Test3(){}

  function Gnarly(){
    E$.call( this );
  }
  Gnarly.prototype = Object.create( E$.prototype );
  Gnarly.prototype.tubes = function(){};
  Gnarly.prototype.handleE$ = function(){};

  var emoney = E$( SEED );

  describe( '#constructor' , function(){
    it( 'should create a new E$ instance' , function(){
      expect( emoney ).to.be.an.instanceOf( E$ );
    });
    it( 'should should define properties that are configurable' , function(){
      E$.call( emoney );
    });
    it( 'should be extendable' , function(){
      var gnarly = new Gnarly();
      for (var key in E$.prototype) {
        if (key === 'handleE$') {
          expect( Gnarly.prototype[key] ).to.not.equal( E$.prototype[key] );
        }
        else {
          expect( Gnarly.prototype[key] ).to.equal( E$.prototype[key] );
        }
      }
      expect( Gnarly.prototype ).to.include.keys( 'tubes' );
      expect( Gnarly.prototype ).to.include.keys( 'handleE$' );
      expect( gnarly.tubes ).to.be.a( 'function' );
      expect( gnarly.handleE$ ).to.be.a( 'function' );
      expect( gnarly.$__listeners ).to.be.an( 'object' );
      expect( gnarly.handleE$ ).to.not.equal( Gnarly.prototype.handleE$ );
    });
    it( 'should be compatible with ES2015 classes' , function(){
      var emoneyExtended = new imports.E$Extended(),
        gotCalls = 0,
        cb = function(){ gotCalls++ };
      expect( emoneyExtended ).to.be.an.instanceOf( imports.E$ );
      expect(E$.is( emoneyExtended )).to.be.true;
      emoneyExtended
        .$when( 'asdf' )
        .$emit( 'asdf' , [ cb ])
        .$dispel( 'asdf' )
        .$emit( 'asdf' , [ cb ]);
      emoneyExtended
        .$once( 'asdf' )
        .$emit( 'asdf' , [ cb ])
        .$emit( 'asdf' , [ cb ]);
      expect( gotCalls ).to.equal( 2 );
    });
  });

  describe( '#$when' , function(){
    it( 'should add an event listener' , function(){
      emoney.$when( 'gnarly' , Test );
      expect( emoney.$__listeners[0].fn ).to.equal( Test );
      expect( emoney.$__listeners[0].types ).to.include( 'gnarly' );
      expect( emoney.$__listeners ).to.have.length( 1 );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should use subject.handleE$ when listener is falsy' , function(){
      emoney.$when( 'rad' );
      expect( emoney.$__listeners[0].fn ).to.equal( emoney.handleE$ );
      expect( emoney.$__listeners[0].types ).to.include( 'rad' );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should use proper context when calling subject.handleE$' , function(){
      var emoney = E$({
        handleE$: function(){
          expect( this ).to.equal( emoney );
        }
      });
      emoney
        .$when( 'asdf' )
        .$emit( 'asdf' );
    });
    it( 'should bind args to each event listener' , function(){
      var arr = [];
      for (var i = 0; i < 10; i++) { arr.push( i ) }
      arr.forEach(function( i ) {
        emoney.$when( 'rad' , [ i , 'test-' + i ] , function( e , n , test ){
          expect( n ).to.equal( i );
          expect( test ).to.equal( 'test-' + i );
        });
      });
      emoney.$emit( 'rad' );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should add a wildcard listener when event is falsy' , function(){
      emoney.$when();
      expect( emoney.$__listeners[0].fn ).to.equal( emoney.handleE$ );
      expect( emoney.$__listeners[0].types ).to.include( imports.WILDCARD );
      emoney.$dispel( null , true );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should handle errors thrown in listener functions' , function(){
      emoney.$when( 'asdf' , function(){
        throw new Error( 'test' );
      });
      expect(function(){
        emoney.$emit( 'asdf' );
      })
      .to.throw( /test/i );
      emoney.$dispel( 'asdf' );
    });
  });

  describe( '#$once' , function(){
    it( 'should remove an event listener after it is executed' , function(){
      emoney.$once( 'gnarly' , function fn(){
        expect( emoney.$__listeners[0].types ).to.include( 'gnarly' );
      });
      emoney.$emit( 'gnarly' );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should only be executed for one event type in eventList' , function(){
      var eventList = [ 'gnarly' , 'rad' ];
      var result;
      emoney.$once( eventList , function( e ){
        result = e.type;
        expect( emoney.$__listeners[0].types ).to.eql( eventList );
      });
      emoney.$emit( eventList[0] );
      expect( result ).to.eql( eventList[0] );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should bind args to each event listener' , function(){
      var arr = [];
      for (var i = 0; i < 10; i++) { arr.push( i ) }
      arr.forEach(function( i ) {
        emoney.$once( 'rad' , [ i , 'test-' + i ] , function( e , n , test ){
          expect( n ).to.equal( i );
          expect( test ).to.equal( 'test-' + i );
        });
      });
      emoney.$emit( 'rad' );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should remove the wildcard listener after an $emit' , function(){
      var events = [ 'gnarly' , 'rad' ];
      var emitted;
      emoney.$once( imports.WILDCARD , function( e ){
        emitted = e.type;
      });
      emoney.$emit( events[1] );
      expect( emoney.$__listeners ).to.have.length( 0 );
      emoney.$emit( events[0] );
      expect( emitted ).to.eql( events[1] );
    });
  });

  describe( '#$emit' , function(){
    var events = [ 'gnarly' , 'rad' ];
    it( 'should always execute listeners and callbacks by default' , function(){
      var arr = [];
      emoney.$once( events , function( e ){
        arr.push( e.type );
      })
      .$once( events , function( e ){
        arr.push( e.type );
      })
      .$emit( events , function( e ){
        arr.push( e.type );
      });
      expect( arr ).to.have.length( 4 );
      expect( arr ).to.eql([ events[0] , events[0] , events[0] , events[1] ]);
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should execute listeners but NOT callbacks if default is prevented' , function(){
      var arr = [];
      emoney.$once( events , function( e ){
        expect( e.defaultPrevented ).to.equal( false );
        arr.push( e.type );
      })
      .$once( events , function( e ){
        e.preventDefault();
        arr.push( e.type );
        expect( e.defaultPrevented ).to.equal( true );
      })
      .$emit( events , function( e ){
        arr.push( e.type );
        expect( e.defaultPrevented ).to.equal( false );
      });
      expect( arr ).to.have.length( 3 );
      expect( arr ).to.eql([ events[0] , events[0] , events[1] ]);
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should stop execution if propagation is stopped' , function(){
      var arr = [];
      emoney.$once( events , function( e ){
        e.stopPropagation();
        expect( e.type ).to.equal( events[0] );
        expect( e.cancelBubble ).to.equal( true );
        arr.push( e.type );
      })
      .$once( events , function( e ){
        expect( e.type ).to.equal( events[1] );
        expect( e.cancelBubble ).to.equal( false );
        arr.push( e.type );
      })
      .$emit( events , function( e ){
        expect( e.cancelBubble ).to.equal( e.type == events[0] );
        arr.push( e.type );
      });
      expect( arr ).to.have.length( 4 );
      expect( arr ).to.eql([ events[0] , events[0] , events[1] , events[1] ]);
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should always execute wildcard listeners' , function(){
      var events = [ 'gnarly' , 'rad' ], emitted = [];
      emoney.$when( imports.WILDCARD , function( e ){
        emitted.push( e.type );
      });
      emoney.$emit( events );
      expect( emitted ).to.eql( events );
      emoney.$dispel( null , true );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should not explicitly emit wildcard events' , function(){
      var emitted = [];
      emoney.$when( imports.WILDCARD , function( e ){
        emitted.push( e.type );
      });
      emoney.$emit();
      expect(function(){
        emoney.$emit( imports.WILDCARD );
      })
      .to.throw( /invalid/i );
      expect( emitted.length ).to.equal( 0 );
      emoney.$dispel( null , true );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should not call handleE$ if emit callback is falsy' , function(){
      var gotCalls = 0,
        emoney = E$({
          handleE$: function(){
            gotCalls++;
          }
        })
        .$when( 'emoney' )
        .$emit( 'emoney' )
        .$dispel( 'emoney' );
      expect( gotCalls ).to.equal( 1 );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should pass arguments to the emit callback' , function(){
      emoney
        .$once( 'gnarly' , { isGnarly: false } , function( e , data1 , data2 ){
          expect( e.type ).to.equal( 'gnarly' );
          expect( data1.isGnarly ).to.equal( false );
          expect( data2.isGnarly ).to.equal( true );
        })
        .$emit( 'gnarly' , { isGnarly: true } , function( e , data ){
          expect( e.type ).to.equal( 'gnarly' );
          expect( data.isGnarly ).to.equal( true );
        });
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should enqueue the emit callback' , function(){
      var e1 = E$(),
        e2 = E$(),
        actual = [],
        expected = [ 0 , 1 , 2 , 3 ];
      e1
        .$when( 'e1' , function(){
          e2
            .$when( 'e2' , function(){
              actual.push( actual.length );
            })
            .$when( 'e2' , function(){
              actual.push( actual.length );
            })
            .$emit( 'e2' , function(){
              expect( actual ).to.eql( expected );
            });
          actual.push( actual.length );
        })
        .$when( 'e1' , function(){
          actual.push( actual.length );
        })
        .$emit( 'e1' , function(){
          expect( actual ).to.eql( expected );
        });
    });
  });

  describe( '#$dispel' , function(){
    before(function(){
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should remove an event listener' , function(){
      emoney.$when( 'gnarly' , Test );
      expect( emoney.$__listeners ).to.have.length( 1 );
      emoney.$dispel( 'gnarly' , Test );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should remove all event listeners if no arguments are passed' , function(){
      emoney
        .$when( 'gnarly' , Test )
        .$when( 'rad' , Test )
        .$when([ 'gnarly' , 'rad' ], Test );
      expect( emoney.$__listeners ).to.have.length( 3 );
      expect( emoney.$__listeners[0].types ).to.include( 'gnarly' );
      expect( emoney.$__listeners[0].fn ).to.equal( Test );
      expect( emoney.$__listeners[1].types ).to.include( 'rad' );
      expect( emoney.$__listeners[1].fn ).to.equal( Test );
      expect( emoney.$__listeners[2].types ).to.eql([ 'gnarly' , 'rad' ]);
      expect( emoney.$__listeners[2].fn ).to.equal( Test );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should remove all listeners matched by func when event type is falsy' , function(){
      emoney
        .$when([ 'gnarly' , 'rad' ] , Test )
        .$when([ 'gnarly' , 'rad' ] , Test2 );
      expect( emoney.$__listeners ).to.have.length( 2 );
      emoney.$dispel( null , Test );
      expect( emoney.$__listeners ).to.have.length( 1 );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should not remove wildcard listeners if wild is falsy' , function(){
      emoney.$when( imports.WILDCARD );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 1 );
    });
    it( 'should remove wildcard listeners if wild is truthy' , function(){
      emoney.$dispel( null , true );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
  });

  describe( '#$watch' , function(){
    it( 'should listen to any events emitted by subject' , function(){
      var events = [ 'gnarly' , 'rad' ];
      var emitted = {
        emitter1: [],
        emitter2: [],
        emitter3: []
      };

      var emitter1 = E$({ name: 'emitter1' });
      var emitter2 = E$({ name: 'emitter2' });
      var emitter3 = E$({ name: 'emitter3' });

      var watcher = E$({
        name: 'watcher',
        handleE$: function( e ){
          emitted[e.target.name].push( e.type );
        }
      });
      
      watcher.$watch([ emitter1 , emitter2 , emitter3 ]);

      [ emitter1 , emitter2 , emitter3 ].forEach(function( emitter ){
        emitter.$emit( events );
      });

      Object.keys( emitted ).forEach(function( key ) {
        var evts = emitted[key];
        expect( evts ).to.eql( events );
      });
    });
    it( 'should accept an array or a single emitter' , function(){
      var events = [ 'gnarly' , 'rad' ],
        emitted = [],
        emitter = E$({ name: 'emitter' }),
        watcher = E$({
          handleE$: function( e ){
            emitted.push( e.type );
          }
        })
        .$watch( emitter );
      emitter.$emit( events );
      expect( emitted ).to.eql( events );
    });
    it( 'should execute function listeners' , function(){
      var gotEvents = [],
        gotArgs = [],
        emitter = E$({ name: 'emitter' }),
        watcher = E$({
          handleE$: function( e , data ){
            gotEvents.push( e.type );
            gotArgs.push( data.isGnarly );
          }
        })
        .$when( 'asdf' , function( e , data ){
          gotEvents.push( e.type );
          gotArgs.push( data.isGnarly );
        })
        .$watch( emitter );
      emitter.$emit( 'asdf' , { isGnarly: true });
      watcher.$unwatch( emitter );
      emitter.$emit( 'asdf' , { isGnarly: true });
      expect( gotEvents ).to.have.length( 2 );
      expect( gotEvents ).to.eql([ 'asdf' , 'asdf' ]);
      expect( gotArgs ).to.eql([ true , true ]);
    });
    it( 'should allow for event chaining' , function(){
      var emitter = E$({ name: 'emitter' }),
        watcher1 = E$({ name: 'watcher1' }),
        watcher2 = E$({
          name: 'watcher2',
          handleE$: check
        });
      function check( e , data ){
        expect( arguments ).to.have.length( 2 );
        expect( e.type ).to.equal( 'something' );
        expect( data.isGnarly ).to.equal( true );
        expect( e.target ).to.equal( emitter );
      }
      watcher2
        .$watch( watcher1 )
        .$when( 'something' , check );
      watcher1.$watch( emitter );
      emitter.$emit( 'something' , { isGnarly: true });
    });
    it( 'should honor event.cancelBubble' , function(){
      var emitter = E$({ name: 'emitter' }),
        watcher1 = E$({ name: 'watcher1' }),
        watcher2 = E$({ name: 'watcher2' }),
        watcher3 = E$({ name: 'watcher3' }),
        gotCalls = 0;
      watcher3
        .$when( 'something' , function(){
          gotCalls++;
        })
        .$watch( watcher2 );
      watcher2
        .$when( 'something' , function( e ){
          gotCalls++;
          e.stopPropagation();
        })
        .$watch( watcher1 );
      watcher1
        .$when( 'something' , function( e ){
          gotCalls++;
        })
        .$watch( emitter );
      emitter.$emit( 'something' , function(){
        expect( gotCalls ).to.equal( 2 );
      });
    });
  });

  describe( '#$unwatch' , function(){
    it( 'should stop watching any events emitted by subject' , function(){
      var emitter1 = E$({ name: 'emitter1' });
      var emitter2 = E$({ name: 'emitter2' });
      var emitter3 = E$({ name: 'emitter3' });
      var watcher = E$({ name: 'watcher' });
      watcher.$watch([ emitter1 , emitter2 , emitter3 ]);
      watcher.$unwatch([ emitter1 , emitter2 , emitter3 ]);
      [
        emitter1,
        emitter2,
        emitter3
      ]
      .forEach(function( emitter ) {
        expect( emitter.$__listeners ).to.have.length( 0 );
      });
    });
  });

  describe( '::is' , function(){
    it( 'should return true for an E$ instance' , function(){
      expect( E$.is( emoney )).to.equal( true );
    });
    it( 'should return true for an E$ish instance' , function(){
      var gnarly = new Gnarly();
      expect( E$.is( gnarly )).to.equal( true );
    });
    it( 'should return false otherwise' , function(){
      expect(E$.is( {} )).to.equal( false );
      expect(E$.is( [] )).to.equal( false );
      expect(E$.is()).to.equal( false );
    });
  });

  describe( 'EventListener' , function(){
    describe( '#constructor' , function(){
      it( 'should throw an error when called with an array containing wildcard along with other events' , function(){
        expect(function(){
          new imports.EventListener([ imports.WILDCARD , 'asdf' ]);
        })
        .to.throw( /wildcard/i );
      });
    });
    describe( '#invoke' , function(){
      it( 'args should be unique to each event occurrence' , function(){
        var called = 0,
          count = 10,
          evt = new imports.Event( emoney , 'asdf' ),
          evtListener = new imports.EventListener( 'asdf' , listenerFunc );
        function listenerFunc( e ){
          expect( this ).to.be.undefined;
          expect( e.target ).to.equal( emoney );
          expect( arguments.length ).to.equal( 1 );
          called++;
        }
        for (var i = 0; i < count; i++) {
          evtListener.invoke( evt );
        }
        expect( called ).to.equal( count );
      });
      it( 'should not execute instance.fn when invoked with an event not in the types array' , function(){
        var called = 0,
          evt = new imports.Event( emoney , 'asdf' ),
          evtListener = new imports.EventListener( 'jkl;' , function(){
            called++;
          });
        evtListener.invoke( evt );
        expect( called ).to.equal( 0 );
      });
    });
  });

  describe( 'ListenerManager' , function(){
    var listeners = new imports.ListenerManager();
    describe( '#add' , function(){
      it( 'should push a new EventListener' , function(){
        listeners.add( 'gnarly' , Test );
        expect( listeners ).to.have.length( 1 );
        expect( listeners[0].types ).to.have.length( 1 );
        expect( listeners[0].types ).to.include( 'gnarly' );
      });
      it( 'should accept an array of types' , function(){
        listeners.add([ 'gnarly' , 'rad' ], Test );
        expect( listeners ).to.have.length( 2 );
        expect( listeners[1].types ).to.have.length( 2 );
        expect( listeners[1].types ).to.include( 'gnarly' );
        expect( listeners[1].types ).to.include( 'rad' );
        listeners.remove( 'gnarly' );
        expect( listeners ).to.have.length( 1 );
        listeners.remove( 'rad' );
        expect( listeners ).to.have.length( 0 );
      });
    });
    describe( '#invoke' , function(){
      it( 'should invoke event listeners in the type array' , function( done ){
        listeners.add( 'rad' , function once( e , test1 , test2 ){
          expect( e ).to.be.an.instanceOf( imports.Event );
          expect( e.target ).to.equal( listeners );
          expect( test1 ).to.equal( true );
          expect( test2 ).to.equal( false );
          listeners.remove( e.type , once );
          done();
        });
        var evt = new imports.Event( listeners , 'rad' );
        listeners.invoke( evt , [ true , false ]);
      });
      it( 'should only invoke listeners matching type' , function(){
        var called = 0,
          evt = new imports.Event( listeners , 'abc' );
        listeners.add( 'abc' , function() {
          called++;
        });
        listeners.add( 'def' , function() {
          called++;
        });
        listeners.add( imports.WILDCARD , function() {
          called++;
        });
        listeners.invoke( evt );
        expect( called ).to.equal( 2 );
        listeners.remove( 'abc' );
        listeners.remove( 'def' );
        listeners.remove( imports.WILDCARD , null , true );
      });
    });
    describe( '#remove' , function(){
      it( 'should remove all matched listeners' , function(){
        listeners.add( 'gnarly' , Test );
        listeners.add( 'gnarly' , Test2 );
        listeners.add( 'gnarly' , Test3 );
        listeners.add( 'gnarly' , Test );
        expect( listeners ).to.have.length( 4 );
        listeners.remove( 'gnarly' , Test );
        expect( listeners ).to.have.length( 2 );
        listeners.remove( 'gnarly' , Test2 );
        listeners.remove( 'gnarly' , Test3 );
        expect( listeners ).to.have.length( 0 );
      });
      it( 'should remove only listeners matched by event type and listener function' , function(){
        listeners.add( 'gnarly' , Test );
        listeners.add( 'gnarly' , Test2 );
        listeners.add( 'rad' , Test );
        listeners.add( 'rad' , Test2 );
        expect( listeners ).to.have.length( 4 );
        listeners.remove( 'gnarly' , Test );
        listeners.remove( 'rad' , Test );
        expect( listeners ).to.have.length( 2 );
        listeners.remove( 'gnarly' , Test2 );
        listeners.remove( 'rad' , Test2 );
        expect( listeners ).to.have.length( 0 );
      });
      it( 'should remove all non-wildcard listeners when type is wildcard and wild is falsy' , function(){
        var called = 0,
          evt = new imports.Event( listeners , 'asdf' ),
          handle = function(){ called++ };

        listeners.add( 'asdf' , handle );
        expect( listeners ).to.have.length( 1 );
        listeners.remove( imports.WILDCARD , handle );
        listeners.invoke( evt );
        expect( listeners ).to.have.length( 0 );
        expect( called ).to.equal( 0 );

        listeners.add( 'asdf' , handle );
        expect( listeners ).to.have.length( 1 );
        listeners.remove( imports.WILDCARD );
        listeners.invoke( evt );
        expect( listeners ).to.have.length( 0 );
        expect( called ).to.equal( 0 );
      });
      it( 'should not remove wildcard listeners unless wild is true' , function(){
        var called = 0,
          evt = new imports.Event( listeners , 'asdf' ),
          handle = function(){ called++ };

        listeners.add( imports.WILDCARD , handle );
        expect( listeners ).to.have.length( 1 );
        listeners.invoke( evt );
        expect( called ).to.equal( 1 );

        listeners.remove( imports.WILDCARD , handle );
        expect( listeners ).to.have.length( 1 );
        listeners.invoke( evt );
        expect( called ).to.equal( 2 );

        listeners.remove( imports.WILDCARD , handle , true );
        expect( listeners ).to.have.length( 0 );
        listeners.invoke( evt );
        expect( called ).to.equal( 2 );
      });
    });
  });

  describe( 'Stack' , function(){
    var stack = imports.stack;
    describe( '#enqueue' , function(){
      it( 'should push a function to stack' , function( done ){
        stack.enqueue( done );
        expect( stack ).to.have.length( 1 );
        stack.flush();
      });
    });
    describe( '#flush' , function(){
      it( 'should be synchronous' , function(){
        stack.enqueue(function(){});
        stack.flush();
        expect( stack ).to.have.length( 0 );
      });
      it( 'should execute enqueued functions in the proper order' , function( done ){
        var adapter = (function(){
          var acceptedFlushCalls = 0;
          return {
            get acceptedFlushCalls(){
              return acceptedFlushCalls;
            },
            ready: function(){
              return stack.length > 0 && !stack.inprog;
            },
            enqueue: function( fn ){
              stack.enqueue( fn );
            },
            flush: function(){
              if (adapter.ready()) {
                acceptedFlushCalls++;
              }
              stack.flush();
            }
          };
        }());

        var ranges = [[ 0 , 10 ],[ 10 , 20 ],[ 20 , 30 ]],
          subsets = ranges.map(function( range ){
            var subset = [];
            for (var i = range[0]; i < range[1]; i++) {
              subset.push( i );
            }
            return subset;
          }),
          expected = subsets.reduce(function( arr , subset ){
            return arr.concat( subset );
          },[]),
          actual = [],
          isLast = function( index ){
            return index == ranges[0][1] - 1;
          },
          enqueuePush = function( index ){
            adapter.enqueue(function(){
              adapter.enqueue(function(){
                adapter.enqueue(function(){
                  actual.push( subsets[2][index] );
                  if (isLast( index )) {
                    afterAllPushes();
                  }
                });
                actual.push( subsets[1][index] );
              });
              actual.push( subsets[0][index] );
              adapter.flush();
            });
            if (isLast( index )) {
              adapter.flush();
            }
          },
          afterAllPushes = function(){
            expect( adapter.acceptedFlushCalls ).to.eql( 1 );
            expect( actual ).to.eql( expected );
            done();
          };

        for (var i = ranges[0][0]; i < ranges[0][1]; i++) {
          enqueuePush( i );
        }
      });
      it( 'should clear the stack when an error is encountered' , function(){
        var count = 5;
        for (var i = 0; i < count; i++) {
          (function( i ) {
            stack.enqueue(function(){
              if (i < 4 && i > 1) {
                throw new Error( 'test error ' + i );
              }
            });
          }( i ));
        }
        expect( stack ).to.have.length( count );
        expect(function(){ stack.flush() }).to.throw( /test error 2/ );
        expect( stack ).to.have.length( 0 );
        expect(Object.keys( stack )).to.have.length( 0 );
      });
    });
  });
}());
