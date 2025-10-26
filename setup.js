#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Expense Manager Project...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error(
    '❌ Node.js version 16 or higher is required. Current version:',
    nodeVersion
  );
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies:', error.message);
  process.exit(1);
}

// Install API dependencies
console.log('\n📦 Installing API dependencies...');
try {
  execSync('cd api && npm install', { stdio: 'inherit' });
  console.log('✅ API dependencies installed');
} catch (error) {
  console.error('❌ Failed to install API dependencies:', error.message);
  process.exit(1);
}

// Install App dependencies
console.log('\n📦 Installing App dependencies...');
try {
  execSync('cd app && npm install', { stdio: 'inherit' });
  console.log('✅ App dependencies installed');
} catch (error) {
  console.error('❌ Failed to install App dependencies:', error.message);
  process.exit(1);
}

// Check if .env file exists
const apiEnvPath = path.join(__dirname, 'api', '.env');
if (!fs.existsSync(apiEnvPath)) {
  console.log('\n📝 Creating API environment file...');
  try {
    const envExamplePath = path.join(__dirname, 'api', 'env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, apiEnvPath);
      console.log('✅ API environment file created from template');
      console.log('⚠️  Please edit api/.env with your configuration');
    } else {
      console.log('⚠️  No env.example found, please create api/.env manually');
    }
  } catch (error) {
    console.error('❌ Failed to create API environment file:', error.message);
  }
} else {
  console.log('✅ API environment file already exists');
}

// Create frontend environment file
const appEnvPath = path.join(__dirname, 'app', '.env');
if (!fs.existsSync(appEnvPath)) {
  console.log('\n📝 Creating frontend environment file...');
  try {
    const appEnvContent = 'VITE_API_URL=http://localhost:5000/api\n';
    fs.writeFileSync(appEnvPath, appEnvContent);
    console.log('✅ Frontend environment file created');
  } catch (error) {
    console.error(
      '❌ Failed to create frontend environment file:',
      error.message
    );
  }
} else {
  console.log('✅ Frontend environment file already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log(
  '1. Edit api/.env with your configuration (MongoDB, OpenAI API key, email settings)'
);
console.log(
  '2. Set up MongoDB (see MONGODB_SETUP.md for detailed instructions)'
);
console.log('3. Run "npm run dev" to start the development servers');
console.log('\n📚 Documentation:');
console.log('- README.md - Main documentation');
console.log('- MONGODB_SETUP.md - Database setup guide');
console.log('- DEPLOYMENT.md - Production deployment guide');
console.log('\n🚀 Happy coding!');
