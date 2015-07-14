import baseMixin from 'ember-data-offline/mixins/base';
import Ember from 'ember';

var isObjectEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};

export default Ember.Mixin.create(baseMixin, {
  shouldReloadAll() {
    return false;
  },
  shouldBackgroundReloadAll: function() {
    return false;
  },

  findAll: function(store, typeClass, sinceToken, fromJob) {
    console.log('findAll online', typeClass.modelName)
    let adapterResp = this._super.apply(this, arguments);
    return adapterResp.then(resp => {
      //TODO Think about persistance this registry hash
      this.set(`lastTimeFetched.all$${typeClass.modelName}`, new Date());
      if (!fromJob) {
        this.createOfflineJob('findAll', [store, typeClass, sinceToken, adapterResp, true], store);
      }
      return resp;
    });
  },

  find: function(store, typeClass, id, snapshot, fromJob) {
    console.log('find online', typeClass.modelName)
    let onlineResp = this._super.apply(this, arguments);
    return onlineResp.then(resp => {
      this.set(`lastTimeFetched.one$${typeClass.modelName}$${id}`, new Date());
      if (!fromJob) {
        this.createOfflineJob('find', [store, typeClass, id, snapshot, onlineResp, true], store);
      }
      return resp;
    }).catch(console.log.bind(console));
  },

  findQuery: function(store, type, query, fromJob) {
    console.log('findQuery online', type.modelName)
    let onlineResp = this._super.apply(this, arguments);
    return onlineResp.then(resp => {
      if (!fromJob) {
        this.createOfflineJob('findQuery', [store, type, query, onlineResp, true], store);
      }
      return resp;
    });
  },

  findMany: function(store, type, ids, snapshots, fromJob) {
    console.log('findMany online', type.modelName)
    let onlineResp;
    let recordsInStore = store.peekAll(type.modelName);
    let inStoreIds = recordsInStore.map(record => {
      return !isObjectEmpty(record._internalModel._data) && record.id;
    });

    let idsDiff = ids.filter(item => inStoreIds.indexOf(item) < 0);
    console.log('findMany onlien DIFF', idsDiff, inStoreIds, ids)

    if (!Ember.isEmpty(idsDiff)) {
      onlineResp = this._super(store, type, idsDiff, snapshots);
    }
    else {
      onlineResp = Ember.RSVP.resolve([]);
    }

    return onlineResp.then(resp => {
      if (!fromJob) {
        this.createOfflineJob('find', [store, type, ids, snapshots, onlineResp, true], store);
      }
      return resp;
    });
  },

  createRecord(store, type, snapshot, fromJob) {
    let onlineResp = this._super.apply(this, arguments);
    if (!fromJob) {
      this.createOfflineJob('createRecord', [store, type, snapshot, onlineResp, true], store);
    }
    return onlineResp;
  },

  updateRecord(store, type, snapshot, fromJob) {
    let onlineResp = this._super.apply(this, arguments);
    if (!fromJob) {
      this.createOfflineJob('updateRecord', [store, type, snapshot, onlineResp, true], store);
    }
    return onlineResp;
  },

  deleteRecord(store, type, snapshot, fromJob) {
    let onlineResp = this._super.apply(this, arguments);
    if (!fromJob) {
      this.createOfflineJob('deleteRecord', [store, type, snapshot, onlineResp, true], store);
    }
    return onlineResp;
  }
});
