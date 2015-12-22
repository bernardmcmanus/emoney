(function(){
  'use strict';

  var path = require( 'path' );
  var fs = require( 'fs-extra' );
  var util = require( 'util' );
  var chai = require( 'chai' );
  var expect = chai.expect;

  global.log = function(){
    var args = args = Array.prototype.map.call( arguments , function( arg ) {
      return util.inspect( arg , { depth: null, showHidden: true, colors: true });
    });
    console.log.apply( null , args );
  };

  var E$ = require(path.resolve( __dirname , '..' , 'compiled/emoney.js' ));
  var TestModules = require( './testModules.compiled.js' );

  var SEED = { name: 'emoney' };
  function Test(){}
  function Test2(){}
  function Test3(){}

  function Gnarly(){
    E$.construct( this );
  }

  Gnarly.prototype = E$.create({
    tubes: function(){},
    handleE$: function(){}
  });

  var emoney = E$( SEED );

  describe( '#constructor' , function(){
    it( 'should create a new E$ instance' , function(){
      expect( emoney ).to.be.an.instanceOf( E$ );
    });
    it( 'should should define properties that are configurable' , function(){
      E$.call( emoney );
    });
  });

  describe( '#$when' , function(){
    it( 'should add an event handler' , function(){
      emoney.$when( 'gnarly' , Test );
      expect( emoney.$__listeners[0].fn ).to.equal( Test );
      expect( emoney.$__listeners[0].type ).to.equal( 'gnarly' );
      expect( emoney.$__listeners ).to.have.length( 1 );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should use subject.handleE$ when handler is falsy' , function(){
      emoney.$when( 'rad' );
      expect( emoney.$__listeners[0].fn ).to.equal( emoney.handleE$ );
      expect( emoney.$__listeners[0].type ).to.equal( 'rad' );
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
    it( 'should bind args to each event handler' , function(){
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
    it( 'should add a wildcard handler when event is falsy' , function(){
      emoney.$when();
      expect( emoney.$__listeners[0].fn ).to.equal( emoney.handleE$ );
      expect( emoney.$__listeners[0].type ).to.equal( TestModules.WILDCARD );
      emoney.$dispel( null , true );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
  });

  describe( '#$once' , function(){
    it( 'should remove an event handler after it is executed' , function(){
      emoney.$once( 'gnarly' , function fn(){
        expect( emoney.$__listeners[0].type ).to.equal( 'gnarly' );
      });
      emoney.$emit( 'gnarly' );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should only be executed for one event type in eventList' , function(){
      var eventList = [ 'gnarly' , 'rad' ];
      var result;
      emoney.$once( eventList , function( e ){
        result = e.type;
        eventList.forEach(function( type , i ){
          expect( emoney.$__listeners[i].type ).to.equal( type );
        });
      });
      emoney.$emit( eventList[0] );
      expect( result ).to.eql( eventList[0] );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should bind args to each event handler' , function(){
      var arr = [];
      for (var i = 0; i < 10; i++) { arr.push( i ) }
      arr.forEach(function( i ) {
        emoney.$once( 'rad' , [ i , 'test-' + i ] , function( e , n , test ){
          expect( n ).to.equal( i );
          expect( test ).to.equal( 'test-' + i );
        });
      });
      emoney.$emit( 'rad' );
    });
    it( 'should remove the wildcard handler after an $emit' , function(){
      var events = [ 'gnarly' , 'rad' ];
      var emitted;
      emoney.$once( TestModules.WILDCARD , function( e ){
        emitted = e.type;
      });
      emoney.$emit( events[1] );
      emoney.$emit( events[0] );
      expect( emitted ).to.eql( events[1] );
    });
  });

  describe( '#$emit' , function(){
    var events = [ 'gnarly' , 'rad' ];
    it( 'should always execute handlers and callbacks by default' , function(){
      var arr = [];
      emoney.$once( events , function( e ){
        expect( events ).to.contain( e.type );
        arr.push( e.type );
      })
      .$once( events , function( e ){
        expect( events ).to.contain( e.type );
        arr.push( e.type );
      })
      .$emit( events , function( e ){
        arr.push( e.type );
        expect( e.defaultPrevented ).to.equal( false );
      });
      expect( arr.length ).to.equal( events.length * 3 );
    });
    it( 'should execute handlers but NOT callbacks if default is prevented' , function(){
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
      expect( arr.length ).to.equal( events.length * 2 );
    });
    it( 'should stop execution if propagation is stopped' , function(){
      var arr = [];
      emoney.$once( events , function( e ){
        e.stopPropagation();
        expect( e.cancelBubble ).to.equal( true );
        arr.push( e.type );
      })
      .$once( events , function( e ){
        arr.push( e.type );
        expect( false ).to.equal( true );
      })
      .$emit( events , function( e ){
        expect( e.cancelBubble ).to.equal( true );
        arr.push( e.type );
      });
      expect( arr.length ).to.equal( events.length * 2 );
      emoney.$dispel();
    });
    it( 'should always execute wildcard handlers' , function(){
      var events = [ 'gnarly' , 'rad' ], emitted = [];
      emoney.$when( TestModules.WILDCARD , function( e ){
        emitted.push( e.type );
      });
      emoney.$emit( events );
      expect( emitted ).to.eql( events );
      emoney.$dispel( null , true );
    });
    it( 'should not explicitly emit wildcard events' , function(){
      var emitted = [];
      emoney.$when( TestModules.WILDCARD , function( e ){
        emitted.push( e.type );
      });
      emoney.$emit();
      emoney.$emit( TestModules.WILDCARD );
      expect( emitted.length ).to.equal( 0 );
      emoney.$dispel( null , true );
    });
    it( 'should not call handleE$ if emit callback is falsy' , function(){
      var gotCalls = 0,
        emoney = E$({
          handleE$: function(){
            gotCalls++;
          }
        })
        .$when( 'emoney' )
        .$emit( 'emoney' );
      expect( gotCalls ).to.equal( 1 );
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
    });
  });

  describe( '#$dispel' , function(){
    before(function(){
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should remove an event handler' , function(){
      emoney.$when( 'gnarly' , Test );
      expect( emoney.$__listeners ).to.have.length( 1 );
      emoney.$dispel( 'gnarly' , Test );
      // expect( emoney.$__listeners ).to.not.have.property( 'gnarly' );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
    it( 'should remove all event handlers if no arguments are passed' , function(){
      emoney.$when( 'gnarly' , Test );
      emoney.$when( 'rad' , Test );
      // expect( emoney.$__listeners.gnarly.length ).to.equal( 1 );
      // expect( emoney.$__listeners.rad.length ).to.equal( 1 );
      expect( emoney.$__listeners ).to.have.length( 2 );
      expect( emoney.$__listeners[0].type ).to.equal( 'gnarly' );
      expect( emoney.$__listeners[0].fn ).to.equal( Test );
      expect( emoney.$__listeners[1].type ).to.equal( 'rad' );
      expect( emoney.$__listeners[1].fn ).to.equal( Test );
      emoney.$dispel();
      // expect( emoney.$__listeners ).to.not.have.property( 'gnarly' );
      // expect( emoney.$__listeners ).to.not.have.property( 'rad' );
      expect( emoney.$__listeners ).to.have.length( 0 );
    });
return;
    it( 'should remove all handlers matched by func when event type is falsy' , function(){
      emoney
        .$when([ 'gnarly' , 'rad' ] , Test )
        .$when([ 'gnarly' , 'rad' ] , Test2 );
      expect( emoney.$__listeners.gnarly.length ).to.equal( 2 );
      expect( emoney.$__listeners.rad.length ).to.equal( 2 );
      emoney.$dispel( null , Test );
      expect( emoney.$__listeners.gnarly.length ).to.equal( 1 );
      expect( emoney.$__listeners.rad.length ).to.equal( 1 );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.not.have.property( 'gnarly' );
      expect( emoney.$__listeners ).to.not.have.property( 'rad' );
    });
    it( 'should not remove wildcard handlers if wild is falsy' , function( done ){
      emoney.$when( TestModules.WILDCARD );
      emoney.$dispel();
      expect( emoney.$__listeners ).to.have.property( TestModules.WILDCARD );
      done();
    });
    it( 'should remove wildcard handlers if wild is truthy' , function( done ){
      emoney.$dispel( null , true );
      expect( emoney.$__listeners ).to.not.have.property( TestModules.WILDCARD );
      done();
    });
  });
return;

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
  });

  describe( '#$unwatch' , function(){
    it( 'should stop watching any events emitted by subject' , function( done ){
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
        expect( emitter.$__listeners ).to.eql({});
      });

      done();
    });
  });

  describe( '::create' , function(){
    it( 'should create a new object that extends the E$ prototype' , function( done ){
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
      done();
    });
  });

  describe( '::construct' , function(){
    it( 'should define required properties for an instance created with E$' , function( done ){
      var gnarly = new Gnarly();
      expect( gnarly.tubes ).to.be.a( 'function' );
      expect( gnarly.handleE$ ).to.be.a( 'function' );
      expect( gnarly.$__listeners ).to.be.an( 'object' );
      expect( gnarly.handleE$ ).to.not.equal( Gnarly.prototype.handleE$ );
      done();
    });
    it( 'should define unique handlers objects' , function( done ){
      var gnarly1 = new Gnarly();
      var gnarly2 = new Gnarly();
      gnarly1.$when( 'rad' , function(){
        assert.ok( false );
      });
      expect( gnarly2.$__listeners.rad ).to.be.undefined;
      gnarly2.$emit( 'rad' );
      done();
    });
  });

  describe( '::is' , function(){
    it( 'should return true for an E$ instance' , function( done ){
      expect( E$.is( emoney )).to.equal( true );
      done();
    });
    it( 'should return true for an E$ish instance' , function( done ){
      var gnarly = new Gnarly();
      expect( E$.is( gnarly )).to.equal( true );
      done();
    });
    it( 'should return false otherwise' , function( done ){
      expect(E$.is( {} )).to.equal( false );
      expect(E$.is( [] )).to.equal( false );
      expect(E$.is()).to.equal( false );
      done();
    });
  });

  describe( 'EventHandler' , function(){
    it( 'args should be unique to each event occurrence' , function(){
      function handlerFunc( e ) {
        expect( this ).to.be.undefined;
        expect( e.target ).to.equal( emoney );
        expect( arguments.length ).to.equal( 1 );
      }
      var evt = new TestModules.Event( emoney , 'rad' );
      var evtHandler = new TestModules.EventHandler( handlerFunc );
      for (var i = 0; i < 10; i++) {
        evtHandler.invoke( evt );
      }
    });
  });

  describe( 'ListenerManager' , function(){
    var listeners = new TestModules.ListenerManager();

    describe( '#add' , function(){
      it( 'should push to the proper type array' , function(){
        listeners.add( 'gnarly' , Test );
        expect( listeners.gnarly.length ).to.equal( 1 );
      });
    });

    describe( '#_get' , function(){
      it( 'should return all handlers if type is falsy' , function(){
        var handlers = listeners._get();
        expect( handlers ).to.be.an.instanceOf( Object );
      });
      it( 'should return the type array if type is defined' , function(){
        var handlerArray = listeners._get( 'gnarly' );
        expect( handlerArray ).to.be.an.instanceOf( Array );
      });
      it( 'should return an empty array if type does not exist' , function(){
        var handlerArray = listeners._get( 'rad' );
        expect( handlerArray ).to.be.an.instanceOf( Array );
        expect( handlerArray.length ).to.equal( 0 );
        expect( listeners ).to.not.have.property( 'rad' );
      });
    });

    describe( '#invoke' , function(){
      it( 'should invoke event handlers in the type array' , function( done ){
        listeners.add( 'rad' , function once( e , test1 , test2 ) {
          expect( e ).to.be.an.instanceOf( TestModules.Event );
          expect( e.target ).to.equal( listeners );
          expect( test1 ).to.equal( true );
          expect( test2 ).to.equal( false );
          listeners.remove( e.type , once );
          done();
        });
        var evt = new TestModules.Event( listeners , 'rad' );
        listeners.invoke( evt , [ true , false ]);
      });
    });

    describe( '#remove' , function(){
      it( 'should delete the type array if length is 0' , function(){
        listeners.add( 'gnarly' , Test );
        expect( listeners.gnarly.length ).to.be.at.least( 1 );
        listeners.remove( 'gnarly' , Test );
        expect( listeners ).to.not.have.property( 'gnarly' );
      });
      it( 'should delete the type array if func is falsy' , function(){
        listeners.add( 'gnarly' , Test );
        expect( listeners.gnarly.length ).to.equal( 1 );
        listeners.remove( 'gnarly' );
        expect( listeners ).to.not.have.property( 'gnarly' );
      });
      it( 'should remove all matched handlers' , function(){
        listeners.add( 'gnarly' , Test );
        listeners.add( 'gnarly' , Test2 );
        listeners.add( 'gnarly' , Test3 );
        listeners.add( 'gnarly' , Test );
        expect( listeners.gnarly ).to.have.length( 4 );
        listeners.remove( 'gnarly' , Test );
        expect( listeners.gnarly ).to.have.length( 2 );
        listeners.remove( 'gnarly' , Test2 );
        listeners.remove( 'gnarly' , Test3 );
        expect( listeners ).to.not.have.property( 'gnarly' );
      });
      it( 'should remove only handlers matched by event type and handler function' , function(){
        listeners.add( 'gnarly' , Test );
        listeners.add( 'gnarly' , Test2 );
        listeners.add( 'rad' , Test );
        listeners.add( 'rad' , Test2 );
        expect( listeners.gnarly.length ).to.equal( 2 );
        expect( listeners.rad.length ).to.equal( 2 );
        listeners.remove( 'gnarly' , Test );
        listeners.remove( 'rad' , Test );
        expect( listeners.gnarly.length ).to.equal( 1 );
        expect( listeners.rad.length ).to.equal( 1 );
        listeners.remove( 'gnarly' , Test2 );
        listeners.remove( 'rad' , Test2 );
        expect( listeners ).to.not.have.property( 'gnarly' );
        expect( listeners ).to.not.have.property( 'rad' );
      });
    });
  });

  describe( 'Stack' , function(){
    var stack = new TestModules.Stack();
    describe( 'enqueue' , function(){
      it( 'should push a function to stack' , function( done ){
        stack.enqueue( done );
        expect( stack ).to.have.length( 1 );
        stack.flush();
      });
    });
    describe( 'flush' , function(){
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
        expect( stack.length ).to.equal( count );
        expect(function(){ stack.flush() }).to.throw( /test error 2/ );
        expect( stack.length ).to.equal( 0 );
      });
    });
  });
}());
