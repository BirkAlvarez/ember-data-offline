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

  findAll: function(store, typeClass) {
    debug('findAll online', typeClass.modelName);
    return this._super.apply(this, arguments);
  },

  find: function(store, typeClass, id, snapshot, fromJob) {
    let onlineResp = this._super.apply(this, arguments);
    return onlineResp.then(resp => {
      this.set(`lastTimeFetched.one$${typeClass.modelName}$${id}`, new Date());
      if (!fromJob) {
        this.createOfflineJob('find', [store, typeClass, id], store);
      }
      return resp;
    });
  },

  findQuery: function(store, type, query, recordArray, fromJob) {
    let onlineResp = this._super.apply(this, arguments);
    return onlineResp.then(resp => {
      if (!fromJob) {
        this.createOfflineJob('findQuery', [store, type, query, resp, true], store);
      }
      return resp;
    });
  },

  findMany: function(store, typeClass, ids, snapshots, fromJob) {
    //TODO add some config param for such behavior
    let onlineResp = this.findAll(store, typeClass, null, true);

    return onlineResp.then(resp => {
      if (!fromJob) {
        this.createOfflineJob('findMany', [store, typeClass, ids], store);
      }
      return resp;
    });
  },

  createRecord() {
    return this._super.apply(this, arguments);
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
    return onlineResp;
  }
});
