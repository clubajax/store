(function () {

    'use strict';

    function store(options) {
        options = options || {};
        var
            // can't be private - plugins need access
            defaults = {
                identifier: 'id'
            },
            plugins = [],
            currentParams = {},
            dataStore = {

                add: function (items) {
                    // add item or items to existing
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
                    // sets all items - overwrites existing items, if any
                    this.orgItems = items;
                    this.items = items.concat([]);
                    this.update();
                },

                get: function (value, optionalIdentifier) {
                    // always returns one item or null
                    if (!value || !this.items) {
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
                    //
                    // or just mark dirty?
                },

                fetch: function (params) {
                    //this.params = {
                    //    filter:{
                    //
                    //    },
                    //    sort: {
                    //
                    //    },
                    //    segment: {
                    //
                    //    },
                    //    paginate: {
                    //
                    //    },
                    //    search:{
                    //
                    //    }
                    //};
                    currentParams = mix(currentParams, params);
                    var i, items = this.items;
                    console.log('items', this.items);
                    for(i = 0; i < plugins.length; i++){
                        items = plugins[i](items, currentParams, this);
                    }
                    return items;
                },

                load: function (url) {
                    // memory store, fetch initial data
                    // need loaded, or is ready?
                },

                filter: function (items) {

                },

                sort: function () {

                },

                segment: function () {

                },

                paginate: function () {

                },

                search: function () {

                }
            };

        (options.plugins || []).forEach(function (pluginName) {
            var
                i,
                plugin = store.plugins[pluginName],
                order = plugin.order;
            if(!plugins.length){
                plugins.push(plugin);
            }else{
                for(i = 1; i < plugins.length; i++){
                    if(order === plugins[i-1].order || (order > plugins[i-1].order && order < plugins[i].order)){
                        plugins.splice(i, 0, plugin);
                        break;
                    }
                }
            }
        });

        return dataStore;
    }

    store.plugins = {};
    store.addPlugin = function (type, plugin, order) {
        plugin.order = order || 100;
        store.plugins[type] = plugin;
    };

    function mix (o, p) {
        if(p) {
            Object.keys(p).forEach(function (key) {
                o[key] = p[key];
            });
        }
        return o;
    }

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