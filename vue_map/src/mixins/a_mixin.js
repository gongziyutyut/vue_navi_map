import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters([''])
  },
  methods: {
    ...mapActions(['transmitData'])
  }
}
