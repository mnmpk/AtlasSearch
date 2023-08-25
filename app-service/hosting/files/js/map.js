
var map;
var markers = [];
var circle;
function initMap() {
  var mapProp = {
    center: new google.maps.LatLng(22.3193, 114.1694),
    zoom: 10,
  };
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}
// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function addMarker(item){
    if (map && item.location) {
        var marker = new google.maps.Marker({ map: map, position: { lat: item.location.coordinates[1], lng: item.location.coordinates[0] } });
        markers.push(marker);
      }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
function getViewPort(){
    var lat0 = map.getBounds().getNorthEast().lat();
    var lng0 = map.getBounds().getNorthEast().lng();
    var lat1 = map.getBounds().getSouthWest().lat();
    var lng1 = map.getBounds().getSouthWest().lng();
    return [[lng1,lat1],[lng0,lat0]];
}