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
            items,
            lastParams = '',
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
                },

                set: function (items) {
                    // sets all items - overwrites existing items, if any
                    this.clear();
                    this.items = items.concat([]);
                },

                get: function (value, optionalIdentifier) {
                    // always returns one item or null
                    if (!value || !this.items) {
                        return null;
                    }
                    var i, key = optionalIdentifier || options.identifier || defaults.identifier;
                    for (i = 0; i < this.items.length; i++) {
                        if (this.items[i][key] === value) {
                            return this.items[i];
                        }
                    }
                    return null;
                },

                remove: function (itemsOrIdOrIds) {

                },

                clear: function () {
                    items = this.items = [];
                    lastParams = '';
                    currentParams = {};
                },

                fetch: function (params) {
                    //this.params = {
                    //    filter:{
                    //
                    //    },
                    //    sort: {
                    //
                    //    },
                    //    paginate: {
                    //
                    //    },
                    //    segment: {
                    //
                    //    },
                    //    search:{
                    //
                    //    }
                    //};
                    var i, strParams;
                    currentParams = mix(currentParams, params);
                    strParams = JSON.stringify(currentParams);
                    if(items && strParams === lastParams){
                        return items;
                    }
                    lastParams = strParams;
                    items = this.items.concat([]);
                    for(i = 0; i < plugins.length; i++){
                        items = plugins[i](items, currentParams, this);
                    }
                    return items;
                },

                load: function (url) {
                    // memory store, fetch initial data
                    // need loaded, or is ready?
                }
            };

        toArray(options.plugins).forEach(function (pluginName) {
            var
                i,
                plugin = store.plugins[pluginName],
                order = plugin.order;

            if(!plugins.length) {
                plugins.push(plugin);
            }
            else if(plugins.length === 1){
                if(plugins[0].order <= order){
                    plugins.push(plugin);
                }else{
                    plugins.unshift(plugin);
                }
            }
            else{
                for(i = 1; i < plugins.length; i++){
                    if(order === plugins[i-1].order || (order > plugins[i-1].order && order < plugins[i].order)){
                        plugins.splice(i, 0, plugin);
                        // inserted, continue forEach loop
                        return;
                    }
                }
                // was not inserted...
                plugins.push(plugin);
            }
            dataStore.plugins = plugins;
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

    function toArray (object) {
        if(!object){ return []; }
        if(Array.isArray(object)){ return object; }
        if(typeof object === 'string'){ return object.split(',').map(function(s){ return s.trim();})}
        console.warn('unknown plugins type:', object);
        return [];
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

}(window));