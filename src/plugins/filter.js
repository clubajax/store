(function(store){

    function filter (items, params, store) {
        var i, filtered = [], value;
        if(!params.filter){
            return items;
        }
        for(i = 0; i < items.length; i++){
            Object.keys(params.filter).forEach(function (key) {
                value = params.filter[key];
                if(items[i][key] === value){
                    filtered.push(items[i]);
                }
            });
        }
        return filtered;
    }

    store.addPlugin('filter', filter, 10);

}(window.store));