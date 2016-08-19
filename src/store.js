(function (define) {


    define([], function () {

        'use strict';
        var store = {

        };

        if (typeof customLoader === 'function'){ customLoader(store, 'store'); }
        else if (typeof window !== 'undefined') { window.store = store; }
        else if (typeof module !== 'undefined') { module.exports = store; }
        else { return store; }
    });
}(
    typeof define == 'function' && define.amd ? define : function (ids, factory) {
        var deps = ids.map(function (id) { return typeof require == 'function' ? require(id) : window[id]; });
        typeof module !== 'undefined' ? module.exports = factory.apply(null, deps) : factory.apply(null, deps);
    }
));