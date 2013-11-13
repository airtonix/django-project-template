(function(root) {
	var _ = root._;

	_.mixin({
		// _.delegator(cases, defaultCaseKey [, thisArg])
		// Returns a function object that acts as a delegator for a method look-up object.
		// Use as a configurable replacement for switch statements.
		//
		// cases: Required. Object containing method functions.
		// defaultCaseKey: Required. Name of key containing default method function.
		//		Default case is used when no case key is provided,
		//		or when provided case key is not found in cases object.
		// thisArg: Optional. "this" argument to be used as context for case method function evaluation.
		//
		// Returned delegator function uses its first argument as the case key.
		// All other arguments passed to the delegator function
		// are passed directly through to the delegate method.
		//
		// Inspired by and substantially copied from https://github.com/rwldrn/idiomatic.js/
		delegator: function(cases, defaultCaseKey, thisArg) {
			var delegator;

			// create delegator function
			delegator = function() {
				var args, caseKey, delegate;

				// transform arguments list into an array
				args = [].slice.call(arguments);

				// shift the case key from the arguments
				caseKey = args.shift();

				// assign default delegate
				delegate = cases[defaultCaseKey];

				// derive delegate method based on caseKey
				if (caseKey && cases[caseKey]) {
					delegate = cases[caseKey];
				}

				// thisArg is undefined if not supplied
				return delegate.apply(thisArg, args);
			};

			// add delegator methods
			// getter/setter methods to access delegator initialization parameters
			delegator.cases = function(obj) {
				if (!obj) {	return cases; }
				cases = obj;
			};
			delegator.defaultCaseKey = function(key) {
				if (!key) {	return defaultCaseKey; }
				defaultCaseKey = key;
			};
			delegator.thisArg = function(obj) {
				if (!obj) {	return thisArg; }
				thisArg = obj;
			};

			// utility methods
			delegator.extendCases = function(obj) {
				_.extend(cases, obj);
			};
			delegator.hasCase = function(key) {
				return _.isFunction(cases[key]);
			};

			return delegator;
		},

		// _.collate(array, propertyName)
		// Will organize a flat array of items into an array of grouped arrays of items
		// while maintaining the original array order.
		//
		// array: Required. The array of items to collate.
		// propertyName: Required. The propertyName on which to collate each item.
		//		propertyName argument may be a string, a number, a function,
		//		or an array of strings, numbers, and/or functions.
		//		If propertyName is a function, items will be grouped on the function return value.
		//		propertyName functions will be called with two arguemnts: item, index.
		collate: function (array, propertyName) {
			var keys = [].concat(propertyName),
				key = keys.shift(),
				result = [],
				group,
				lastValue;

			// return the array argument if key argument is null or undefined
			if (key == null) { return array; }

			// return an empty array if array argument is empty or null or undefined
			if (array == null || !array.length) { return result; }

			_.each(array, function (item, index) {
				// if item[key] does not match the last value,
				// or if this is the first item, reset the group array
				if (!(index && (_.isFunction(key) ? key(item, index) : item[key]) === lastValue)) {
					// if this is not the first item, save the current group
					// and call collate on it if there are additional keys
					if (index) { result.push(keys.length ? _.collate(group, keys) : group); }
					group = [];
				}

				// push the current item onto the current group
				group.push(item);

				// set the cached lastValue to the current item
				lastValue = (_.isFunction(key) ? key(item, index) : item[key]);
			});

			// save the final group
			// call collate on it if there are additional keys
			result.push(keys.length ? _.collate(group, keys) : group);

			return result;
		}
	});
})(this);