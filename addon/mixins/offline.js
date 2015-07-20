import Ember from 'ember';
import baseMixin from 'ember-data-offline/mixins/base';
import debug from 'ember-data-offline/utils/debug';
import extractTargetRecordFromPayload from 'ember-data-offline/utils/extract-online';

var isExpiredOne = function(store, typeClass, record) {
  if (Ember.isEmpty(record)) {
   return true; 
  }
  let adapter = store.lookupAdapter(typeClass.modelName);
  let recordTTL = adapter.get('recordTTL');
  let updatedAt = record['__data_offline_meta__'].updatedAt;
  let wasUpdated = new Date(updatedAt);
  let timeDelta = (new Date() - wasUpdated) / 1000 / 60 / 60; 
  if (timeDelta > recordTTL) {
   return true; 
  }
  return false;
};

var isExpiredMany = function(store, typeClass, records) {
  if (Ember.isEmpty(records)) {
   return true; 
  }
  let adapter = store.lookupAdapter(typeClass.modelName);
  let recordTTL = adapter.get('recordTTL');
  return records.reduce((p, record) => {
    console.log('DJSDKSDJSDKJDSJDK', record)
    let updatedAt = record['__data_offline_meta__'].updatedAt;
    let wasUpdated = new Date(updatedAt);
    let timeDelta = (new Date() - wasUpdated) / 1000 / 60 / 60; 
    let gate = false;
    if (timeDelta > recordTTL) {
     return true; 
    }
    return p || gate;
  }, false);
};

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
    debug('findAll offline', typeClass.modelName);
    return this._super.apply(this, arguments).then(records => {
      if (!fromJob) {
        //TODO find way to pass force reload option here
        // if (isExpiredMany(store, typeClass, records)) {
          this.createOnlineJob('findAll', [store, typeClass, sinceToken, snapshots, true], store);
        // }
      }
      return records;
    }).catch(console.log.bind(console));
  },

  find: function(store, typeClass, id, snapshot, fromJob) {
    return this._super.apply(this, arguments).then(record => {
      if (!fromJob) {
        if (isExpiredOne(store, typeClass, record)) {
          this.createOnlineJob('find', [store, typeClass, id, snapshot, true], store);
        }
      }
      if (Ember.isEmpty(record)) {
        let primaryKey = store.serializerFor(typeClass.modelName).primaryKey;
        let stub = {};
        stub[primaryKey] = id;
        return stub;
      }
      return record;
    });
  },

  query: function(store, typeClass, query, recordArray, fromJob) {
    return this._super.apply(this, arguments).then(records => {
      //TODO think how to remove this dirty hasck
      if (Ember.isEmpty(records)) {
        return this.get('onlineAdapter').findQuery(store, typeClass, query, recordArray, fromJob).then(onlineRecords => {
          return extractTargetRecordFromPayload(store, typeClass, onlineRecords);
        });
      }
      else {
        if (!fromJob) {
          this.createOnlineJob('query', [store, typeClass, query, recordArray, true], store);
        }
      }
      return records;
    }).catch(console.log.bind(console));
  },

  findMany: function(store, typeClass, ids, snapshots, fromJob) {
    // debug('findMany offline', type.modelName);
    return this._super.apply(this, arguments).then(records => {
      if (!fromJob) {
        if (isExpiredMany(store, typeClass, records)) {
          this.createOnlineJob('findMany', [store, typeClass, ids, snapshots, true], store);
        }
      }
      if (Ember.isEmpty(records)) {
        let primaryKey = store.serializerFor(typeClass.modelName).primaryKey;
        return ids.map(id => {
          let stub = {};
          stub[primaryKey] = id;
          return stub;
        });
      }
      return records;
    });
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
