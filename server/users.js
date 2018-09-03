'use strict';

const USERS = [
  {
    id: 0,
    name: 'Frank',
    email: 'frank@fg.com',
    password: '$2a$08$iEJ6RFbut5GafjU6WBa5WO6tb2T5FOugHiYWkrGdBODVEy9a/0oUm', //admin
    admin: true
  },
  {
    id: 1,
    name: 'Tom',
    email: 'tom@fg.com',
    password: '$2a$08$5mJFpae097eGksCC8XFO.uEP6yE58cgF4UeKMyreqZXwhcg1SJu3i', //test
    admin: false
  },
  {
    id: 2,
    name: 'Tina',
    email: 'tina@fg.com',
    password: '$2a$08$kT3XS1ivlEHqfAKVDqBNo.CrEPn17leNUA6vZ8QIOB2sUmvXfL4IC', //tdr
    admin: true
  }
];

module.exports = {
  USERS
};
