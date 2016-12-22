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
                        for(i = a + 1; i <= b; i++){
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

        Object.defineProperty(dataStore, 'selection', {
            get: function () {
                if(Array.isArray(selected)){
                    return dataStore.query(0, selected);
                }
                // TODO, this may need to be queried as well
                return [selected];

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

}(window.store));