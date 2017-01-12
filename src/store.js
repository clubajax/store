(function () {

    'use strict';

    function store(options) {
        options = options || {};
        var
            defaults = {
                identifier: 'id'
            },
            plugins = [],
            lastParams = '',
            currentParams = {},
            lastQueriedItems,
            dataStore,
            changes = true;

        options.identifier = options.identifier || defaults.identifier;

        dataStore = {

            identifier: options.identifier,

            get: function (value, optionalIdentifier) {
                // always returns one item or null
                if (!value || !this.items) {
                    return null;
                }
                var i, key = optionalIdentifier || options.identifier;
                value += '';
                for (i = 0; i < this.items.length; i++) {
                    if (this.items[i][key]+'' === value) {
                        return this.items[i];
                    }
                }
                return null;
            },

            set: function (items) {
                // sets all items - overwrites existing items, if any
                this.clear();
                if(!items){
                    this.items = [];
                }
                else if(!Array.isArray(items)){
                    this.items = [items];
                }
                else {
                    this.items = items.concat([]);
                }
                lastParams = '';
                currentParams = {};
                changes = true;
            },

            getIndex: function (item) {
                if(typeof item !== 'object'){
                    item = this.get(item);
                }
                var items = lastQueriedItems || this.items;
                return items.indexOf(item);
            },

            getItemByIndex: function (index) {
                var items = lastQueriedItems || this.items;
                return items[index];
            },

            add: function (itemOrItems) {
                // add item or items to existing
                if (!this.items) {
                    return this.set(itemOrItems);
                }
                if (Array.isArray(itemOrItems)) {
                    this.items = this.items.concat(itemOrItems);
                }
                else {
                    this.items.push(itemOrItems);
                }
                lastParams = '';
                currentParams = {};
                changes = true;
            },

            remove: function (itemsOrIdOrIds) {
                // Removes an item or items. Expects: an ID, an item, an array of IDs, or an array of items.
                var
                    i, k, items = this.items,
                    key = options.identifier,
                    arr = Array.isArray(itemsOrIdOrIds) ? itemsOrIdOrIds : [itemsOrIdOrIds],
                    isId = typeof arr[0] === 'string' || typeof arr[0] === 'number';

                for (i = 0; i < arr.length; i++) {
                    for (k = items.length - 1; k >= 0; k--) {
                        if ((isId && arr[i] === items[k][key]) || (arr[i] === items[k])) {
                            items.splice(k, 1);
                            k = items.length - 1;
                            break;
                        }
                    }
                }
                lastParams = '';
                currentParams = {};
                changes = true;
            },

            clear: function () {
                // resets internally.
                this.items = [];
                lastParams = '';
                currentParams = {};
                changes = true;
            },

            fetch: function () {
                console.error('please use query');
            },

            get hasListChanged () {
                return changes;
            },

            query: function (params, altItems) {
                //this.params = {
                //    filter:{
                //
                //    },
                //    sort: {
                //
                //    },
                //    paginate: {
                //
                //    }
                //};
                if (!this.items && !altItems) {
                    return [];
                }

                var i,
                    strParams,
                    items = altItems ? altItems.concat([]) : this.items.concat([]);

                currentParams = mix(currentParams, params);
                strParams = JSON.stringify(currentParams);
                if (items && !altItems && strParams === lastParams && lastQueriedItems) {
                    return lastQueriedItems;
                }

                for (i = 0; i < plugins.length; i++) {
                    items = plugins[i](items, currentParams, this);
                }
                if(!altItems) {
                    lastParams = strParams;
                    lastQueriedItems = items;
                    changes = false;
                }
                return items;
            },

            load: function (url) {
                // memory store, fetch initial data
                // need loaded, or is ready?
            }
        };

        dataStore.options = options; // for plugins access

        toArray(options.plugins).forEach(function (pluginName) {
            var
                i,
                plugin = store.plugins[pluginName],
                order;

            if (!plugin) {
                throw Error('plugin not found: ' + pluginName);
            }

            order = plugin.order;

            if (order === 'mixin') {
                plugin(dataStore);
                return;
            }

            if (!plugins.length) {
                plugins.push(plugin);
            }
            else if (plugins.length === 1) {
                if (plugins[0].order <= order) {
                    plugins.push(plugin);
                }
                else {
                    plugins.unshift(plugin);
                }
            }
            else if (plugins[0].order > order) {
                // is first
                plugins.unshift(plugin);
            }
            else {
                // is between first and last
                for (i = 1; i < plugins.length; i++) {
                    if (order === plugins[i - 1].order || (order > plugins[i - 1].order && order < plugins[i].order)) {
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

    function mix(o, p) {
        if (p) {
            Object.keys(p).forEach(function (key) {
                o[key] = p[key];
            });
        }
        return o;
    }

    function toArray(object) {
        if (!object) {
            return [];
        }
        if (Array.isArray(object)) {
            return object;
        }
        if (typeof object === 'string') {
            return object.split(',').map(function (s) {
                return s.trim();
            })
        }
        console.warn('unknown plugins type:', object);
        return [];
    }

    window.store = store;

}(window));