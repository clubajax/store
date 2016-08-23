(function(store){


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

}(window.store));