<template>
    <div>
      <h2>Add to Wishlist</h2>
      <div v-if="!showCreateNew">
        <ul>
          <li v-for="gasStation in wishlist" :key="gasStation.id">
            {{ gasStation.name }}
            <!-- Display other details as needed -->
          </li>
        </ul>
  
        <button @click="toggleCreateNew">Create New Wishlist</button>
        <button @click="addToExistingWishlist">Add to Existing Wishlist</button>
      </div>
      <div v-else>
        <li v-for="gasStation in wishlist" :key="gasStation.id">
            {{ gasStation.name }}
            <!-- Display other details as needed -->
          </li>
        <input type="text" v-model="newWishlistName" placeholder="Enter wishlist name" />
        <button @click="createNewWishlist">Create</button>
      </div>
       <!-- Table display -->
    <table v-if="displayExistingWishlist">
      <thead>
        <tr>
          <th>Name</th>
          <th>Action</th>

          <!-- Add other table headers as needed -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in receivedWishlist1" :key="item.id">
          <td>{{ item.nameOfPlace }}</td>
          <td>
          <button @click="postData(item.nameOfPlace,item.proid)">Post Data</button>
        </td>
          <!-- Display other details within the table rows -->
        </tr>
      </tbody>
    </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { mapGetters } from 'vuex';

  export default {
    data() {
      return {
        receivedWishlist: [],
        showCreateNew: false,
        newWishlistName: '',
        displayExistingWishlist: false, // Flag to control table display
        receivedWishlist1: [], // Store fetched data here
        selectedPlaceType: '', // Variable to store the selected place type
        randomNumber: '',

      };
    },
    computed: {
    ...mapGetters(['getSelectedPlaceType']),
    wishlist() {
      return this.$store.getters.getWishlist;
    },
   
},
    mounted() {
    this.selectedPlaceType = this.getSelectedPlaceType;
    console.log(this.selectedPlaceType);
      this.populateReceivedWishlist();
    },
   
    methods: {
      async createNewWishlist() {
       const number =  this.generateAndSaveRandomNumber()
        const nameOfPlace1 = this.newWishlistName;
        const place={
            nameOfPlace: nameOfPlace1,
            name:this.receivedWishlist[0].name,
            vicinity:this.receivedWishlist[0].vicinity,
            type:this.selectedPlaceType,
            proid:this.randomNumber
        }
        console.log(number)
        console.log(this.randomNumber)


       console.log(place)
       try {
        const response = await axios.post('https://localhost:7041/api/Product', place);
        console.log(response.data); // Log the response from the backend
        this.newWishlistName = '';
        this.showCreateNew = false;
      } catch (error) {
        console.error('Error creating wishlist:', error);
        // Handle errors or show a message to the user
      }
      },
      async postData(item1,item2){
        const nameOfPlace1 = item1;
        const place={
            nameOfPlace: nameOfPlace1,
            name:this.receivedWishlist[0].name,
            vicinity:this.receivedWishlist[0].vicinity,
            type:this.selectedPlaceType,
            proid:item2
        }

       console.log(place)
       try {
        const response = await axios.post('https://localhost:7041/api/Product', place);
        console.log(response.data); // Log the response from the backend
        this.newWishlistName = '';
        this.showCreateNew = false;
      } catch (error) {
        console.error('Error creating wishlist:', error);
        // Handle errors or show a message to the user
      }
      },
      generateAndSaveRandomNumber() {
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            let randomString = '';
            const stringLength = 4;

            for (let i = 0; i < stringLength; i++) {
                const randomIndex = Math.floor(Math.random() * letters.length);
                randomString += letters.charAt(randomIndex);
            }
this.randomNumber=randomString
            console.log('Generated String:', randomString);

        
    },


    async  addToExistingWishlist() {
        try {
       this.displayExistingWishlist=true;
        const response = await axios.get('https://localhost:7041/api/Product'); // Replace URL with your backend endpoint
        this.receivedWishlist1 = response.data; 
        console.log(this.receivedWishlist1);// Assuming response.data is an array of wishlist items from the backend
        this.displayExistingWishlist = true; // Show the table when the button is clicked
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        // Handle error fetching data
      }// Fetch or populate the wishlist data
    },
      toggleCreateNew() {
        this.showCreateNew = !this.showCreateNew;
      },
      populateReceivedWishlist() {
        // Assign data from Vuex store to receivedWishlist
        this.receivedWishlist = this.wishlist;
        console.log("hello",this.receivedWishlist[0].name);
      },
    },
  };
  </script>
  