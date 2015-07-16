Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {

  Template.map.onCreated(function() {

    console.log('Template.map.created');

    GoogleMaps.ready('map', function(map) {

      console.log('map ready');

      google.maps.event.addListener(map.instance, 'click', function(event) {
        Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });

      var markers = {};

      Markers.find().observe({
        added: function (document) {

          console.log('marker added');

          var marker = new google.maps.Marker({
            draggable: false, // true,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            id: document._id
          });

          /* google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          markers[document._id] = marker; */
        },
        changed: function (newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function (oldDocument) {
          markers[oldDocument._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          delete markers[oldDocument._id];
        }
      });
    });
  });

  Meteor.startup(function() {

    console.log('Meteor.startup');

    GoogleMaps.load();

    console.log('GoogleMaps.load returned');

    Meteor.setInterval(
      function () {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(setPosition);
        } else {
          console.log("Geolocation is not supported by this browser.");
        }
      }, 1000);

    function setPosition(position) {
      var lat = Session.get('lat');
      var lng = Session.get('lng');
      var lat2 = position.coords.latitude;
      var lng2 = position.coords.longitude;
      if (lat != lat2 || lng != lng2) {
        console.log(
          'Setting position (was: lat=%d lng=%d) new: lat=%d lng=%d',
          lat, lng, lat2, lng2);
        Session.set('lat', lat2);
        Session.set('lng', lng2);
      }
    }
  });

  Template.map.helpers({

    mapOptions: function() {

      if (GoogleMaps.loaded()) {

        var lat = Session.get('lat');
        var lng = Session.get('lng');
        console.log('mapOptions called lat=%d lng=%d', lat, lng);
        if (lat && lng) {
          return {
            center: new google.maps.LatLng(lat, lng),
            zoom: 18
          };
        }
        else return {
          center: new google.maps.LatLng(0, 0),
          zoom: 0
        };
      }
      else {
        console.log('mapOptions called, Google Maps not ready');
      }
    }
  });
}
