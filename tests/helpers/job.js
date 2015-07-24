import Ember from 'ember';
import LocalstorageJob from 'ember-data-offline/jobs/localforage';
import RESTJob from 'ember-data-offline/jobs/rest';

const { RSVP } = Ember;

var resolveMock = function(dataMock){
  return dataMock;
};
var emberModelMock = Ember.Object.extend({
  _createSnapshot(){
    return { id : 'foo'};
  }
});
var storeMock = Ember.Object.extend({
  peekAll(){
    return Ember.A([
      emberModelMock.create({id: 'foo'})
    ]);
  },
  peekRecord(modelName, id){
    if(id === 'foo'){
      return emberModelMock.create({id: 'foo'});
    }
  },
  serializerFor(){
    return {
      primaryKey: 'id',
      normalizePayload(payload) {
        return payload;
      },
      modelNameFromPayloadKey(key) {
        return key;
      }
    };
  }
});

var snapshotMock = Ember.Object.create({});
var adapterСlass = Ember.Object.extend({

  createRecord() {
    this.get('assert').ok(true, this.get('adapterType') + " adapter.createRecord was invoked.");
    return Ember.RSVP.Promise.resolve('foo');
  },
  updateRecord() {
    this.get('assert').ok(true, this.get('adapterType') +  " adapter.updateRecord was invoked.");
    return Ember.RSVP.Promise.resolve('foo');
  },
  deleteRecord(){
    this.get('assert').ok(true, this.get('adapterType') +  " adapter.deleteRecoed was invoked.");
    return Ember.RSVP.Promise.resolve('foo');
  },
  unhadled(){
    this.get('assert').ok(true, this.get('adapterType') +  " adapter.unhadled was invoked.");
    return Ember.RSVP.Promise.resolve('foo');
  }
});
var typeClassMock = {
  modelName: 'bar',
};


var localstorageJobMock = function(assert, onlineAdapterResp, method = { name : 'find', args : 1}) {
  let offlineAdapter = adapterСlass.create({
    assert : assert,
    adapterType : "offline"
  });

  let _storeMock = storeMock.create({});
  let job = LocalstorageJob.create({
    adapter: offlineAdapter,
  });
  job.set('method', method.name);

  job.set('params', [_storeMock, typeClassMock, method.args, snapshotMock]);

  if (method.name === 'findAll') {
    job.set('params', [_storeMock, typeClassMock, 'sinceToken']);
    return job;
  }

  if (method.name === 'findQuery') {
    job.set('params', [_storeMock, typeClassMock, method.args]);
    return job;
  }

  if (method.name === 'findMany') {
    job.set('params', [_storeMock, typeClassMock, method.args, 'sinceToken']);
    return job;
  }

  if (method.name === 'updateRecord'){
    job.set('params', [_storeMock, typeClassMock, snapshotMock, onlineAdapterResp]);
    return job;
  }

  if (method.name === 'deleteRecord'){
    job.set('params', [_storeMock, typeClassMock, snapshotMock, onlineAdapterResp]);
    return job;
  }

  return job;
};

var restJobMock = function function_name(assert, method = { name : 'find', args : 1}) {

let onlineAdapter = adapterСlass.create({
    assert : assert,
    adapterType : "rest",
    findAll(){
      assert.ok(true, "rest adapter.findAll was invoked.");
      return Ember.RSVP.Promise.resolve('foo');
    },
    find(){
      assert.ok(true, "rest adapter.find was invoked.");
      return Ember.RSVP.Promise.resolve('foo');
    },
    findQuery(){
      assert.ok(true, "rest adapter.findQuery was invoked.");
      return Ember.RSVP.Promise.resolve('foo');
    },
    findMany(){
      assert.ok(true, "rest adapter.findMany was invoked.");
      return Ember.RSVP.Promise.resolve('foo');
    },
    offlineAdapter : adapterСlass.create({
        assert : assert,
        adapterType : "offline"
    })
  });

  let _storeMosck = storeMock.create({
    syncLoads : {
      find : {},
      findAll: {},
      findMany: {},
      findQuery: {}
    },
    pushPayload(){
      assert.ok(true, "store.pushPayload was invoked");
    },
    unloadRecord(){

    }
  });

  let job = RESTJob.create({
    adapter: onlineAdapter,
  });

  job.set('method', method.name);

  job.set('params', [_storeMosck, typeClassMock, method.args, snapshotMock]);

  if (method.name === 'findAll') {
    job.set('params', [_storeMosck, typeClassMock, 'sinceToken']);
    return job;
  }

  if (method.name === 'findQuery') {
    job.set('params', [_storeMosck, typeClassMock, method.args]);
    return job;
  }

  if (method.name === 'findMany') {
    job.set('params', [_storeMosck, typeClassMock, method.args, 'sinceToken']);
    return job;
  }

  if(method.name ==='createRecord' || method.name ==='updateRecord' || method.name ==='deleteRecord' ){
    job.set('params', [_storeMosck, typeClassMock, snapshotMock, {}]);
    return job;
  }

  return job;
};
export {
  localstorageJobMock,
  restJobMock
};
