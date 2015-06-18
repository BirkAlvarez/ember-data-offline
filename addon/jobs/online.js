import Ember from 'ember';
import jobMixin from 'ember-data-offline/mixins/job';

export default Ember.Object.extend(jobMixin, {
  task() {
    console.log('sync', this.get('method'));
    if (this[this.get('method')]){
      return this[this.get('method')].apply(this, this.get('params'));
    }
    return this.get('adapter')[this.get('method')].apply(this.get('adapter'), this.get('params'));
  },

  findAll(store, typeClass, sinceToken, fromJob) {
    let adapterResp = this.get('adapter').findAll(store, typeClass, sinceToken);
    store.set(`syncLoads.findAll.${typeClass.modelName}`, false);

    adapterResp.then(adapterPayload => {
      console.log("findAll from online job", typeClass, adapterPayload)
      store.pushPayload(typeClass, adapterPayload);

      store.set(`syncLoads.findAll.${typeClass.modelName}`, true);
    });

    return adapterResp;
  },

  find: function(store, typeClass, id, snapshot, fromJob) {
    let adapterResp = this.get('adapter').find(store, typeClass, id, snapshot);
    store.set(`syncLoads.find.${typeClass.modelName}`, false);

    adapterResp.then(adapterPayload => {
      store.unloadRecord(typeClass, id);
      store.pushPayload(typeClass, adapterPayload);

      store.set(`syncLoads.find.${typeClass.modelName}`, true);
    });

    return adapterResp;
  },

  findQuery(store, type, query, fromJob) {
    let adapterResp = this.get('adapter').findQuery(store, type, query);
    store.set(`syncLoads.findQuery.${typeClass.modelName}`, false);

    adapterResp.then(adapterPayload => {
      store.pushPayload(type, adapterPayload);
      store.set(`syncLoads.findQuery.${typeClass.modelName}`, true);
    });

    return adapterResp;
  },

  findMany(store, type, ids, snapshots, fromJob) {
    let adapterResp = this.get('adapter').findMany(store, type, ids, snapshots);

    adapterResp.then(adapterPayload => {
      store.pushPayload(type, adapterPayload);
    });

    return adapterResp;
  },

  createRecord(store, type, snapshot, fromJob) {
    let adapter = this.get('adapter');
    return adapter.createRecord(store, type, snapshot, fromJob);
  },

  updateRecord(store, type, snapshot, fromJob) {
    let adapter = this.get('adapter');
    return adapter.updateRecord(store, type, snapshot, fromJob);
  },

  deleteRecord(store, type, snapshot, fromJob) {
    let adapter = this.get('adapter');
    return adapter.deleteRecord(store, type, snapshot, fromJob);
  },

});
