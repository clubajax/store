(function(store){

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
            additive = opts.additive,
            selected;

        function isSelected (item) {
            if(!multiple){
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
            console.log('   sel', item);
            // handle item property?
            if(multiple){
                if(Array.isArray(selected)){
                    selected.push(item);
                }else{
                    selected = [item];
                }
            }else{
                selected = item;
            }

        }

        function unselect (item) {
            // handle item property?
            if(multiple){
                console.log('UNS', item);
                selected = selected.filter(function (m) {
                    return m !== item;
                });
            }else if(item === selected){
                selected = null;
            }
        }

        after(dataStore, 'add', function (itemOrItems) {
            select(findSelected(itemOrItems));
        });
        after(dataStore, 'set', function (itemOrItems) {
            select(findSelected(itemOrItems));
        });
        before(dataStore, 'remove', function (itemOrIdOrItemsOrIds) {
            var arr = Array.isArray(itemOrIdOrItemsOrIds) ? itemOrIdOrItemsOrIds : [itemOrIdOrItemsOrIds];
            console.log(' - selected', selected);
            arr.forEach(function (itemOrId) {
                var item = typeof itemOrId === 'object' ? itemOrId : dataStore.get(itemOrId);
                console.log('rem', item);
                if(isSelected(item)){
                    console.log('IS_SEL');
                    unselect(item);
                }
            });
        });
        after(dataStore, 'clear', function (itemOrItems) {
            selected = null;
        });

        Object.defineProperty(dataStore, 'selection', {
            get: function () {
                // TODO: how to sort results?
                return selected;
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
                    if(!!multiple){
                        if(!additive){
                            selected = null;
                        }
                        itemOrId.forEach(setter);
                    }else{
                        console.error('To make a multi-selection, use `store({plugins: [\'selection\'], multiple:true})`');
                    }
                }else{
                    setter(itemOrId);
                }
            }
        });
    }

    store.addPlugin('selection', selection, 'mixin');

}(window.store));