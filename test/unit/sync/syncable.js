var Class = require('../../../lib/shipyard/class/Class'),
    Sync = require('../../../lib/shipyard/sync/Sync'),
    Syncable = require('../../../lib/shipyard/sync/Syncable'),
    Spy = require('../../testigo/lib/spy').Spy;

module.exports = {

    'Syncable': function(it, setup) {
        
        var MockSync, MockSyncable;

        setup('beforeEach', function() {
            MockSync = new Class({
                Extends: Sync,
                initialize: function(options) {
                    this.parent(options);
                    this.read = new Spy();
                    this.create = new Spy();
                    this.update = new Spy();
                    this.destroy = new Spy();
                }
            });

            MockSyncable = new Class({
                Implements: Syncable
            });
        });
        
        it('should name Syncs and then use them with the "using" option', function(expect) {
            var foo = new MockSync();
            var bar = new MockSync();

            MockSyncable.addSync('foo', foo);
            MockSyncable.addSync('bar', bar);
            MockSyncable.addSync('baz', new MockSync());

            MockSyncable.find({using: 'bar'});

            expect(foo.read.getCallCount()).toBe(0);
            expect(bar.read.getCallCount()).toBe(1);
        });

        it('should use "default" sync if "using" is not provided', function(expect) {
            var foo = new MockSync();
            var bar = new MockSync();

            MockSyncable.addSync('default', foo);
            MockSyncable.addSync('bar', bar);

            MockSyncable.find();

            expect(foo.read.getCallCount()).toBe(1);
            expect(bar.read.getCallCount()).toBe(0);
        });

        it('should use the Sync mutator to add syncs', function(expect) {
            var foo = new MockSync(),
                bar = new MockSync(),
                getFoo = function() { return foo; },
                getBar = function() { return bar; };

            var S = new Class({
                Implements: Syncable,
                Sync: {
                    'default': {
                        'driver': getFoo
                    },
                    'bar': {
                        'driver': getBar
                    }
                }
            });

            S.find();
            S.find({using: 'bar'});

            expect(foo.read.getCallCount()).toBe(1);
            expect(bar.read.getCallCount()).toBe(1);

        });

        it('should fire Class events from instances', function(expect) {
            var classSpy = new Spy(),
                instSpy = new Spy();
            MockSyncable.addListener('foo', classSpy);

            var s = new MockSyncable();
            s.addListener('foo', instSpy);

            s.emit('foo');
            
            expect(instSpy.getCallCount()).toBe(1);
            expect(classSpy.getCallCount()).toBe(1);
        });

        it('should wrap the returned values from .find()', function(expect) {
            var sync = new MockSync();
            sync.read = function(opts, callback) {
                callback([{a: 1}, {a: 2}]);
            };

            MockSyncable.addSync('default', sync);
            MockSyncable.find({callback: function(list) {
                expect(list).toHaveProperty('length');
                expect(list[0].get('a')).toBe(1);
            }});
        });

        it('should wrap single objects', function(expect) {
            var sync = new MockSync();
            sync.read = function(opts, callback) {
                callback({a: 3});
            };

            MockSyncable.addSync('default', sync);
            MockSyncable.find({callback: function(list){
                expect(list).toHaveProperty('length');
                expect(list[0].get('a')).toBe(3);
            }});
        });

        it('should return an ObsArr from .find()', function(expect) {
            var sync = new MockSync();
            sync.read = function(opts, callback) {
                setTimeout(function() {
                    callback([{ 'foo': 'bar' }, { 'foo': 'baz' }]);
                }, 1);
            };

            MockSyncable.addSync('default', sync);
            var results = MockSyncable.find();
            var counter = 0;
            results.observe('array', function(index, removed, added) {
                expect(index).toBe(0);
                expect(added.length).toBe(2);
                expect(++counter).toBe(1);
            });
        });

        it('should update if save returns new info', function(expect) {
            var sync = new MockSync();
            sync.create = function(data, callback) {
                data = data.toJSON();
                data.pk = 3;
                callback(data);
            };
            sync.update = function(id, data, callback) {
                data = data.toJSON();
                data.updated = true;
                callback(data);
            };

            MockSyncable.addSync('default', sync);

            var m = new MockSyncable();
            m.save();
            expect(m.get('pk')).toBe(3);

            m.save();
            expect(m.get('updated')).toBe(true);
        });

    },

    'Syncable.pk': function test_syncable_pk(it, setup) {
        it('should default to id', function default_id(expect) {
            var s = new Syncable({ id: 1 });
            expect(s.get('pk')).toBe(s.get('id'));
        });

        it('should be changeable', function pk_changeable(expect) {
            var Mock = new Class({
                Extends: Syncable,
                pk: 'foo'
            });
            var s = new Mock({ foo: 'bar' });
            var s2 = new Mock({ pk: 'baz' });

            expect(s.get('pk')).toBe('bar');
            expect(s2.get('foo')).toBe('baz');
        });

        it('should emit events for both properties', function pk_events(expect) {
            var s = new Syncable();
            var pkSpy = new Spy();
            var idSpy = new Spy();

            s.observe('pk', pkSpy);
            s.observe('id', idSpy);

            s.set('pk', 1);
            expect(pkSpy).toHaveBeenCalled();
            expect(idSpy).toHaveBeenCalled();

            var pkSpy2 = new Spy();
            var idSpy2 = new Spy();

            s.observe('pk', pkSpy2);
            s.observe('id', idSpy2);

            s.set('id', 2);
            expect(pkSpy2).toHaveBeenCalled();
            expect(idSpy2).toHaveBeenCalled();
        });
    }
};

