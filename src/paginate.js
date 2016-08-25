(function(store){

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

}(window.store));