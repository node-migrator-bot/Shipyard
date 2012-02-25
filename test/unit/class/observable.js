var Observable = require('../../../lib/shipyard/class/Observable'),
    Class = require('../../../lib/shipyard/class/Class'),
    Spy = require('../../testigo/lib/spy').Spy;

module.exports = {
    'Observable': function(it, setup) {
        it('should be able to set and get properties', function(expect) {
            var o = new Observable();
            o.set('foo', 'bar');
            expect(o.get('foo')).toBe('bar');
        });

        it('should be able to get from functions', function(expect) {
            var o = new Observable();
            o.fullName = function() {
                return [this.get('first'), this.get('last')].join(' ');
            };

            o.set('first', 'Sean');
            o.set('last', 'McArthur');

            expect(o.get('fullName')).toBe('Sean McArthur');
        });

        it('should be able to take a hash to set data', function(expect) {
            var o = new Observable();
            o.set({ foo: 'bar', baz: 'bad' });
            expect(o.get('foo')).toBe('bar');
            expect(o.get('baz')).toBe('bad');
        });

        it('should fire a change event when data changes', function(expect) {
            var o = new Observable(),
                spy = new Spy();
            o.addListener('change', spy);
            o.set('bad', 'mad');
            o.set('bad', 'happy');
            o.set('bad', 'happy');

            expect(spy.getCallCount()).toBe(2);
            expect(spy.getLastArgs()).toBeLike(['bad', 'happy', 'mad']);
        });

        it('should be able to observe properties', function(expect) {
            var o = new Observable(),
                spy = new Spy();
            o.observe('herp', spy);
            o.set('foo', 'bar');
            o.set('herp', 'derp');

            expect(spy.getCallCount()).toBe(1);
            expect(spy.getLastArgs()).toBeLike(['derp', undefined]);
        });

        it('should be able to observe computed properties', function(expect) {
            var Ex = new Class({
                Extends: Observable,
                bar: Observable.property(function() {
                    return this.get('foo');
                }, 'foo')
            });

            var ex = new Ex({ foo: 'baz' });
            var spy = new Spy();

            ex.observe('bar', spy);
            ex.set('foo', 'moe');

            expect(spy.getCallCount()).toBe(1);
            expect(spy.getLastArgs()).toBeLike(['moe', 'baz']);
        });

		it('should be able to set compuated properties', function(expect) {
			var Ex = new Class({
				Extends: Observable,
				bar: Observable.property(function(value) {
					if (arguments.length > 0) {
						//setter
						this.set('foo', value);
					} else {
						//getter
						return this.get('foo');
					}
				}, 'foo')
			});

			var ex = new Ex({ foo: 'baz' });
			var fooSpy = new Spy();
			var barSpy = new Spy();

			ex.observe('foo', fooSpy);
			ex.observe('bar', barSpy);
			ex.set('bar', 'derp');

			expect(ex.get('foo')).toBe('derp');
			expect(fooSpy.getCallCount()).toBe(1);
			expect(barSpy.getCallCount()).toBeTruthy();
		});

        it('should assign events for properties starting with "on"', function(expect) {
            var spy = new Spy();
            var Ex = new Class({
                Extends: Observable,
                onEv: spy
            });
            var ex = new Ex();
            ex.emit('ev');

            expect(spy).toHaveBeenCalled();
        });
    }
};
