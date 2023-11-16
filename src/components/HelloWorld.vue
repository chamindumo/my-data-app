<template>
  <div>
 
    
    <button @click="calculateRouteAndGasStations">Calculate Route and Gas Stations</button>
    <button @click="openDrawer">Open Drawer</button>
    <button @click="openWishlistDrawer">Open wishlit</button>
 
 
    <el-drawer
      :visible.sync="drawerVisible"
      :with-header="false"
      size="60%"
      direction="ltr"
    >
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Address</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="gasStation in gasStations" :key="gasStation.place_id">
          <td>{{ gasStation.name }}</td>
          <td>{{ gasStation.vicinity }}</td>
          <td>{{ gasStation.rating || 'N/A' }}</td>
          <td>
          <button @click="showGasStationDetails(gasStation)">Show Details</button>
          <button @click="openGoogleMaps(gasStation)">Open in Google Maps</button>
          <el-button @click="addToWishlist(gasStation)">Add to Wishlist</el-button>
 
        </td>
        </tr>
      </tbody>
    </table>
</el-drawer>
<el-drawer
      :visible.sync="wishlistDrawerVisible"
      :with-header="false"
      size="60%"
      direction="rtl"
    >
      <h3>Your Wishlist</h3>
      <ul>
        <li v-for="wishlistItem in wishlist" :key="wishlistItem.place_id">
          {{ wishlistItem.name }}
        </li>
      </ul>
      <div id="map" style="height: 300px; width: 100%;"></div>

    </el-drawer>
    <div id="map"></div>
  </div>
</template>
 
<script>
export default {
  data() {
    return {
      map: null,
      directionsService: null,
      placesService: null,
      google: null,
      originInput: '',
      destinationInput: '',
      gasStations: [],
      drawerVisible: false, // Add this line to define the drawerVisible property
      wishlistDrawerVisible: false,
      wishlist: [],
      receivedOrigin: '',
      receivedDestination: '',
    };
  },
  mounted() {
    this.receivedOrigin = this.$route.query.origin || '';
    this.receivedDestination = this.$route.query.destination || '';

    // Now you can use these received values as needed
    // For instance, you can assign them to the input fields if desired
    this.originInput = this.receivedOrigin;
    this.destinationInput = this.receivedDestination;
    console.log(this.originInput)
    // Load Google Maps API
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAoS8LDAxSJ78ycaq2diQewFx7L3d0qUWE&libraries=places';
    script.async = true;
    script.defer = true;
    script.onload = this.initMap;
    document.head.appendChild(script);
  },
  methods: {
    initMap() {
      this.google = window.google;
 
      // Initialize map
      this.map = new this.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 8,
      });
 
      // Initialize services
      this.directionsService = new this.google.maps.DirectionsService();
      this.placesService = new this.google.maps.places.PlacesService(document.createElement('div'));
    },
 
    calculateRouteAndGasStations() {
      this.drawerVisible = true;
 
      const origin = this.originInput;
      const destination = this.destinationInput;
 
      // Geocode the origin and destination addresses to get LatLng
      this.geocodeAddress(origin, (originLatLng) => {
        this.geocodeAddress(destination, (destinationLatLng) => {
          // Calculate route
          this.calculateRoute(originLatLng, destinationLatLng);
        });
      });
    },
    addToWishlist(gasStation) {
      this.wishlist.push(gasStation);
      // Optionally, you can add a notification or other user feedback here
    },
    openWishlistDrawer() {
      this.wishlistDrawerVisible = true;
    },
    geocodeAddress(address, callback) {
      const geocoder = new this.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          callback(new this.google.maps.LatLng(location.lat(), location.lng()));
        } else {
          console.error('Geocode was not successful for the following reason:', status);
        }
      });
    },
    showGasStationDetails(gasStation) {
      const origin = this.originInput;
      const destination = new this.google.maps.LatLng(gasStation.geometry.location.lat(), gasStation.geometry.location.lng());
 
      // Calculate route to the gas station
      this.calculateRoute(origin, destination);
 
      // Display the gas station marker on the map
      const gasStationMarker = new this.google.maps.Marker({
        position: destination,
        map: this.map,
        title: gasStation.name,
      });
 
      // Center the map at the gas station location
      this.map.setCenter(destination);
 
      // Info window for the gas station marker
      const infoWindow = new this.google.maps.InfoWindow({
        content: `<div><strong>${gasStation.name}</strong><br>${gasStation.vicinity}</div>`,
      });
 
      // Show info window when marker is clicked
      gasStationMarker.addListener('click', () => {
        infoWindow.open(this.map, gasStationMarker);
      });
    },
 
    openGoogleMaps(gasStation) {
      const origin = encodeURI(this.originInput);
      const destination = encodeURI(`${gasStation.geometry.location.lat()},${gasStation.geometry.location.lng()}`);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
     
      // Open Google Maps in a new tab
      window.open(url, '_blank');
    },
 
    openDrawer() {
      this.drawerVisible = true;
    },
    calculateRoute(origin, destination) {
      const request = {
        origin,
        destination,
        travelMode: 'DRIVING',
      };
 
      this.directionsService.route(request, (response, status) => {
        if (status === 'OK') {
          const path = response.routes[0].overview_path;
          this.segmentRoute(path);
        } else {
          console.error('Error calculating route:', status);
        }
      });
    },
 
    segmentRoute(path) {
      const segmentDistance = 10; // in km
      let accumulatedDistance = 0;
      let segmentPoints = [];
 
      for (let i = 0; i < path.length - 1; i++) {
        const distance = this.google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i + 1]) / 1000; // in km
 
        if (accumulatedDistance + distance < segmentDistance) {
          accumulatedDistance += distance;
        } else {
          const segmentPoint = this.interpolatePoint(path[i], path[i + 1], segmentDistance - accumulatedDistance);
          segmentPoints.push(segmentPoint);
 
          this.searchGasStations(segmentPoint);
          accumulatedDistance = 0;
        }
      }
 
      const polyline = new this.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
 
      polyline.setMap(this.map);
    },
 
    interpolatePoint(start, end, distance) {
      const heading = this.google.maps.geometry.spherical.computeHeading(start, end);
      const latLng = this.google.maps.geometry.spherical.computeOffset(start, distance * 1000, heading);
      return new this.google.maps.LatLng(latLng.lat(), latLng.lng());
    },
 
    searchGasStations(location) {
      const request = {
        location,
        radius: 10000, // 10 km
        types: ['gas_station'],
      };
 
      this.placesService.nearbySearch(request, (results, status) => {
        if (status === 'OK') {
          this.gasStations = [...this.gasStations, ...results];
        }
      });
    },
  },
};
</script>
 
<style>
  #map {
    height: 400px;
  }
 
  table {
    width: 100%;
    margin-top: 20px;
    border-collapse: collapse;
  }
 
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
 
  th {
    background-color: #f2f2f2;
  }
</style>