import Ember from 'ember';
import {
  module, test
}
from 'qunit';
import startApp from '../helpers/start-app';

var App, users, cars, store;

var getLFObjectInfo = function(obj) {
  let keys = Object.keys(obj);
  let length = keys.length;
  let firstObject = obj[keys[0]];
  let lastObject = obj[keys[length - 1]];

  return {
    length: length,
    firstObject: firstObject,
    lastObject: lastObject,
    nth(n) {
      return obj[keys[n]];
    }
  };
};

var _assertMeta = function(isAll, obj, assert) {
  let fetchedAt = obj['__data_offline_meta__'].fetchedAt;
  assert.ok(fetchedAt, "Record meta present");
  if (!isAll) {
    let updatedAt = obj['__data_offline_meta__'].updatedAt;
    assert.ok(updatedAt, "Record meta present");
  }
};

var assertRecordMeta = function(obj, assert) {
  _assertMeta(false, obj, assert);
};

var assertCollectionMeta = function(obj, assert) {
  _assertMeta(true, obj, assert);
};

module('Acceptance: CRUD Test', {
  beforeEach: function() {
    Ember.run(() => {
      window.localforage.clear();
    });
    App = startApp();
    users = server.createList('user', 2);
    cars = server.createList('car', 4);
    server.createList('city', 4);
    store = App.__container__.lookup('service:store');
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test('findAll', function(assert) {
  assert.expect(7);

  visit('/');

  waitForRecordingModel('user');

  andThen(() => {
    return window.localforage.getItem('foo').then(result => {
      assert.equal(result.user.records[1].firstName, users[0].firstName, "Record 1 from server === record 1 in localforage");
      assert.equal(result.user.records[2].firstName, users[1].firstName, "Record 2 from server === record 2 in localforage");
      assert.equal(store.peekAll('user').get('firstObject').get('firstName'), users[0].firstName, "Record 1 in store === record 1 from server ");
      assert.equal(store.peekAll('user').get('lastObject').get('firstName'), users[1].firstName, "Record 2 in store === record 2 from server ");
      assert.equal(store.peekAll('user').get('firstObject').get('firstName'), result.user.records[1].firstName, "Record 1 in store === record 1 in localforage");
      assert.equal(store.peekAll('user').get('lastObject').get('firstName'), result.user.records[2].firstName, "Record 2 in store === record 2 in localforage");

      assertCollectionMeta(result.user, assert);
    });
  });
});

test('find', function(assert) {
  assert.expect(5);

  visit('/users/1');

  waitForRecordingModel('user');

  andThen(() => {
    return window.localforage.getItem('foo').then(result => {
      let usersLF = getLFObjectInfo(result.user.records);

      assert.equal(usersLF.firstObject.firstName, users[0].firstName);
      assert.equal(usersLF.length, 1);
    });
  });

  waitForRecordingModel('car');

  andThen(() => {
    return window.localforage.getItem('foo').then(result => {
      let carsLF = getLFObjectInfo(result.car.records);

      assert.equal(carsLF.firstObject.label, cars[0].label);
      assert.equal(carsLF.nth(1).label, cars[1].label);
      //as with findAll instead of findMany
      assert.equal(carsLF.length, 4);
    });
  });
});

test('createRecord', function(assert) {
  assert.expect(7);

  visit('/');

  andThen(() => {
    return click('#add-user');
  });

  waitForRecordingModel('user', 3);

  andThen(() => {
    return window.localforage.getItem('foo').then(result => {
      let users = getLFObjectInfo(result.user.records);
      let newUser = users.lastObject;

      assert.equal(users.length, 3, "There is new record in localforage");
      assert.equal(newUser.firstName, "Igor", "Created record from server === created record in localforage");
      assert.ok(newUser.id.length > 3);
      assert.equal(newUser.firstName, store.peekRecord('user', newUser.id).get('firstName'), "Created record from store === created record in localforage");

      assertCollectionMeta(result.user, assert);
      assertRecordMeta(newUser, assert);
    });
  });
});

test('deleteRecord', function(assert) {
  assert.expect(3);

  visit('/');

  waitForRecordingModel('user');

  andThen(() => {
    return click('.delete-user:first');
  });

  waitForRecordingModel('user', 2);

  andThen(() => {
    return window.localforage.getItem('foo').then(result => {
      let users = getLFObjectInfo(result.user.records);

      assert.equal(users.length, 1, "Record was deleted from LF");
      assert.equal(store.peekAll('user').get('length'), 1, "Record was deleted from store");
      assertCollectionMeta(result.user, assert);
    });
  });
});

test('updateRecord', function(assert) {
  assert.expect(5);

  visit('/users/1');

  waitForRecordingModel('user');

  andThen(() => {
    fillIn('#usr-first-name', "New name");
    click('#update-user');
  });

  waitForRecordingModel('user');

  andThen(() => {
    return window.localforage.getItem('foo').then(result => {
      let users = getLFObjectInfo(result.user.records);

      assert.equal(users.length, 1, "No additional records were added");
      assert.equal(store.peekRecord('user', 1).get('firstName'), "New name", "Record prop was updated in store");
      assert.equal(users.firstObject.firstName, "New name", "Record prop was updated in LF");

      assertRecordMeta(users.firstObject, assert);
    });
  });
});
