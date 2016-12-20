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
            multiple = !!dataStore.options.multiple,
            selected;

        function select (item) {
            console.log('   sel', item);
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
            if(multiple){
                selected = selected.filter(function (m) {
                    return m !== item;
                });
            }else if(item === selected){
                selected = null;
            }
        }

        after(dataStore, 'add', function (itemOrItems) {
            console.log('after add:', itemOrItems);
            select(findSelected(itemOrItems));
        });
        after(dataStore, 'set', function (itemOrItems) {
            console.log('after set:', itemOrItems);
            select(findSelected(itemOrItems));
        });
        before(dataStore, 'remove', function (itemOrIdOrItemsOrIds) {
            console.log('after remove:', itemOrIdOrItemsOrIds);
            var arr = Array.isArray(itemOrIdOrItemsOrIds) ? itemOrIdOrItemsOrIds : [itemOrIdOrItemsOrIds];
            arr.forEach(function (itemOrId) {
                var item = typeof itemOrId === 'string' ? dataStore.get(itemOrId) : itemOrId;
                if(item.selected){
                    unselect(item);
                }
            });
        });
        after(dataStore, 'clear', function (itemOrItems) {
            console.log('after clear:', itemOrItems);
            selected = null;
        });

        // TODO: multiple
        Object.defineProperty(dataStore, 'selection', {
            get: function () {
                return selected;
            },
            set: function (itemOrId) {
                var item;
                if(typeof itemOrId !== 'object'){
                    item = dataStore.get(itemOrId);
                }else{
                    item = itemOrId;
                }
                if(selected === item){
                    return;
                }
                // handle item property?
                selected = item;
            }
        });
    }

    store.addPlugin('selection', selection, 'mixin');

}(window.store));