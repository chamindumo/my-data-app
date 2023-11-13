<template>
  <div id="app">
    <h2>Find Places Between Locations</h2>
    <label for="location1">Location 1:</label>
    <input v-model="location1" id="location1" type="text" />
    <br />

    <label for="location2">Location 2:</label>
    <input v-model="location2" id="location2" type="text" />
    <br />
    <label for="location2">Location 3:</label>
    <input v-model="location3" id="location3" type="text" />
    <br />
    <label for="choice">Choice:</label>
    <select v-model="selectedChoice" id="choice">
      <option value="">Select a choice</option>
      <option v-for="(choice, index) in choices" :value="choice" :key="index">{{ choice }}</option>
    </select>
    <br />

    <button @click="searchPlaces">Search</button>
    <button @click="updateCurrentLocationMarker">current</button>
    <button @click="openDrawer('searchResults')">Open Drawer</button>
    <button @click="openwishlist">Open Wish List</button>

    <div id="map"></div>
    <el-drawer title="Search Results" :visible.sync="drawerVisible" size="50%">
      <div v-if="mergedPaginatedPlaces.length > 0">
        <h3>Search Results</h3>
        <table>
          <thead>
            <tr>
              <th> Name</th>
              <th>Address</th>
              <th>Distance (km)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(place, index) in paginatedPlaces" :key="index">
              <td>
                <img :src="place.icon" alt="Place Icon" style="width: 20px; height: 20px; margin-right: 5px;" />
                {{ place.name }}
              </td>
              <td>{{ place.formatted_address }}</td>
              <td>{{ place.distance.toFixed(2) }}</td>
              <td>
                <button @click="Directions(place)">Details</button>
                <button @click="addToWishlist(place)">Add to Wishlist</button>
                <button @click="showDirections(place)">Open Map</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <button @click="changePage(-1)" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }}</span>
          <button @click="changePage(1)" :disabled="currentPage * resultsPerPage >= mergedPaginatedPlaces.length">
            Next
          </button>
        </div>
      </div>
    </el-drawer>
    <el-drawer title="Wishlist" :visible.sync="wishlistDrawerVisible" size="50%">
      <h3>Wishlist</h3>
      <ul>
        <li v-for="(item, index) in wishlist" :key="index">
          {{ item.name }} - {{ item.distance.toFixed(2) }} km
        </li>
      </ul>
    </el-drawer>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      location1: '',
      location2: '',
      location3: '',
      selectedChoice: '',
      choices: [
        'coffee shop',
        'atm',
        'restaurants',
        'hotels',
        'gas stations',
        'supermarkets',
        'parks',
        'gyms',
        'hospitals',
        'museums',
        'libraries',
        'gyms',
      ],
      placesResponse: null,
      placesResponse1: null,
      fromLocation: null,
      resultsPerPage: 10,
      currentPage: 1,
      map: null,
      currentLocationMarker: null,
      wishlist: [],
      showMap: false,
      drawerVisible: false,
      wishlistDrawerVisible: false,
      mergedPaginatedPlaces: [],
      endlocation:null,
    };
  },
  watch: {
    fromLocation: 'initMap',
  },
  computed: {
    paginatedPlaces() {
      const startIndex = (this.currentPage - 1) * this.resultsPerPage;
    let endIndex = startIndex + this.resultsPerPage;

    const totalResults = this.mergedPaginatedPlaces.length;
    if (endIndex > totalResults) {
      endIndex = totalResults;
    }

    return this.mergedPaginatedPlaces.slice(startIndex, endIndex);
    },
    paginatedPlaces1() {
      if (!this.placesResponse1) return [];

      const startIndex = (this.currentPage - 1) * this.resultsPerPage;
      let endIndex = startIndex + this.resultsPerPage;

      const totalResults = this.placesResponse1.results.length;
      if (endIndex > totalResults) {
        endIndex = totalResults;
      }

      return this.placesResponse1.results
        .map(place => ({
          ...place,
          distance: this.calculateDistance(this.fromLocation, place.geometry.location),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(startIndex, endIndex);
    },
  


  },
  methods: {
    calculateDistance(location1, location2) {
      const radiusOfEarth = 6371;

      const lat1 = this.deg2rad(location1.lat);
      const lon1 = this.deg2rad(location1.lng);
      const lat2 = this.deg2rad(location2.lat);
      const lon2 = this.deg2rad(location2.lng);

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;

      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = radiusOfEarth * c;

      return distance;
    },
    addToWishlist(place) {
      if (!this.isInWishlist(place)) {
        this.wishlist.push({
          name: place.name,
          distance: place.distance,
        });
        console.log(`Added ${place.name} to wishlist!`);
        this.wishlistDrawerVisible = true;
      } else {
        console.log(`${place.name} is already in the wishlist.`);
      }
    },
    isInWishlist(place) {
      return this.wishlist.some(item => item.name === place.name);
    },
    updateCurrentLocationMarker() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.updateMarker(this.currentLocationMarker, currentLocation);
          },
          error => {
            console.error('Error getting current location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    },
       calculateAndMergeResults() {
      const paginatedPlaces = [];
      const placesResponse1Results = this.placesResponse1.results || [];
      const placesResponseResults = this.placesResponse.results || [];
console.log(paginatedPlaces)
      const calculatedPlacesResponse = placesResponseResults.map(place => ({
        ...place,
        distance: this.calculateDistance(this.fromLocation, place.geometry.location),
      }));  

      const calculatedPlacesResponse1 = placesResponse1Results.map(place => ({
        ...place,
        distance: this.calculateDistance(this.fromLocation, place.geometry.location),
      }));
     
      const mergedResults = [...calculatedPlacesResponse, ...calculatedPlacesResponse1];

      const filteredResults = mergedResults
      .filter(place =>
      this.isBeforeOrAfterLocation(place.geometry.location, this.fromLocation, this.endlocation)
      
      )
      .filter((place, index, self) =>
        index === self.findIndex(p => p.name === place.name)
      ); 

    console.log(filteredResults)
      console.log(mergedResults.sort((a, b) => a.distance - b.distance))
      
      return this.mergedPaginatedPlaces= filteredResults.sort((a, b) => a.distance - b.distance);
    },
    openDrawer(type) {
      if (type === 'searchResults') {
        this.drawerVisible = true;
      } else if (type === 'wishlist') {
        this.wishlistDrawerVisible = true;
      }
    },
    openwishlist() {
      this.wishlistDrawerVisible = true;
    },
    updateMarker(marker, location) {
      if (!marker) {
        marker = new window.google.maps.Marker({
          position: location,
          map: this.map,
          title: 'Current Location',
        });
        this.currentLocationMarker = marker;
      } else {
        marker.setPosition(location);
      }
      this.map.setCenter(location);
    },
    Directions(place) {
      if (this.fromLocation) {
        this.showMap = true;
        const mapContainer = document.getElementById('map');

        if (mapContainer) {
          this.map = new window.google.maps.Map(mapContainer, {
            center: { lat: this.fromLocation.lat, lng: this.fromLocation.lng },
            zoom: 60,
          });

          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({ map: this.map });

          const request = {
            origin: this.location1,
            destination: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
            travelMode: 'DRIVING',
          };

          directionsService.route(request, (result, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            } else {
              console.error('Error getting directions:', status);
            }
          });
        } else {
          console.error('Map container element not found!');
        }
      } else {
        console.error('Cannot show directions without fromLocation.');
      }
    },
    deg2rad(deg) {
      return deg * (Math.PI / 180);
    },
    searchPlaces() {
      if (!this.selectedChoice) {
        console.error('Please select a choice.');
        return;
      }
      const middleLocation = this.calculateMiddleLocation(this.fromLocation,this.location3);
      console.log(middleLocation)
      const apiRequest1 = axios.get(
        `https://localhost:7041/api/Product/Google?location1=${this.location1}&location2=${this.location2}&Choice=${this.selectedChoice}`
      );

      const apiRequest2 = axios.get(
        `https://localhost:7041/api/Product/Googlelocation2?location2=${this.location2}&location3=${this.location3}&Choice=${this.selectedChoice}`
      );

      Promise.all([apiRequest1, apiRequest2])
        .then(responses => {
          this.placesResponse = responses[0].data;
          this.placesResponse1 = responses[1].data;

          const paginatedPlaces = this.calculateAndMergeResults();
          this.$set(this, 'mergedPaginatedPlaces', paginatedPlaces);

          this.drawerVisible = true;
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });

        if (this.location3) {
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${this.location3}&key=AIzaSyAoS8LDAxSJ78ycaq2diQewFx7L3d0qUWE`
          )
          .then(response => {
            if (response.data.results.length > 0) {
              const location = response.data.results[0].geometry.location;
              this.endlocation = location;
              console.log(this.endlocation)
            } else {
              console.error('No results found for location1.');
            }
          })
          .catch(error => {
            console.error('Error geocoding location1:', error);
          });

        }

      if (this.location1) {
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${this.location1}&key=AIzaSyAoS8LDAxSJ78ycaq2diQewFx7L3d0qUWE`
          )
          .then(response => {
            if (response.data.results.length > 0) {
              const location = response.data.results[0].geometry.location;
              this.fromLocation = location;
              console.log(this.fromLocation)
            } else {
              console.error('No results found for location1.');
            }
          })
          .catch(error => {
            console.error('Error geocoding location1:', error);
          });
          
        this.drawerVisible = true;
      } else {
        console.error('Please enter a valid location1.');
      }
    },
    showDirections(place) {
      if (this.fromLocation) {
        const destination = `${place.geometry.location.lat},${place.geometry.location.lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${this.location1}&destination=${destination}&travelmode=driving`;
        window.open(url, '_blank');
      } else {
        console.error('Cannot show directions without fromLocation.');
      }
    },

    isBeforeOrAfterLocation(location, location1, location3) {
  const distance1 = this.calculateDistance(location3, location1);
  const distance2 = this.calculateDistance(this.fromLocation, location3);
  const distanceToLocation = this.calculateDistance(location3, location);

  console.log(`Distance from fromLocation to location1: ${distance1}`);
  console.log(`Distance from fromLocation to location3: ${distance2}`);
  console.log(`Distance from fromLocation to location: ${distanceToLocation}`);

  // Check if the location is located one before or after the fromLocation
  const results= distanceToLocation <= distance1;
  return results;
},
    calculateMiddleLocation(location1,location3) {
      if (location1 && location3) {
        console.log(this.fromLocation);
        console.log(location3);
        const lat1 = parseFloat(location1.split(',')[0]);
        const lon1 = parseFloat(location1.split(',')[1]);

        const lat3 = parseFloat(location3.split(',')[0]);
        const lon3 = parseFloat(location3.split(',')[1]);

        const middleLocation = {
          lat: (lat1 + lat3) / 2,
          lng: (lon1 + lon3) / 2,
        };

        return middleLocation;
      } else {
        console.error('Please enter valid locations for location1 and location3.');
        return null;
      }
    },
    changePage(direction) {
      if (direction === -1 && this.currentPage > 1) {
        this.currentPage -= 1;
      } else if (direction === 1 && this.currentPage * this.resultsPerPage < this.mergedPaginatedPlaces.length) {
        this.currentPage += 1;
      }
    },
  },
};
</script>
<style>
div {
  margin: 20px;
}

label {
  font-weight: bold;
}

input {
  width: 100%;
  padding: 5px;
  margin: 5px 0;
}

button {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.pagination {
  margin-top: 20px;
}

.pagination button {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px 15px;
  margin-right: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}


#map {
  height: 400px; /* Adjust the height as needed */
  margin-top: 20px;
}
</style>