import Ember from 'ember';
import baseMixin from 'ember-data-offline/mixins/base';

export default Ember.Mixin.create(baseMixin, {
  findAll: function(store, typeClass, sinceToken, fromJob) {
    console.log('FindAll from offline', typeClass);

    return this._super.apply(this, arguments).then(records => {
      if (!fromJob) {
        this.createOnlineJob('findAll', [store, typeClass, sinceToken, true], store);
      }
      return records;
    }).catch(console.log.bind(console));
  },

  find: function(store, typeClass, id, snapshot, fromJob) {
    console.log('JDKSDJSDJSKDKSDKSJD', fromJob)
    return this._super.apply(this, arguments).then(record => {
      if (!fromJob) {
          console.log('from offline find in then', typeClass);
          this.createOnlineJob('find', [store, typeClass, id, snapshot, true], store);
      }
      return record;
    }).catch(console.log.bind(console));
  },

  findQuery: function(store, type, query, fromJob) {
    return this._super.apply(this, arguments).then(record => {
      if (!fromJob) {
        this.createOnlineJob('findQuery', [store, type, query, true], store);
      }
      return record;
    }).catch(console.log.bind(console));
  },

  findMany: function(store, type, ids, snapshots, fromJob) {
    return this._super.apply(this, arguments).then(record => {
      if (!fromJob) {
        this.createOnlineJob('findMany', [store, type, ids, snapshots, true], store);
      }
      return record;
    }).catch(console.log.bind(console));
  },

  createRecord(store, type, snapshot, fromJob) {
    //think about merge id....very important. maybe unload Record, and push Record...
    if (!fromJob) {
      this.createOnlineJob('createRecord', [store, type, snapshot, true], store);
    }
    return this._super.apply(this, arguments);
  },

  updateRecord(store, type, snapshot, fromJob) {
    if (!fromJob) {
      this.createOnlineJob('updateRecord', [store, type, snapshot, true], store);
    }
    return this._super.apply(this, arguments);
  },

  deleteRecord(store, type, snapshot, fromJob) {
    if (!fromJob) {
      this.createOnlineJob('deleteRecord', [store, type, snapshot, true], store);
    }
    return this._super.apply(this, arguments);
  }
});
