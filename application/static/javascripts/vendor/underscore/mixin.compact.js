(function(root) {
    "use strict";

    var _ = root._;

    _.mixin({
        compactObject : function(dict) {
             _.each(dict, function(value, key){
                 if(!value) delete dict[key];
             });
             return dict;
        }
    });

})(this);