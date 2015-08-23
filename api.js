var map;
var markers = [];
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function initialize() {
	// Longitude and Latitude of the Mapss
	directionsDisplay = new google.maps.DirectionsRenderer();
	var myLatlng = new google.maps.LatLng(3.158371, 101.658016);
	
	// Initialization of the Maps
	var mapOptions = {
		zoom: 12,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	// new Maps object with new functionality
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	// *---------------------- #Waypoints --------------------*
	//Display directions in Maps
	directionsDisplay.setMap(map);

	// *---------------------- #Search Box -------------------*
	// var defaultBounds = new google.maps.LatLngBounds(
	// 	new google.maps.LatLng(-33.8902, 151.1759),
	// 	new google.maps.LatLng(-33.8474, 151.2631));
	// map.fitBounds(defaultBounds);

	// Create the search box and link it to the UI element.
	var input = /** @type {HTMLInputElement} */(
		document.getElementById('pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var searchBox = new google.maps.places.SearchBox(
		/** @type {HTMLInputElement} */(input));

	// Listen for the event fired when the user selects an item from the
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}
		for (var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}

		// For each place, get the icon, place name, and location.
		markers = [];
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			var image = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			var marker = new google.maps.Marker({
				map: map,
				icon: image,
				title: place.name,
				position: place.geometry.location
			});

			markers.push(marker);

			bounds.extend(place.geometry.location);
		}

		map.fitBounds(bounds);
	});

	// Bias the SearchBox results towards places that are within the bounds of the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});
	// *---------------------- # Search Box ------------------------*

	// *----------------------- #Marker ----------------------------*
	// var marker = new google.maps.Marker({
	// 	position: myLatlng,
	// 	map: map,
	// 	title: 'Hello World!'
	// });
	// *----------------------- #Marker ----------------------------*


	// *----------------------- #Multiple Marker --------------------*
	// This event listener will call addMarker() when the map is clicked.
	google.maps.event.addListener(map, 'click', function(event) {
		addMarker(event.latLng);
	});

	// // Adds a marker at the center of the map.
	// addMarker(myLatlng);
}

// Add a marker to the map and push to the array.
function addMarker(location) {
	var marker = new google.maps.Marker({
		position: location,
		map: map
	});
markers.push(marker);
}

// Sets the map on all markers in the array.
function setAllMap(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
	setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
	setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
	clearMarkers();
	markers = [];
	waypts=[];
}
// *----------------------- #Multiple Marker --------------------*
var waypts = [];
var route;
function calcRoute() {
	// var start = document.getElementById('start').value;
	// var end = document.getElementById('end').value;
	// var waypts = [];
	var checkboxArray = document.getElementById('waypoints');
	// for (var i = 1; i < checkboxArray.length; i++) {
	for (var i = 1; i < (markers.length - 1); i++) {
		// if (checkboxArray.options[i].selected == true) {
			waypts.push({
				// location:checkboxArray[i].value,
				// stopover:true
				location: markers[i].position,
				stopover: true
		});
		// }
	}

	var last_element = markers[markers.length - 1];
	var request = {
		origin: markers[0].position,
		destination: last_element.position,
		waypoints: waypts,
		optimizeWaypoints: true,
		// provideRouteAlternatives: true,
		// avoidHighways: true,
		travelMode: google.maps.TravelMode.DRIVING
	};
  
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			route = response.routes[0];
			var summaryPanel = document.getElementById('directions_panel');
			summaryPanel.innerHTML = '';

			var startDate = Date.now();
			var endDate = new Date($('#input_date').val()).getTime();
			var total;

			total = endDate - startDate;
			console.log(startDate + " - " + endDate + " = " + total);
			for (var i = 0; i < route.legs.length; i++) {
				var num = parseInt(route.legs[i].duration.text);
				num = num*60;
				total -=  num;
			}
			console.log(total);
			total = total / (markers.length - 1);
			console.log(total);
			totalInHours = secondsToTime(total/1000)
			console.log(totalInHours);

			startDate = new Date(startDate);
			endDate = new Date(endDate);
			var date = (new Date(startDate).getTime());
			var dateString = "";

			summaryPanel.innerHTML += "First destination arrive at: " + route.legs[0].start_address + "<br>";
			summaryPanel.innerHTML += "At time: " + startDate + "<br><br>";

			// For each route, display summary information.
			for (var i = 0; i < route.legs.length; i++) {
				var routeSegment = i + 1;
				summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment + '</b><br>';
				// summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
				// summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
				summaryPanel.innerHTML += "Distance: " + route.legs[i].distance.text + '<br>';
				summaryPanel.innerHTML += "Will take: " + route.legs[i].duration.text + '<br>';
				var time = date + (parseInt(route.legs[i].duration.text)*60*1000);
				// console.log("Route in min: " + route.legs[i].duration.text + " date: " + date + " time: " + time);
				date = new Date(time).getTime();
				dateString = new Date(date);
				summaryPanel.innerHTML += "Time arrive: " + dateString + "<br>";
				summaryPanel.innerHTML += "You will be stay at: " + route.legs[i].end_address + "<br>";
				summaryPanel.innerHTML += "For about: " + totalInHours.h + " hours" + totalInHours.m + " min<br>";
				date = new Date(date+total).getTime();
				dateString = new Date(date);
				summaryPanel.innerHTML += "You may depart at: " + dateString + "<br><br>";
			}

			// var startDate = Date.now();
			// var endDate = new Date($('#input_date').val()).getTime();
			// var total;

			// total = endDate - startDate;
			// console.log(startDate + " - " + endDate + " = " + total);
			// for (var i = 0; i < route.legs.length; i++) {
			// 	var num = parseInt(route.legs[i].duration.text);
			// 	num = num*60;
			// 	total -=  num;
			// }
			// console.log(total);

			// total = total / (markers.length - 1);

			// console.log(total);

			// startDate = new Date(startDate);
			// endDate = new Date(endDate);

			// var text = "Start Date: " + startDate + "<br>";
			// text += "End Date: " + endDate + "<br>";
			// text += "From " + route.legs[0].start_address + "to";
			// for (var i = 0; i < route.legs.length; i++) {
			// 	text += "From " + route.legs[i].
			// }

			// $('#info').text('Hello!');
		}
	
	deleteMarkers();
	});

}
// *---------------------- #Waypoints --------------------*

function secondsToTime(secs)
{
    var days = Math.floor(secs / 86400)

    var hours = Math.floor(secs / (60 * 60));
   
    var divisor_for_minutes = secs % (60*60);
    var minutes = Math.floor(divisor_for_minutes / 60);
 
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
   
    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

google.maps.event.addDomListener(window, 'load', initialize);