'use strict';

const path = require('path');
const { Sequelize } = require('sequelize-typescript');
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];

// Import semua model class
const { User }     = require('./User');
const { Group }    = require('./Group');
const { Post }     = require('./Post');
const { Comment }  = require('./Comment');
const { Like }     = require('./Like');
const { Bookmark } = require('./Bookmark');
const { GroupMembership } = require('./GroupMembership');

// Inisialisasi Sequelize dengan decorator loader
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize({
      database: config.database,
      username: config.username,
      password: config.password,
      host:     config.host,
      port:     config.port,
      dialect:  config.dialect,
      logging:  config.logging,      // model class array
      models: [ User, Group, Post, Comment, Like, Bookmark, GroupMembership ]
    });

const db = {
  sequelize,
  Sequelize,
  User,
  Group,
  Post,
  Comment,
  Like,
  Bookmark,
  GroupMembership
};

module.exports = db;
