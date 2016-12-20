(function(store){


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

}(window.store));