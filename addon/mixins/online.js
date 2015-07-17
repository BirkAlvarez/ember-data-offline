import Ember from 'ember';
import baseMixin from 'ember-data-offline/mixins/base';
import debug from 'ember-data-offline/utils/debug';

export default Ember.Mixin.create(baseMixin, {
  shouldReloadAll() {
    return false;
  },
  shouldBackgroundReloadAll: function() {
    return false;
  },

  findAll: function(store, typeClass, sinceToken, fromJob) {
    debug('findAll online', typeClass.modelName);
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
    console.log('find online', typeClass.modelName, arguments);
    let onlineResp = this._super.apply(this, arguments);
    return onlineResp.then(resp => {
      this.set(`lastTimeFetched.one$${typeClass.modelName}$${id}`, new Date());
      if (!fromJob) {
        this.createOfflineJob('find', [store, typeClass, id], store);
      }
      return resp;
    }).catch(console.log.bind(console));
  },

  findQuery: function(store, type, query, fromJob) {
    // debug('findQuery online', type.modelName);
    let onlineResp = this._super.apply(this, arguments);
    return onlineResp.then(resp => {
      if (!fromJob) {
        this.createOfflineJob('findQuery', [store, type, query, onlineResp, true], store);
      }
      return resp;
    });
  },

  findMany: function(store, typeClass, ids, snapshots, fromJob) {
    console.log('findMany online', typeClass.modelName, arguments);
    // debug('findMany online', type.modelName);
    //TODO add some config param for such behavior
    let onlineResp = this.findAll(store, typeClass, null, true);

    return onlineResp.then(resp => {
      if (!fromJob) {
        this.createOfflineJob('findMany', [store, typeClass, ids], store);
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
