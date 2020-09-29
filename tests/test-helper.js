import Application from 'scrabble-front-end/app';
import config from 'scrabble-front-end/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
