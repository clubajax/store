(function(store){


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

}(window.store));