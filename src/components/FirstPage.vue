<template>
    <div>
   
      <div>
        <label for="origin">Origin:</label>
        <input type="text" id="origin" v-model="originInput" />
      </div>
      <div>
        <label for="destination">Destination:</label>
        <input type="text" id="destination" v-model="destinationInput" />
      </div>
      <div>
      <label for="placeType">Select Place Type:</label>
      <select id="placeType" v-model="selectedPlaceType">
        <option value="gas_station">Gas Station</option>
        <option value="hotel">Hotel</option>
        <option value="atm">ATM</option>
        <option value="restaurant">Restaurant</option>
        <!-- Add other place types as needed -->
      </select>
    </div>
      <button @click="submit">Calculate Route and Gas Stations</button>
      

    </div>
  </template>
   
  <script>
  import { mapActions, mapGetters } from 'vuex';

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
        selectedPlaceType: 'gas_station', // Default selected place type

      };
    },
    computed: {
    ...mapGetters(['getSelectedPlaceType']),
  },

   methods:{
    ...mapActions(['updateSelectedPlaceType']),

    submit(){
      const origin = encodeURIComponent(this.originInput);
      const destination = encodeURIComponent(this.destinationInput);
      this.$router.push({
        path: '/main',
        query: { origin, destination,placeType: this.selectedPlaceType }, // Pass parameters as query string
      });
      console.log(origin,destination)
    }
   }
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