import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    wishlist: [],
    selectedPlaceType: 'gas_station', // Default selected place type

    // Other state properties...
  },
  mutations: {
    addToWishlist(state, gasStation) {
      state.wishlist.push(gasStation);
    },
    setSelectedGasStation(state, gasStation) {
        state.selectedGasStation = gasStation;
      }, 
      updateSelectedPlaceType(state, placeType) {
        state.selectedPlaceType = placeType;
      },
    
    },
  actions: {
    updateSelectedPlaceType(context, placeType) {
        context.commit('updateSelectedPlaceType', placeType);
      },
      },
  getters: {
    getWishlist: state => state.wishlist,
    getSelectedGasStation: (state) => state.selectedGasStation,
    getSelectedPlaceType: (state) => state.selectedPlaceType,

    // Other getters...
  },
});
