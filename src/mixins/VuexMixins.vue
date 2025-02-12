<script>
import { mapActions, mapMutations } from "vuex";
import EventController from "@src/components/toast/eventController";
export default {
  name: "VuexMixins",
  methods: {
    // Actions dispatched in vuex
    ...mapActions({
      updateDB: "UPDATE_DB",
      updateTable: "UPDATE_TABLE",
      updateSearchObj: "UPDATE_SEARCHOBJ",
      updateSelectView: "UPDATE_SELECTVIEW",
      destroyToast: "DESTROY_TOAST",
      createToast: "CREATE_TOAST",
      updateDbObject: "UPDATE_DB_OBJECT",
      updateToast: "UPDATE_TOAST",
      updateLastSelect: "UPDATE_LAST_SELECT",
      updateChangeTree: "UPDATE_CHANGE_TREE",
      update401Count: "UPDATE_401_COUNT",
    }),
    // Mutations committed synchronously in vuex
    ...mapMutations({
      commitUpateLastSelect: "UPDATE_LAST_SELECT",
      commitUpdateChangeTree: "UPDATE_CHANGE_TREE",
      commitUpdateTable: "UPDATE_TABLE",
    }),
    // Create event
    createEvent: function (
      action,
      name,
      count,
      content,
      subType,
      resourceInfos
    ) {
      return EventController.createEvent(
        action,
        name,
        count,
        content,
        subType,
        resourceInfos,
        this
      );
    },
    // Event finished
    _eventFinished: function (_event) {
      return EventController._eventFinished(_event, this);
    },
    // Event success callback
    incEventSuccess: function (event) {
      return EventController.incEventSuccess(event, this);
    },
    // Set event success
    setEventSuccess: function (event, content) {
      return EventController.setEventSuccess(event, content, this);
    },
    // Event failure callback
    incEventFail: function (event) {
      return EventController.incEventFail(event, this);
    },
    // Set event failure
    setEventFail: function (event, content) {
      return EventController.setEventFail(event, content, this);
    },
    // Set event as finished
    setEventFinished: function (event) {
      return EventController.setEventFinished(event, this);
    },
  },
  computed: {
    db() {
      return this.$store.state.db;
    },
  },
};
</script>
