/* UMD.define */ (function (root, factory) {
    if (typeof customLoader === 'function'){ customLoader(factory, 'store'); }else if (typeof define === 'function' && define.amd) { define([], factory); } else if (typeof exports === 'object') { module.exports = factory(); } else { root.returnExports = factory(); window.store = factory(); }
}(this, function () {


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



    function after (obj, method, fn) {
        var _old = obj[method];
        obj[method] = function (a,b,c) {
            _old.call(obj, a,b,c);
            fn.call(obj, a,b,c);
        }
    }

    function before (obj, method, fn) {
        var _old = obj[method];
        obj[method] = function (a,b,c) {
            fn.call(obj, a,b,c);
            _old.call(obj, a,b,c);
        }
    }

    function findSelected (arr, multiple) {
        arr = Array.isArray(arr) ? arr : [arr];
        if(multiple){
            return arr.filter(function (item) {
                return item.selected;
            });
        }
        for(var i = 0; i < arr.length; i++){
            if(arr[i].selected){
                return arr[i];
            }
        }
        return null;
    }

    function selection (dataStore) {

        var
            opts = dataStore.options.selection || {},
            multiple = !!opts.multiple,
            selected,
            lastSelected;

        function isSelected (item) {
            if(!Array.isArray(selected)){
                return item === selected;
            }
            for(var i = 0; i < selected.length; i++){
                if(selected[i] === item){
                    return true;
                }
            }
            return false;
        }

        function select (item) {
            // handle item property?
            //item.selected = true;

            if(!multiple){
                dataStore.control = false;
                dataStore.shift = false;
            }

            if(multiple || dataStore.control || dataStore.shift){
                if(!item){
                    return;
                }
                if(dataStore.control || (multiple && !dataStore.shift)) {
                    if (Array.isArray(selected)) {
                        if (selected.indexOf(item) === -1) {
                            selected.push(item);
                            lastSelected = item;
                        }
                        else {
                            return;
                        }
                    }
                    else if(selected){
                        selected = [selected, item];
                    }
                    else {
                        selected = [item];
                    }
                }
                if(dataStore.shift){
                    var
                        a, b, i,
                        lastItem = dataStore.getLastSelected(),
                        lastIndex, itemIndex;

                    if(!lastItem){
                        selected = [item];
                    }else{
                        if(selected && !Array.isArray(selected)){
                            selected = [selected];
                        }
                        lastIndex = dataStore.getIndex(lastItem);
                        itemIndex = dataStore.getIndex(item);
                        if(lastIndex < itemIndex){
                            a = lastIndex;
                            b = itemIndex;
                        }else{
                            b = lastIndex;
                            a = itemIndex;
                        }
                        for(i = a; i <= b; i++){
                            selected.push(dataStore.getItemByIndex(i));
                        }
                    }
                }
            }else{
                //if(selected){
                //    selected.selected = false;
                //}
                selected = item;

            }
            lastSelected = item;
        }

        dataStore.getLastSelected = function () {
            if(lastSelected) {
                return lastSelected;
            }
            if(selected){
                if(Array.isArray(selected)){
                    return selected[selected.length-1];
                }else{
                    return selected;
                }
            }
            return null;
        };

        function unselect (item) {
            // handle item property?
            //item.selected = false;
            if(Array.isArray(selected)){
                selected = selected.filter(function (m) {
                    return m !== item;
                });
            }else if(item === selected){
                selected = null;
            }
        }

        after(dataStore, 'add', function (itemOrItems) {
            var items = findSelected(itemOrItems);
            if(items) {
                select(items);
            }
        });
        after(dataStore, 'set', function (itemOrItems) {
            var items = findSelected(itemOrItems);
            if(items) {
                select(items);
            }
        });
        before(dataStore, 'remove', function (itemOrIdOrItemsOrIds) {
            var arr = Array.isArray(itemOrIdOrItemsOrIds) ? itemOrIdOrItemsOrIds : [itemOrIdOrItemsOrIds];
            arr.forEach(function (itemOrId) {
                var item = typeof itemOrId === 'object' ? itemOrId : dataStore.get(itemOrId);
                if(isSelected(item)){
                    unselect(item);
                }
            });
        });
        after(dataStore, 'clear', function (itemOrItems) {
            selected = null;
        });

        // hasSelectionChanged: can't realistically determine this

        Object.defineProperty(dataStore, 'selection', {
            get: function () {
                if(!selected){
                    return null;
                }
                if(Array.isArray(selected)){
                    return dataStore.query(0, selected);
                }
                // TODO, this may need to be queried as well
                return multiple ? [selected] : selected;

            },
            set: function (itemOrId) {
                function setter (itemOrId) {
                    var item;
                    if (typeof itemOrId !== 'object') {
                        item = dataStore.get(itemOrId);
                    }
                    else {
                        item = itemOrId;
                    }
                    if (selected === item) {
                        return;
                    }

                    select(item);
                }

                if(Array.isArray(itemOrId)){
                    if(!dataStore.control){
                        selected = null;
                    }
                    itemOrId.forEach(setter);

                }else{
                    if(!dataStore.control && !dataStore.shift){
                        selected = null;
                    }
                    setter(itemOrId);
                }
            }
        });
    }

    store.addPlugin('selection', selection, 'mixin');




    // sort:
    // {key:'value', dir: 'asc'} // dir defaults to desc

    var example = "store.query({sort:{dir:'asc', key:'id'}});";

    function sort (items, params, store) {
        var key, result;
        if(!params.sort){
            return items;
        }

        if(params.sort.asc || !params.sort.key){
            console.error('Missing sort params. Did you mean:', example);
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


    return store;

}));