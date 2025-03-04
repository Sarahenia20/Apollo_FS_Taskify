const RolesModel = require('../models/roles');

const seedRoles = async () => {
  try {
    const existingRoles = await RolesModel.find();
    
    if (existingRoles.length === 0) {
      const defaultRoles = [
        {
          name: "ADMIN",
          permissions: [
            'user:create', 
            'user:update', 
            'user:delete', 
            'reports:view'
          ]
        },
        {
          name: "PROJECT MANAGER",
          permissions: [
            'user:create', 
            'user:update', 
            'user:delete', 
            'reports:view'
          ]
        },
        {
          name: "ENGINEER",
          permissions: [
            'user:update', 
            'reports:view'
          ]
        }
      ];

      await RolesModel.insertMany(defaultRoles);
      console.log('Default roles seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding roles:', error);
    // Log the full error details
    console.error(JSON.stringify(error, null, 2));
  }
};

module.exports = seedRoles;