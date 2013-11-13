/*! angular-leaflet-directive 18-06-2013 */
var leafletDirective=angular.module("leaflet-directive",[]);leafletDirective.directive("leaflet",["$http","$log","$parse",function(a,b,c){var d={maxZoom:14,tileLayer:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",tileLayerOptions:{},icon:{url:"http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon.png",retinaUrl:"http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-icon@2x.png",size:[25,41],anchor:[12,40],popup:[0,-40],shadow:{url:"http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png",retinaUrl:"http://cdn.leafletjs.com/leaflet-0.5.1/images/marker-shadow.png",size:[41,41],anchor:[12,40]}},path:{weight:10,opacity:1,color:"#0000ff"}};return{restrict:"E",replace:!0,transclude:!0,scope:{center:"=center",maxBounds:"=maxbounds",markers:"=markers",defaults:"=defaults",paths:"=paths"},template:'<div class="angular-leaflet-map"></div>',link:function(a,e,f){function g(){a.maxBounds&&a.maxBounds&&a.maxBounds.southWest&&a.maxBounds.southWest.lat&&a.maxBounds.southWest.lng&&a.maxBounds.northEast&&a.maxBounds.northEast.lat&&a.maxBounds.northEast.lng&&(p.setMaxBounds(new L.LatLngBounds(new L.LatLng(a.maxBounds.southWest.lat,a.maxBounds.southWest.lng),new L.LatLng(a.maxBounds.northEast.lat,a.maxBounds.northEast.lng))),a.$watch("maxBounds",function(a){a.southWest&&a.northEast&&a.southWest.lat&&a.southWest.lng&&a.northEast.lat&&a.northEast.lng&&p.setMaxBounds(new L.LatLngBounds(new L.LatLng(a.southWest.lat,a.southWest.lng),new L.LatLng(a.northEast.lat,a.northEast.lng)))}))}function h(){a.$watch("center",function(c){return c?(c.lat&&c.lng&&c.zoom?p.setView([c.lat,c.lng],c.zoom):c.autoDiscover===!0&&p.locate({setView:!0,maxZoom:a.leaflet.maxZoom}),void 0):(b.warn("[AngularJS - Leaflet] 'center' is undefined in the current scope, did you forget to initialize it?"),void 0)},!0),p.on("dragend",function(){a.$apply(function(a){s.lat.assign(a,p.getCenter().lat),s.lng.assign(a,p.getCenter().lng)})}),p.on("zoomend",function(){angular.isUndefined(a.center)&&b.warn("[AngularJS - Leaflet] 'center' is undefined in the current scope, did you forget to initialize it?"),(angular.isUndefined(a.center)||a.center.zoom!==p.getZoom())&&a.$apply(function(a){s.zoom.assign(a,p.getZoom()),s.lat.assign(a,p.getCenter().lat),s.lng.assign(a,p.getCenter().lng)})})}function i(){var b={};if(a.leaflet.markers=f.testing?b:'Add testing="testing" to <leaflet> tag to inspect this object',a.markers){for(var c in a.markers)b[c]=j(c,a.markers[c],p);a.$watch("markers",function(a){for(var c in a)void 0===b[c]&&(b[c]=j(c,a[c],p));for(var d in b)void 0===a[d]&&delete b[d]},!0)}}function j(b,c,d){var e=k(b,c);return d.addLayer(e),c.focus===!0&&e.openPopup(),e.on("dragend",function(){a.$apply(function(){c.lat=e.getLatLng().lat,c.lng=e.getLatLng().lng}),c.message&&e.openPopup()}),a.$watch("markers."+b,function(a,b){return a?(b&&(void 0!==a.draggable&&a.draggable!==b.draggable&&(a.draggable===!0?e.dragging.enable():e.dragging.disable()),void 0!==a.focus&&a.focus!==b.focus&&(a.focus===!0?e.openPopup():e.closePopup()),void 0!==a.message&&a.message!==b.message&&e.bindPopup(a),(a.lat!==b.lat||a.lng!==b.lng)&&e.setLatLng(new L.LatLng(a.lat,a.lng))),void 0):(d.removeLayer(e),void 0)},!0),e}function k(b,c){var d=new L.marker(a.markers[b],{icon:l(),draggable:c.draggable?!0:!1});return c.message&&d.bindPopup(c.message),d}function l(){return L.icon({iconUrl:d.icon.url,iconRetinaUrl:d.icon.retinaUrl,iconSize:d.icon.size,iconAnchor:d.icon.anchor,popupAnchor:d.icon.popup,shadowUrl:d.icon.shadow.url,shadowRetinaUrl:d.icon.shadow.retinaUrl,shadowSize:d.icon.shadow.size,shadowAnchor:d.icon.shadow.anchor})}function m(){var c={};if(a.leaflet.paths=f.testing?c:'Add testing="testing" to <leaflet> tag to inspect this object',a.paths){b.warn("[AngularJS - Leaflet] Creating polylines and adding them to the map will break the directive's scope's inspection in AngularJS Batarang");for(var d in a.paths)c[d]=n(d,a.paths[d],p);a.$watch("paths",function(a){for(var b in a)void 0===c[b]&&(c[b]=n(b,a[b],p));for(var d in c)void 0===a[d]&&delete c[d]},!0)}}function n(b,c,e){var f=new L.Polyline([],{weight:d.path.weight,color:d.path.color,opacity:d.path.opacity});if(void 0!==c.latlngs){var g=o(c.latlngs);f.setLatLngs(g)}return void 0!==c.weight&&f.setStyle({weight:c.weight}),void 0!==c.color&&f.setStyle({color:c.color}),void 0!==c.opacity&&f.setStyle({opacity:c.opacity}),e.addLayer(f),a.$watch("paths."+b,function(a,b){if(!a)return e.removeLayer(f),void 0;if(b){if(void 0!==a.latlngs&&a.latlngs!==b.latlngs){var c=o(a.latlngs);f.setLatLngs(c)}void 0!==a.weight&&a.weight!==b.weight&&f.setStyle({weight:a.weight}),void 0!==a.color&&a.color!==b.color&&f.setStyle({color:a.color}),void 0!==a.opacity&&a.opacity!==b.opacity&&f.setStyle({opacity:a.opacity})}},!0),f}function o(a){var b=a.filter(function(a){return!!a.lat&&!!a.lng}).map(function(a){return new L.LatLng(a.lat,a.lng)});return b}a.leaflet={},a.leaflet.maxZoom=f.defaults&&a.defaults&&a.defaults.maxZoom?parseInt(a.defaults.maxZoom,10):d.maxZoom;var p=new L.Map(e[0],{maxZoom:a.leaflet.maxZoom});if(p.setView([0,0],1),a.leaflet.tileLayer=f.defaults&&a.defaults&&a.defaults.tileLayer?a.defaults.tileLayer:d.tileLayer,a.leaflet.map=f.testing?p:'Add testing="testing" to <leaflet> tag to inspect this object',a.defaults&&a.defaults.tileLayerOptions)for(var q in a.defaults.tileLayerOptions)d.tileLayerOptions[q]=a.defaults.tileLayerOptions[q];var r=L.tileLayer(a.leaflet.tileLayer,d.tileLayerOptions);r.addTo(p),a.leaflet.tileLayerObj=f.testing?r:'Add testing="testing" to <leaflet> tag to inspect this object',h(),g(),i(),m();var s={lat:c("center.lat"),lng:c("center.lng"),zoom:c("center.zoom")}}}}]);