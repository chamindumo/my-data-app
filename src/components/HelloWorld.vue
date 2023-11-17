<template>
  <div>
 
    
    <button @click="calculateRouteAndGasStations">Calculate Route and Gas Stations</button>
    <button @click="openDrawer">Open Drawer</button>
    <button @click="openWishlistDrawer">Open wishlit</button>
 
 
    <table v-show="!drawerVisible">
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
    <table v-show="showDetailsTable"> <!-- Table visible when showDetailsTable is true -->
      <thead>
        <tr>
          <th>Name</th>
          <th>Place name</th>
          <th>Type</th>
          <th>Address</th>
          <th>Action</th>

          <!-- Other table headers -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in fetchedData" :key="item.id">
          <td>{{ item.nameOfPlace }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.vicinity }}</td>
          <td>
            <button @click="deleteItem(item.proid)">Delete</button>
          </td>


          <!-- Display other details within the table rows -->
        </tr>
      </tbody>
    </table>
    <table v-show="drawerVisible">
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="wishlistItem in gasStationsFromDB" :key="wishlistItem.place_id">
          <td>{{ wishlistItem.nameOfPlace }}</td>
          <td>
            <button @click="showGasStationDetails(wishlistItem)">Show Details</button>
            <button @click="openGoogleMaps(wishlistItem)">Open in Google Maps</button>
          </td>
          <td>
          <select v-model="selectedAction">
            <option value="gas_station">Gas Station</option>
            <option value="hotel">Hotel</option>
            <option value="atm">ATM</option>
            <option value="restaurant">Restaurant</option>
          </select>
          <button @click="performAction(selectedAction, wishlistItem.nameOfPlace)">Go</button>
        </td>
        </tr>
      </tbody>
    </table>
      <el-drawer
      :visible.sync="wishlistDrawerVisible"
      :with-header="false"
      size="60%"
      direction="rtl"
    >
        <div id="map"></div>
        </el-drawer>
  </div>
</template>
 
<script>
import axios from 'axios';
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
      places:'',
      location:'',
      gasStationsFromDB: [], // Store fetched data from the database
      showDetailsTable: false, // Toggle for displaying the table
      fetchedData: [], 

    };
  },
  mounted() {
    this.receivedOrigin = this.$route.query.origin || '';
    this.receivedDestination = this.$route.query.destination || '';
    this.places = this.$route.query.selectedPlaceType || '';

    // Now you can use these received values as needed
    // For instance, you can assign them to the input fields if desired
    this.originInput = this.receivedOrigin;
    this.destinationInput = this.receivedDestination;
    this.location = this.place;

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
      this.calculateRouteAndGasStations();

      // Initialize services
      this.directionsService = new this.google.maps.DirectionsService();
      this.placesService = new this.google.maps.places.PlacesService(document.createElement('div'));
    },
    async deleteItem(itemId) {
      try {
        // Make a DELETE request to your API endpoint to delete the item by its ID
        await axios.delete(`https://localhost:7041/api/Product/${itemId}`);
        
        // Remove the deleted item from the displayed table by filtering the fetchedData
        this.fetchedData = this.fetchedData.filter(item => item.id !== itemId);
      } catch (error) {
        console.error('Error deleting item:', error);
        // Handle error deleting item
      }
    },
   async performAction(action,wishlist) {
      console.log(action)
      console.log(wishlist)
      try {
        const response = await axios.get(`https://localhost:7041/api/Product/2?productId=${wishlist}&type=${action}`);
        this.fetchedData = response.data; // Assign fetched data to fetchedData array
        this.showDetailsTable = true; // Show the table
        console.log(this.fetchedData)
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error fetching data
      }
    },

    calculateRouteAndGasStations() {
      this.drawerVisible = false;
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
      this.$store.commit('addToWishlist', gasStation);
      this.$router.push({ name: 'WishList' });
},
    openWishlistDrawer() {
      this.drawerVisible = !this.drawerVisible;
    this.fetchGasStationsFromDB();
    },

    async fetchGasStationsFromDB() {
  try {
    const response = await axios.get('https://localhost:7041/api/Product');
    const gasStationsData = response.data; // Assuming the response contains an array of gas station objects

    // Filter out duplicates based on nameOfPlace
    const uniqueGasStations = {};
    const filteredGasStations = gasStationsData.filter((station) => {
      if (!uniqueGasStations[station.nameOfPlace]) {
        uniqueGasStations[station.nameOfPlace] = true;
        return true;
      }
      return false;
    });

    this.gasStationsFromDB = filteredGasStations;
  } catch (error) {
    console.error('Error fetching gas stations:', error);
    // Handle error fetching data
  }
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
      this.wishlistDrawerVisible = true;
      const origin = this.originInput;
      const destination = new this.google.maps.LatLng(gasStation.geometry.location.lat(), gasStation.geometry.location.lng());
      this.map = new this.google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 8,
      });
 
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
        types: [this.location],
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