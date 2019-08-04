import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const interfaceObj = {
  'transmitData': 'TRANSMITDATA'
}

export default new Vuex.Store({
  state: {
    transmitData: ''
  },
  mutations: {
    [interfaceObj.transmitData] (state) {
      state.transmitData = 111
    }
  },
  actions: {
    [interfaceObj.transmitData] ({ commit }, obj) {
      commit([interfaceObj.transmitData], obj)
    }
  },
  getters: {
    getTransmitData (state) {
      return state[interfaceObj.transmitData]
    }
  }
})
