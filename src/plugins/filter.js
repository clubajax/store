(function(store){


    // simple filter:
    // {type:'alpha'}
    // OR filter
    // {type:'alpha||beta'}
    // AND filter
    // {type: 'alpha', category: 'greek'}

    function filter (items, params, store) {
        var i, filtered = [], value;
        if(!params.filter){
            return items;
        }
        for(i = 0; i < items.length; i++){
            Object.keys(params.filter).forEach(function (key) {
                value = params.filter[key];
                if(value.indexOf('||') > -1){
                    value.split('||').forEach(function (v) {
                        v = v.trim();
                        if (items[i][key] === v) {
                            filtered.push(items[i]);
                        }
                    });

                }else {
                    if (items[i][key] === value) {
                        filtered.push(items[i]);
                    }
                }
            });
        }
        return filtered;
    }

    store.addPlugin('filter', filter, 10);

}(window.store));