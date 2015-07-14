import Ember from 'ember';
import baseMixin from 'ember-data-offline/mixins/base';

export default Ember.Mixin.create(baseMixin, {
  shouldReloadAll(store, snapshots) {
    let modelName = snapshots.type.modelName;
    let lastTime = this.get(`lastTimeFetched.all$${modelName}`);
    if (Ember.isEmpty(lastTime)) {
      return true;
    }
    let timeDelta = (lastTime - new Date()) / 1000 / 60 / 60;
    if (timeDelta > this.get('recordTTL')) {
      return true;
    }
    return false;
  },
  shouldBackgroundReloadAll: function() {
    return false;
  },
  shouldReloadRecord(store, snapshot) {
    let modelName = snapshot.type.modelName;
    let lastTime = this.get(`lastTimeFetched.one$${modelName}$${snapshot.id}`);
    if (Ember.isEmpty(lastTime)) {
      return true;
    }
    let timeDelta = (lastTime - new Date()) / 1000 / 60 / 60;
    if (timeDelta > this.get('recordTTL')) {
      return true;
    }
    return false;
  },
  shouldBackgroundReloadRecord() {
    return false;
  },

  findAll: function(store, typeClass, sinceToken, snapshots, fromJob) {
    console.log('findAll offline', typeClass.modelName)
    return this._super.apply(this, arguments).then(records => {
      if (!fromJob) {
        this.createOnlineJob('findAll', [store, typeClass, sinceToken, snapshots, true], store);
      }
      return records;
    }).catch(console.log.bind(console));
  },

  find: function(store, typeClass, id, snapshot, fromJob) {
    console.log('find offline', typeClass.modelName)
    return this._super.apply(this, arguments).then(record => {
      if (!fromJob) {
        this.createOnlineJob('find', [store, typeClass, id, snapshot, true], store);
      }
      if (Ember.isEmpty(record)) {
       return {id: id};
      }
      return record;
    }).catch(console.log.bind(console));
  },

  findQuery: function(store, type, query, fromJob) {
    console.log('findQuery offline', type.modelName)
    return this._super.apply(this, arguments).then(record => {
      if (!fromJob) {
        this.createOnlineJob('findQuery', [store, type, query, true], store);
      }
      return record;
    }).catch(console.log.bind(console));
  },

  findMany: function(store, type, ids, snapshots, fromJob) {
    console.log('findMany offline', type.modelName)
    return this._super.apply(this, arguments).then(records => {
      if (!fromJob) {
        this.createOnlineJob('findMany', [store, type, ids, snapshots, true], store);
      }
      let isValidRecords = records.reduce((p, n) => {
        return p && n;
      }, true);
      if (Ember.isEmpty(isValidRecords)) {
        console.log('SKJAKJSKAJSJSK', records)
        return Ember.RSVP.resolve([]);
      }
      return records;
    }).catch(console.log.bind(console));
  },

  createRecord(store, type, snapshot, fromJob) {
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
