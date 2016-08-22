(function () {

    'use strict';

    function store(options) {
        options = options || {};
        var
            defaults = {
                identifier: 'id'
            },
            dataStore = {

                add: function (items) {
                    if (!this.items) {
                        return this.set(items);
                    }
                    if (Array.isArray(items)) {
                        this.items = this.items.concat(items);
                    }
                    else {
                        this.items.push(items);
                    }
                    this.update();
                },

                set: function (items) {
                    // handle columns?
                    this.items = items;
                    this.update();
                },

                get: function (value, optionalIdentifier) {
                    if (!value) {
                        return this.items;
                    }
                    if (!this.items) {
                        return null;
                    }
                    var i, key = optionalIdentifier || options.identifier || defaults.identifier;
                    for (i = 0; i < this.items.length; i++) {
                        //var p = this.items[i][key];
                        if (this.items[i][key] === value) {
                            return this.items[i];
                        }
                    }
                    return null;
                },

                update: function () {
                    // run through plugins to sort, paginate, etc
                    // or sync with server
                },

                search: function () {

                },

                sort: function () {

                },

                filter: function () {

                },

                segment: function () {

                },

                paginate: function () {

                }
            };

        (options.plugins || []).forEach(function (pluginName) {
            var plugin = store.plugins[pluginName];
            plugin(dataStore);
        });

        return dataStore;
    }

    store.plugins = {};
    store.addPlugin = function (type, plugin) {
        store.plugins[type] = plugin;
    };

    if (typeof customLoader === 'function') {
        customLoader(store, 'store');
    }
    else if (typeof window !== 'undefined') {
        window.store = store;
    }
    else if (typeof module !== 'undefined') {
        module.exports = store;
    }
    else {
        return store;
    }

}());