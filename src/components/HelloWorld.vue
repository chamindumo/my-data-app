<template>
  
  <div id="app"> 
    <h2>Find Places Between Locations</h2>
    <label for="location1">Location 1:</label>
    <input v-model="location1" id="location1" type="text" />
    <br />

    <label for="location2">Location 2:</label>
    <input v-model="location2" id="location2" type="text" />
    <br />

    <label for="choice">Choice:</label>
    <select v-model="selectedChoice" id="choice">
      <option value="">Select a choice</option>
      <option v-for="(choice, index) in choices" :value="choice" :key="index">{{ choice }}</option>
    </select>
    <br />

    <button @click="searchPlaces">Search</button>
          <button type="primary" @click="exportToPDF">Export to PDF</button>

    <div v-if="placesResponse">
      <h3>Search Results</h3>
      <table>
        <thead>
          <tr>
            <th>Bank Name</th>
            <th>Distance (km)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(place, index) in paginatedPlaces" :key="index">
            <td>{{ place.name }}</td>
            <td>{{ place.distance.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="changePage(-1)" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }}</span>
        <button @click="changePage(1)" :disabled="currentPage * resultsPerPage >= placesResponse.results.length">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      location1: "",
      location2: "",
      selectedChoice: "", // Store the selected choice
      choices: ["coffe shop", "atm", "restaurants", "hotels", "gas stations"], // Add your choices here
      placesResponse: null,
      fromLocation: null, // Store the "from location" coordinates
      resultsPerPage: 10, // Number of results to display per page
      currentPage: 1, // Current page

    };
  },
  computed: {
    // Sort the places by distance in ascending order
    paginatedPlaces() {
    if (!this.placesResponse) return [];

    const startIndex = (this.currentPage - 1) * this.resultsPerPage;
    const endIndex = startIndex + this.resultsPerPage;

    return this.placesResponse.results
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
    const radiusOfEarth = 6371; // Earth's radius in kilometers

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

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  },
     searchPlaces() {
            if (!this.selectedChoice) {
          console.error('Please select a choice.');
          return;
        }
        axios.get(
          `https://localhost:7041/api/Product/Google?location1=${this.location1}&location2=${this.location2}&Choice=${this.selectedChoice}`
        ).then(response=>{
            this.placesResponse = response.data
        })
      
        
        .catch(error=>{
          console.error('Error fetching data:', error);

        }) ;

      
        if (this.location1) {
    // Use a geocoding service to get the coordinates of "location1"
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.location1}&key=AIzaSyAoS8LDAxSJ78ycaq2diQewFx7L3d0qUWE`)
      .then(response => {
        if (response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          this.fromLocation = location;
          // Now that we have the "from location," you can proceed with fetching and sorting the places.
          this.fetchPlaces();
        } else {
          // Handle the case where geocoding didn't return any results.
          console.error('No results found for location1.');
        }
      })
      .catch(error => {
        console.error('Error geocoding location1:', error);
      });
  } else {
    console.error('Please enter a valid location1.');
  }

    },
    exportToPDF() {
  window.html2canvas = html2canvas;
  var doc = new jsPDF("p","pt","a4");
  doc.html(document.querySelector("#app"), {
callback:function(pdf){
  pdf.save("mypdf.pdf")
}
  });
},

    changePage(direction) {
    // Handle pagination by changing the current page
    if (direction === -1 && this.currentPage > 1) {
      this.currentPage -= 1;
    } else if (direction === 1 && (this.currentPage * this.resultsPerPage) < this.placesResponse.results.length) {
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

</style>