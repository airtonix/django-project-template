angular.module("ex.filters",[]),
	angular.module("ex",["ex.filters"]),
	angular.module("ex.filters").filter("default",function(){return function(r,i){return out=null==r||void 0==r||""==r&&!angular.isNumber(r)?i||"":r}}),
	angular.module("ex.filters").filter("firstNotNull",function(){return function(r){var n=void 0;if(r){var e=r.length-1;for(i=0;e>=i;i++)if(void 0!=r[i])return r[i]}return n}}),
	angular.module("ex.filters").filter("lastNotNull",function(){return function(r){var n=void 0;if(r){var e=r.length-1;for(i=e;i>=0;i--)if(void 0!=r[i])return r[i]}return n}}),
	angular.module("ex.filters").filter("max",function(){return function(r){var i=void 0;if(r)for(var n in r)(r[n]>i||void 0==i)&&(i=r[n]);return i}}),
	angular.module("ex.filters").filter("min",function(){return function(r){var i=void 0;if(r)for(var n in r)(i>r[n]||void 0==i)&&(i=r[n]);return i}});