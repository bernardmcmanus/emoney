(function() {

  'use strict';

  var path = require( 'path' );
  var fs = require( 'fs-extra' );
  var util = require( 'util' );
  var chai = require( 'chai' );
  var expect = chai.expect;

  var pkg = fs.readJsonSync(
    path.resolve( __dirname , '../package.json' )
  );

  var E$ = require( './' + pkg.name + '.js' );
  var TestModules = require( './testModules.transpiled.js' );


  E$.log = function() {
    var args = args = Array.prototype.map.call( arguments , function( arg ) {
      return util.inspect( arg , { depth: null, showHidden: false, colors: true });
    });
    console.log.apply( null , args );
  };

  E$.aggregate = function( arr ) {
    var aggregator = E$();
    arr.forEach(function( em ) {
      aggregator.$when( '*' , function() {
        var args = Array.prototype.slice.call( arguments );
        var e = args.shift();
        em.$emit( e.type , args );
      });
    });
    return aggregator;
  };


  var SEED = { name: 'emoney' };
  function Test(){}
  function Test2(){}
  function Test3(){}

  function GNARLY() {
    E$.construct( this );
  }

  GNARLY.prototype = E$.create({
    tubes: function() {},
    handleE$: function() {}
  });

  var emoney = E$( SEED );


  describe( 'constructor' , function() {

    it( 'should create a new E$ instance' , function( done ) {
      expect( emoney ).to.be.an.instanceOf( E$ );
      done();
    });
  });

  describe( 'prototype' , function() {

    it( 'should have no enumerable properties when E$ is created with constructor' , function( done ) {
      var keys = [];
      for (var key in emoney) {
        keys.push( key );
      }
      expect( keys.length ).to.equal(
        Object.keys( SEED ).length
      );
      done();
    });
    
    it( 'should inherit no enumerable properties when E$ is created with E$.create / E$.construct' , function( done ) {
      var emoneyIsh = new GNARLY();
      var keys = [];
      for (var key in emoneyIsh) {
        keys.push( key );
      }
      expect( keys.length ).to.equal(
        Object.keys( GNARLY.prototype ).length
      );
      done();
    });
  });

  describe( '#__add' , function() {

    it( 'should push to the handlers[type] array' , function( done ) {
      emoney.__add( 'gnarly' , Test , null );
      expect( emoney.handlers.gnarly.length ).to.equal( 1 );
      emoney.handlers.gnarly = [];
      done();
    });
  });

  describe( '#__get' , function() {

    it( 'should return all handlers if type is falsy' , function( done ) {
      var handlers = emoney.__get();
      expect( handlers ).to.be.an.instanceOf( Object );
      done();
    });
    
    it( 'should return handlers[type] if type is defined' , function( done ) {
      var handlerArray = emoney.__get( 'gnarly' );
      expect( handlerArray ).to.be.an.instanceOf( Array );
      done();
    });
    
    it( 'should return an empty array if type does not exist' , function( done ) {
      var handlerArray = emoney.__get( 'rad' );
      expect( handlerArray ).to.be.an.instanceOf( Array );
      expect( handlerArray.length ).to.equal( 0 );
      expect( emoney.handlers ).to.not.have.property( 'rad' );
      done();
    });
  });

  describe( '#__invoke' , function() {

    it( 'should invoke event handlers in the handlers[type] array' , function( done ) {
      emoney.$once( 'rad' , function( e , test1 , test2 ) {
        expect( test1 ).to.equal( true );
        expect( test2 ).to.equal( false );
        done();
      });
      emoney.__invoke( 'rad' , [ true , false ]);
    });
  });

  describe( '#__remove' , function() {

    it( 'should delete the handlers[type] array if length is 0' , function( done ) {
      emoney.__remove( 'gnarly' , Test );
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      done();
    });
    
    it( 'should delete the handlers[type] array if func is falsy' , function( done ) {
      emoney.__add( 'gnarly' , Test , null );
      expect( emoney.handlers.gnarly.length ).to.equal( 1 );
      emoney.__remove( 'gnarly' );
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      done();
    });
    
    it( 'should remove all matched handlers' , function( done ) {
      emoney.__add( 'gnarly' , Test , null );
      emoney.__add( 'gnarly' , Test , null );
      expect( emoney.handlers.gnarly.length ).to.equal( 2 );
      emoney.__remove( 'gnarly' , Test );
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      done();
    });
    
    it( 'should remove only handlers matched by event type and handler function' , function( done ) {
      emoney.__add( 'gnarly' , Test , null );
      emoney.__add( 'gnarly' , Test2 , null );
      emoney.__add( 'rad' , Test , null );
      emoney.__add( 'rad' , Test2 , null );
      expect( emoney.handlers.gnarly.length ).to.equal( 2 );
      expect( emoney.handlers.rad.length ).to.equal( 2 );
      emoney.__remove( 'gnarly' , Test );
      emoney.__remove( 'rad' , Test );
      expect( emoney.handlers.gnarly.length ).to.equal( 1 );
      expect( emoney.handlers.rad.length ).to.equal( 1 );
      emoney.$dispel();
      done();
    });
  });

  describe( '$when' , function() {
    
    it( 'should add an event handler' , function( done ) {
      emoney.$when( 'gnarly' , Test );
      expect( emoney.handlers ).to.have.property( 'gnarly' );
      expect( emoney.handlers.gnarly.length ).to.equal( 1 );
      emoney.$dispel();
      done();
    });

    it( 'should use subject.handleE$ when handler is falsy' , function( done ) {
      emoney.$when( 'rad' );
      expect( emoney.handlers.rad[0].func ).to.equal( emoney.handleE$ );
      emoney.$dispel( 'rad' );
      done();
    });

    it( 'should bind args to each event handler' , function( done ) {
      var arr = [];
      for (var i = 0; i < 10; i++) { arr.push( i ) }
      arr.forEach(function( i ) {
        emoney.$when( 'rad' , [ i , 'test-' + i ] , function( e , n , test ) {
          expect( n ).to.equal( i );
          expect( test ).to.equal( 'test-' + i );
        });
      });
      emoney.$emit( 'rad' );
      emoney.$dispel( 'rad' );
      done();
    });

    it( 'should add a wildcard handler when event is falsy' , function( done ) {
      emoney.$when();
      expect( emoney.handlers ).to.have.property( TestModules.$WILDCARD );
      emoney.$dispel( null , true );
      done();
    });
  });

  describe( '$once' , function() {

    it( 'should remove an event handler after it is executed' , function( done ) {
      emoney.$once( 'gnarly' , function() {
        expect( emoney.handlers ).to.have.property( 'gnarly' );
      });
      emoney.$emit( 'gnarly' );
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      done();
    });

    it( 'should only be executed for one event type in eventList' , function( done ) {
      var eventList = [ 'gnarly' , 'rad' ];
      var result = [];
      emoney.$once( eventList , function( e ) {
        result.push( e.type );
        eventList.forEach(function( type ) {
          expect( emoney.handlers ).to.have.property( type );
        });
      });
      emoney.$emit( eventList );
      emoney.$emit( eventList );
      eventList.forEach(function( type ) {
        expect( emoney.handlers ).to.not.have.property( type );
      });
      expect( result ).to.eql( eventList );
      done();
    });

    it( 'should bind args to each event handler' , function( done ) {
      var arr = [];
      for (var i = 0; i < 10; i++) { arr.push( i ) }
      arr.forEach(function( i ) {
        emoney.$once( 'rad' , [ i , 'test-' + i ] , function( e , n , test ) {
          expect( n ).to.equal( i );
          expect( test ).to.equal( 'test-' + i );
        });
      });
      emoney.$emit( 'rad' );
      done();
    });

    it( 'should remove the wildcard handler after an $emit' , function( done ) {
      var events = [ 'gnarly' , 'rad' ], emitted = [];
      emoney.$once( TestModules.$WILDCARD , function( e ) {
        emitted.push( e.type );
      });
      emoney.$emit( events );
      emoney.$emit( events );
      expect( emitted ).to.eql( events );
      done();
    });
  });

  describe( '$emit' , function() {

    var events = [ 'gnarly' , 'rad' ];

    it( 'should always execute handlers and callbacks by default' , function( done ) {
      var arr = [];
      emoney.$once( events , function( e ) {
        expect( events ).to.contain( e.type );
        arr.push( e.type );
      })
      .$once( events , function( e ) {
        expect( events ).to.contain( e.type );
        arr.push( e.type );
      })
      .$emit( events , function( e ) {
        arr.push( e.type );
        expect( e.defaultPrevented ).to.equal( false );
      });
      expect( arr.length ).to.equal( events.length * 3 );
      done();
    });

    it( 'should execute handlers but NOT callbacks if default is prevented' , function( done ) {
      var arr = [];
      emoney.$once( events , function( e ) {
        expect( e.defaultPrevented ).to.equal( false );
        arr.push( e.type );
      })
      .$once( events , function( e ) {
        e.preventDefault();
        arr.push( e.type );
        expect( e.defaultPrevented ).to.equal( true );
      })
      .$emit( events , function( e ) {
        arr.push( e.type );
        expect( e.defaultPrevented ).to.equal( false );
      });
      expect( arr.length ).to.equal( events.length * 2 );
      done();
    });

    it( 'should stop execution if propagation is stopped' , function( done ) {
      var arr = [];
      emoney.$once( events , function( e ) {
        e.stopPropagation();
        expect( e.cancelBubble ).to.equal( true );
        arr.push( e.type );
      })
      .$once( events , function( e ) {
        arr.push( e.type );
        expect( false ).to.equal( true );
      })
      .$emit( events , function( e ) {
        expect( e.cancelBubble ).to.equal( true );
        arr.push( e.type );
      });
      expect( arr.length ).to.equal( events.length * 2 );
      emoney.$dispel();
      done();
    });

    it( 'should always execute wildcard handlers' , function( done ) {
      var events = [ 'gnarly' , 'rad' ], emitted = [];
      emoney.$when( TestModules.$WILDCARD , function( e ) {
        emitted.push( e.type );
      });
      emoney.$emit( events );
      expect( emitted ).to.eql( events );
      emoney.$dispel( null , true );
      done();
    });

    it( 'should not explicitly emit wildcard events' , function( done ) {
      var emitted = [];
      emoney.$when( TestModules.$WILDCARD , function( e ) {
        emitted.push( e.type );
      });
      emoney.$emit();
      emoney.$emit( TestModules.$WILDCARD );
      expect( emitted.length ).to.equal( 0 );
      emoney.$dispel( null , true );
      done();
    });
  });

  describe( '$dispel' , function() {

    it( 'should remove an event handler' , function( done ) {
      emoney.$when( 'gnarly' , Test );
      emoney.$dispel( 'gnarly' , Test );
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      done();
    });

    it( 'should remove all event handlers if no arguments are passed' , function( done ) {
      emoney.$when( 'gnarly' , Test );
      emoney.$when( 'rad' , Test );
      expect( emoney.handlers.gnarly.length ).to.equal( 1 );
      expect( emoney.handlers.rad.length ).to.equal( 1 );
      emoney.$dispel();
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      expect( emoney.handlers ).to.not.have.property( 'rad' );
      done();
    });

    it( 'should remove all handlers matched by func when event type is falsy' , function( done ) {
      emoney
        .$when([ 'gnarly' , 'rad' ] , Test )
        .$when([ 'gnarly' , 'rad' ] , Test2 );
      expect( emoney.handlers.gnarly.length ).to.equal( 2 );
      expect( emoney.handlers.rad.length ).to.equal( 2 );
      emoney.$dispel( null , Test );
      expect( emoney.handlers.gnarly.length ).to.equal( 1 );
      expect( emoney.handlers.rad.length ).to.equal( 1 );
      emoney.$dispel();
      expect( emoney.handlers ).to.not.have.property( 'gnarly' );
      expect( emoney.handlers ).to.not.have.property( 'rad' );
      done();
    });

    it( 'should not remove wildcard handlers if wild is falsy' , function( done ) {
      emoney.$when( TestModules.$WILDCARD );
      emoney.$dispel();
      expect( emoney.handlers ).to.have.property( TestModules.$WILDCARD );
      done();
    });

    it( 'should remove wildcard handlers if wild is truthy' , function( done ) {
      emoney.$dispel( null , true );
      expect( emoney.handlers ).to.not.have.property( TestModules.$WILDCARD );
      done();
    });
  });

  describe( '$watch' , function() {

    it( 'should listen to any events emitted by subject' , function( done ) {
      
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
        handleE$: function( e ) {
          emitted[e.target.name].push( e.type );
        }
      });
      
      watcher.$watch([ emitter1 , emitter2 , emitter3 ]);

      E$.aggregate([ emitter1 , emitter2 , emitter3 ]).$emit( events );

      Object.keys( emitted ).forEach(function( key ) {
        var evts = emitted[key];
        expect( evts ).to.eql( events );
      });

      done();
    });
  });

  describe( '$ignore' , function() {

    it( 'should stop watching to any events emitted by subject' , function( done ) {
      
      var emitter1 = E$({ name: 'emitter1' });
      var emitter2 = E$({ name: 'emitter2' });
      var emitter3 = E$({ name: 'emitter3' });
      var watcher = E$({ name: 'watcher' });
      
      watcher.$watch([ emitter1 , emitter2 , emitter3 ]);
      watcher.$ignore([ emitter1 , emitter2 , emitter3 ]);

      [
        emitter1,
        emitter2,
        emitter3
      ]
      .forEach(function( emitter ) {
        expect( emitter.handlers ).to.eql({});
      });

      done();
    });
  });

  describe( 'E$' , function() {

    describe( '#create' , function() {
      it( 'should create a new object that extends the E$ prototype' , function( done ) {
        for (var key in E$.prototype) {
          if (key === 'handleE$') {
            expect( GNARLY.prototype[key] ).to.not.equal( E$.prototype[key] );
          }
          else {
            expect( GNARLY.prototype[key] ).to.equal( E$.prototype[key] );
          }
        }
        expect( GNARLY.prototype ).to.include.keys( 'tubes' );
        expect( GNARLY.prototype ).to.include.keys( 'handleE$' );
        done();
      });
    });

    describe( '#construct' , function() {
      
      it( 'should define required properties for an instance created with E$' , function( done ) {
        var gnarly = new GNARLY();
        expect( gnarly.tubes ).to.be.a( 'function' );
        expect( gnarly.handleE$ ).to.be.a( 'function' );
        expect( gnarly.handlers ).to.be.an( 'object' );
        expect( gnarly.handleE$ ).to.not.equal( GNARLY.prototype.handleE$ );
        done();
      });

      it( 'should define unique handlers objects' , function( done ) {
        var gnarly1 = new GNARLY();
        var gnarly2 = new GNARLY();
        gnarly1.$when( 'rad' , function(){
          assert.ok( false );
        });
        expect( gnarly2.handlers.rad ).to.be.undefined;
        gnarly2.$emit( 'rad' );
        done();
      });
    });

    describe( '#is' , function() {
      
      it( 'should evaluate to true for an E$ instance' , function( done ) {
        expect( E$.is( emoney )).to.equal( true );
        done();
      });

      it( 'should evaluate to true for an E$ish instance' , function( done ) {
        var gnarly = new GNARLY();
        expect( E$.is( gnarly )).to.equal( true );
        done();
      });
    });
  });

  describe( 'EventHandler' , function() {

    it( 'args should be unique to each event occurrence' , function( done ) {
      function handlerFunc( e ) {
        expect( arguments.length ).to.equal( 1 );
      }
      var evt = new TestModules.Event( emoney , 'rad' );
      var evtHandler = new TestModules.EventHandler( handlerFunc , emoney );
      for (var i = 0; i < 10; i++) {
        evtHandler.invoke( evt );
      }
      done();
    });
  });

  function async( callback , delay ) {
    setTimeout( callback , delay || 1 );
  }

}());



















