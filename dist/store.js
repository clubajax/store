(function (define) {
define([], function () {


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
                    this.orgItems = items;
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




    // simple filter:
    // {type:'alpha'}
    // OR filter
    // {type:'alpha||beta'}
    // AND filter
    // {type: 'alpha', category: 'greek'}

    function filter (items, params, store) {
        var i, filtered = [], value, propCount, propTotal;
        if(!params.filter){
            return items;
        }
        propTotal = Object.keys(params.filter).length;
        for(i = 0; i < items.length; i++){
            propCount = 0;
            Object.keys(params.filter).forEach(function (key) {
                value = params.filter[key];
                if(value.indexOf('||') > -1){
                    value.split('||').forEach(function (v) {
                        v = v.trim();
                        if (items[i][key] === v) {
                            propCount++;
                        }
                    });

                }else{
                    if (items[i][key] === value) {
                        propCount++;
                    }
                }
            });
            if(propCount === propTotal){
                filtered.push(items[i]);
            }
        }
        return filtered;
    }

    store.addPlugin('filter', filter, 10);



    // paginate:
    // {start:0, count:10}

    function paginate (items, params, store) {
        var key, paginated = [];
        if(params.paginate){
            return items.slice(params.paginate.start, params.paginate.start + params.paginate.count);
        }
        return items;
    }

    store.addPlugin('paginate', paginate, 30);




    // sort:
    // {key:'value', dir: 'asc'} // dir defaults to desc

    function sort (items, params, store) {
        var key, result;
        if(!params.sort){
            return items;
        }
        Object.keys(params.sort).forEach(function (k) {
            if(k !== 'dir') {
                key = params.sort[k];
            }
        });
        result = params.sort.dir === 'asc' ? -1 : 1;
        items.sort(function (a,b) {
            if(a[key] < b[key]){
                return -result;
            }else if(a[key] > b[key]){
                return result;
            }
            return 0;
        });
        return items;
    }

    store.addPlugin('sort', sort, 20);

    });
}(
 typeof define == 'function' && define.amd ? define : function (ids, factory) {
    var deps = ids.map(function (id) {
        return typeof require == 'function' ? require(id) : window[id];
    });
    typeof module !== 'undefined' ? module.exports = factory.apply(null, deps) : factory.apply(null, deps);
}

));