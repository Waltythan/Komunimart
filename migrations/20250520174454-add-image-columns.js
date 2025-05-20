'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add profile_pic to Users
    await queryInterface.addColumn('Users', 'profile_pic', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Add image_url to Groups
    await queryInterface.addColumn('Groups', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Add image_url to Posts
    await queryInterface.addColumn('Posts', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Add image_url to Comments
    await queryInterface.addColumn('Comments', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'profile_pic');
    await queryInterface.removeColumn('Groups', 'image_url');
    await queryInterface.removeColumn('Posts', 'image_url');
    await queryInterface.removeColumn('Comments', 'image_url');
  }
};
