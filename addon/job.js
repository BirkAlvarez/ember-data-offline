import Ember from 'ember';
const { computed, RSVP } = Ember;

export default Ember.Object.extend({
  retryCount: 0,

  needRetry: computed.gt('retryCount', 0),

  task() {
    return true;
  },
  perform() {
    return RSVP.Promise.resolve().then(() => {
      return this.task();
    });
  },
});
