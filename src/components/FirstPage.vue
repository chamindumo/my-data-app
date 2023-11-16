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
      <button @click="submit">Calculate Route and Gas Stations</button>
      

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
      };
    },
   methods:{
    submit(){
      const origin = encodeURIComponent(this.originInput);
      const destination = encodeURIComponent(this.destinationInput);
      this.$router.push({
        path: '/main',
        query: { origin, destination }, // Pass parameters as query string
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