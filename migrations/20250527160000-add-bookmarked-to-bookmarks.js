// filepath: migrations/20250527160000-add-bookmarked-to-bookmarks.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookmarks', 'bookmarked', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookmarks', 'bookmarked');
  },
};
