(function(store){

    function addFilter (instance) {
        instance.filter = function (key, value) {
            var i, items = [];
            for(i = 0; i < this.items.length; i++){
                if(this.items[i][key] === value){
                    items.push(this.items[i]);
                }
            }
            return items;
        }
    }

    store.addPlugin('filter', addFilter);

}(window.store));