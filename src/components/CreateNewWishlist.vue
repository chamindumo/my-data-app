<template>
    <div>
      <h2>Add to Wishlist</h2>
      <ul>
      <li v-for="gasStation in wishlist" :key="gasStation.id">
        {{ gasStation.name }}
        <!-- Display other details as needed -->
      </li>
    </ul>
      <button @click="createNewWishlist">Create New Wishlist</button>
      <button @click="addToExistingWishlist">Add to Existing Wishlist</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        receivedWishlist: [],
      };
    },
    mounted(){
this.populateReceivedWishlist();
    },
    computed: {
    wishlist() {

      return this.$store.getters.getWishlist;
    },
  },

    methods: {
      createNewWishlist() {

        this.$store.commit('addToWishlist', this.receivedWishlist);
        this.$router.push({ name: 'CreateNewWishlist' });

      },
      addToExistingWishlist() {
        this.$store.commit('addToWishlist', this.receivedWishlist);

        this.$router.push({ name: 'AddToExistingWishlist' });
      },
      populateReceivedWishlist() {
      // Assign data from Vuex store to receivedWishlist
      this.receivedWishlist = this.wishlist;
      console.log(this.receivedWishlist)
    },
    },
  };
  </script>
  
  <!-- Styles or additional configurations -->
  