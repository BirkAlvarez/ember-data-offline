import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('users', {path: '/'}, function() {
    this.route('index', {path: '/'});
    this.route('user', {path: '/users/:id'});
  });
  this.route('companies');
  this.route('offices');
  this.route('cities');
  this.route('stress');
});

export default Router;
