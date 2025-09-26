const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const defaultAdmin = new User({
      employeeId: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@company.com',
      password: 'Admin123!',
      department: 'IT',
      position: 'System Administrator',
      role: 'admin',
      phoneNumber: '+1234567890'
    });

    await defaultAdmin.save();
    console.log('Created default admin user');

    // Create sample users
    const sampleUsers = [
      {
        employeeId: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: 'User123!',
        department: 'Engineering',
        position: 'Software Developer',
        role: 'user',
        phoneNumber: '+1234567891'
      },
      {
        employeeId: 'EMP002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        password: 'User123!',
        department: 'Marketing',
        position: 'Marketing Manager',
        role: 'user',
        phoneNumber: '+1234567892'
      },
      {
        employeeId: 'EMP003',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        password: 'User123!',
        department: 'HR',
        position: 'HR Specialist',
        role: 'user',
        phoneNumber: '+1234567893'
      },
      {
        employeeId: 'EMP004',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        password: 'User123!',
        department: 'Finance',
        position: 'Financial Analyst',
        role: 'user',
        phoneNumber: '+1234567894'
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.name} (${user.employeeId})`);
    }

    console.log('Database seeded successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('Admin - Employee ID: ADMIN001, Password: Admin123!');
    console.log('User - Employee ID: EMP001, Password: User123!');
    
    process.exit(0);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;