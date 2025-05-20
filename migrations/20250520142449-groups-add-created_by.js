'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Groups', 'created_by', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'user_id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Groups', 'created_by');
  }
};
