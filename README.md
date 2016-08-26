# Store

Data store for searching, sorting, and paginating items.

Store uses UMD, so it will work with globals, AMD, or CommonJS module exports.

## Getting Started

To install using bower:

	bower install clubajax/store --save

You may also use `npm` if you prefer. Or, you can clone the repository with your generic clone commands as a standalone 
repository or submodule.

	git clone git://github.com/clubajax/store.git

It is recommended that you set the config.path of RequireJS to make `store` accessible as an
absolute path.

Store has no dependencies.

## Description

Store can be used as a central repository for list of items. Individual items can be retrieved, or multiple items can be fetched.

## Docs

### Initialize store

To create a store:

    var dataStore = store(options); // returns an instance of a store object
    
`options` is an optional object. Possible parameters are:

 * `identifier` - store defaults to using "id". If you wish to use something else, like "name", pass it here.
 * `plugins` - An array of strings or a comma delineated string of plugin names.
 
### Methods

 * `set(array)` - Initializes data. Expects an array of object-items. If items in the store exist, they will be cleared.
 * `add(arrayOrItem)` - Add an item or items to the store. They are added to existing items.
 * `remove(thinger)` - Removes an item or items. Expects: an ID, an item, an array of IDs, or an array of items.
 * `get(id, optionalIdentifier)` - Get an item via the passed ID. The second parameter can be used to get an item via a different property (such as `selected`)
 * `remove(thinger)` - Removes an item or items. Expects: an ID, an item, an array of IDs, or an array of items.
 * `clear()` - Removes items and resets internally.
 * `fetch(params)` - Get items based on passed criteria. See below.
 
### fetch()

Get items based on passed criteria. Without passing params, it will return all items. If there are no plugins, it will 
return all items.

The params are objects within objects.

    dataStore.fetch({
        paginate:{
            start: 5,
            count: 5
        }
    });
        
The params are cached, so if you fetch a second time without any parameters, the same results will return. In fact, the 
plugins won't be called, because if the params don't change, the previous set of items will be returned. To clear a param,
null should be passed. The following example clear all previous params and will return the original set of items:

    {
        filter:null,
        sort:null,
        paginate: null
    }

#### sort

To get items sorted, the params would look like:

    var dataStore = store({plugins:['sort']});
    dataStore.set(items);
    dataStore.fetch({
        sort:{
            key: 'value', 
            dir:'asc'
        }
    });
  
`sort` takes two properties: `key`, which is the property name on which you sort, and optionally `dir`, which defaults to 
descending; "asc" will sort ascending.

#### filter

This example will return all items that have a `type` property of "alpha". 

    var dataStore = store({plugins:['filter']});
    dataStore.set(items);
    dataStore.fetch({
        filter:{
            type: 'alpha'
        }
    });
    
To sort via OR, use two pipes. This example will return all items that have a `type` property of "alpha" or "beta".

    filter:{
        type: 'alpha||beta'
    }
    
To sort via AND, use multiple properties. This example will return all items that have a `type` property of "alpha" or a category of "greek".

    filter:{
        type: 'alpha',
        category: 'greek'
    }
    
You can filter using AND and OR together.

#### paginate

This example will return the second five items in the store:

    var dataStore = store({plugins:['paginate']});
    dataStore.set(items);
    dataStore.fetch({
        paginate:{
            start: 5,
            count: 5
        }
    });
    
#### Using multiple plugins

Example of using multiple plugins:

    var dataStore = store({plugins: 'sort,filter,paginate'});
    dataStore.set(items);
    dataStore.fetch({
        filter:{type:'alpha'},
        sort:{key: 'value', dir:'asc'},
        paginate: {start: 0, count: 5}
    });
    
### Writing plugins

A plugin is a function that operates on data. A copy of the store's items are passed to it along with all of the params, 
and the store itself:

    function customPlugin (items, params, storeInstance) {
        // do stuff
        return items;
    }
    
To add a plugin to the store, use the addPlugin method that is attached to the store factory function:

    store.addPlugin('customPlugin', customPlugin, 50);
    
The first argument is the plugin name, the second the function, and the third is the priority in which this plugin should 
be called. For example, the returned items will be different if `sort` is called before `filter` and vice versa. If the 
plugin has the same priority as another, it will be sequenced in order in which they were added. 

## License

This uses the [MIT license](./LICENSE). Feel free to use, and redistribute at will.