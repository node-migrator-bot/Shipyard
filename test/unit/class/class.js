var Class = require('../../../lib/shipyard/class/Class'),
	func = require('../../../lib/shipyard/utils/function'),
	Spy = require('../../testigo/lib/spy').Spy;

module.exports = {

	'Class instance': function(it, setup) {
		
		it('should be an instanceof its Class', function(expect) {
			var Example = new Class();
			var ex = new Example();
			expect(ex).toBeAnInstanceOf(Example);
			
			var Other = new Class(function constructor(){
				this.ex = 'example';
			});
			var ot = new Other();
			expect(ot).toBeAnInstanceOf(Other);
		});

		it('should be an instance Class', function(expect) {
			var Ex = new Class();
			var ex = new Ex();
			expect(ex).toBeAnInstanceOf(Class);

			var It = new Class({ Extends: Ex });
			var it = new It();
			expect(it).toBeAnInstanceOf(Class);
		});
		
		it('should use its prototype', function(expect) {
			var Example = new Class({
				derp: function() {}
			});
			var ex = new Example();
			
			expect(ex.derp).toBeType('function');
			expect(ex.derp).toBe(Example.prototype.derp);
		});

		it('should have a constructor property pointing at its Class', function(expect) {
			var Ex = new Class();
			var ex = new Ex();
			expect(ex.constructor).toBe(Ex);
		});

		it('should clone objects/arrays from prototype', function(expect) {
			var Example = new Class({
				list: []
			});
			
			var ex1 = new Example(),
				ex2 = new Example();

			ex1.list.push('test');

			expect(ex1.list.length).toBe(1);
			expect(ex2.list.length).toBe(0);
		});
		
		it('should be able to extend other classes', function(expect) {
			var Example = new Class({
				derp: function() {}
			});
			var BetterExample = new Class({
				Extends: Example,
				herp: function() {}
			});
			
			var ex = new BetterExample();
			
			expect(ex).toBeAnInstanceOf(Example);
			expect(ex).toBeAnInstanceOf(BetterExample);
			expect(ex.derp).toBeType('function');
			expect(ex.constructor).toBe(BetterExample);
		});

		it('should give a meaningful error if Extends is not a Class', function(expect) {
			var A;
			var B = {};
			var C = function() {};

			function extend(kls) {
				try {
					new Class({ Extends: kls });
				} catch (err) {
					return err;
				}
			}

			var msg = 'Class must extend from another Class.';
			expect(extend(A).message).toBe(msg);
			expect(extend(B).message).toBe(msg);
			expect(extend(C).message).toBe(msg);
		});

		it('should not call extended class\' initialize method at Extends', function(expect) {
			var fn = new Spy();
			var Ex = new Class({
				initialize: fn
			});
			var Ex2 = new Class({
				Extends: Ex
			});

			expect(fn.getCallCount()).toBe(0);
		});
		
		it('should be able to call a parent method when extended', function(expect) {
			var Example = new Class({
				derp: function() {
					return 'rp';
				}
			});
			Example.blam = 'blam';
			var BetterExample = new Class({
				Extends: Example,
				derp: function() {
					return 'de' + this.parent();
				}
			});
			
			var ex = new BetterExample();
			expect(ex.derp()).toBe('derp');
		});

		it('should be able to call parent with overloadSetter', function(expect) {
			var Ex = new Class({
				a: function(b) { this.b = b; }
			});
			var Ex2 = new Class({
				Extends: Ex,
				a: func.overloadSetter(function(b, c) {
					this.parent(b);
				})
			});

			var ex = new Ex2();
			ex.a({ foo: 'bar' });
			expect(ex.b).toBe('foo');

		});

		it('should merge objects when extended', function(expect) {
			var A = new Class({
				a: { one: 1 }
			});
			var B = new Class({
				Extends: A,
				a: { two: 2 }
			});

			var b = new B();
			expect(b.a.two).toBe(2);
			expect(b.a.one).toBe(1);

			var a = new A();
			expect(a.a.one).toBe(1);
			expect(a.a.two).toBeUndefined();
		});

        it('should attach deep objects to instance', function(expect) {
            var A = new Class({
                b: {
                    c: {
                        d: 'e'
                    }
                }
            });

            var a = new A();

            expect(a.b.c.d).toBe('e');
        });
		
		it('should implement mixins', function(expect) {
			var Mixin = new Class({
				derp: function() {}
			});
			var Example = new Class({
				Implements: Mixin,
				herp: function() {}
			});
			var ex = new Example();
			
			expect(ex).not.toBeAnInstanceOf(Mixin);
			expect(ex.derp).toBeType('function');
			expect(ex.constructor).toBe(Example);
		});

		it('should have an "implement" static method', function(expect) {
		
			var Example = new Class();
			expect(Example.implement).toBeType('function');

			Example.implement('a', function() {
				return 'arm';
			});

			Example.implement({
				'b': function() { return 'b'; },
				'c': function(d) { return this.b() + d; }
			});

			var ex = new Example();

			expect(ex.a()).toBe('arm');
			expect(ex.c('ad')).toBe('bad');
		
		});


		it('should extend static properties', function(expect) {
			var Example = new Class();
			Example.merp = '$merp';
			Example.derp = function() { return this.merp; };
			var BetterExample = new Class({
				Extends: Example
			});
			
			expect(BetterExample.derp).toBe(Example.derp);
			expect(BetterExample.derp()).toBe(Example.merp);
			
			BetterExample.merp = '$larp';
			expect(BetterExample.derp()).toBe(BetterExample.merp);
			expect(Example.derp()).toBe(Example.merp);
			
			var ex = new BetterExample();
		});

		it('should have local Mutators', function(expect) {
			var Interface = new Class();
			Interface.defineMutator('Local', function(val) {
				this.implement('isLocal', function() {
					return !!val;
				});
			});

			var Ex = new Class({
				Implements: Interface,
				Local: true
			});

			var ex = new Ex();
			expect(ex.isLocal).toBeTruthy();
			expect(ex.isLocal()).toBe(true);

			var Be = new Class({
				Local: false
			});
			var b = new Be();
			expect(b.isLocal).toBeUndefined();

		});
		
	}
	
};
