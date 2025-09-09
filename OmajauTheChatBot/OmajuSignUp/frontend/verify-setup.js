#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Frontend-Backend Setup...\n');

// Check if all required files exist
const requiredFiles = [
  // Backend files
  'backend/package.json',
  'backend/server.js',
  'backend/models/User.js',
  'backend/routes/auth.js',
  'backend/middleware/auth.js',
  'backend/middleware/validation.js',
  'backend/config/database.js',
  'backend/env.example',

  // Frontend files
  'lib/api.ts',
  'hooks/useAuth.tsx',
  'components/auth/ProtectedRoute.tsx',
  'components/auth/auth-card.tsx',
  'app/layout.tsx',
  'app/page.tsx',
  'app/sign-in/page.tsx',
  'app/sign-up/page.tsx',
  'app/dashboard/page.tsx',
  'env.local.example',

  // Documentation
  'setup.md',
  'README.md',
  'backend/README.md',
  'backend/frontend-integration.md'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📦 Checking package.json files...');

// Check backend dependencies
const backendPackagePath = 'backend/package.json';
if (fs.existsSync(backendPackagePath)) {
  const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  const requiredBackendDeps = [
    'express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 
    'cors', 'dotenv', 'express-validator'
  ];
  
  console.log('Backend dependencies:');
  requiredBackendDeps.forEach(dep => {
    if (backendPackage.dependencies[dep]) {
      console.log(`✅ ${dep}: ${backendPackage.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
}

// Check frontend dependencies
const frontendPackagePath = 'package.json';
if (fs.existsSync(frontendPackagePath)) {
  const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
  console.log('\n✅ Frontend package.json exists');
  console.log(`   Next.js version: ${frontendPackage.dependencies?.next || 'Not found'}`);
  console.log(`   React version: ${frontendPackage.dependencies?.react || 'Not found'}`);
}

console.log('\n🔧 Setup Instructions:');
console.log('');
console.log('1. Backend Setup:');
console.log('   cd backend');
console.log('   npm install');
console.log('   cp env.example .env');
console.log('   # Edit .env with your MongoDB URI and JWT secret');
console.log('   npm run dev');
console.log('');
console.log('2. Frontend Setup:');
console.log('   cd .. # (back to root)');
console.log('   cp env.local.example .env.local');
console.log('   npm run dev');
console.log('');
console.log('3. Test the connection:');
console.log('   # Backend health: http://localhost:5000/health');
console.log('   # Frontend: http://localhost:3000');
console.log('   # API test: cd backend && node test-api.js');

if (allFilesExist) {
  console.log('\n🎉 All files are in place! Ready to start the servers.');
} else {
  console.log('\n⚠️  Some files are missing. Please check the setup.');
}

console.log('\n📚 Documentation:');
console.log('   - Main README: README.md');
console.log('   - Setup Guide: setup.md');
console.log('   - Backend API: backend/README.md');
console.log('   - Integration: backend/frontend-integration.md');

console.log('\n🔗 Key Features:');
console.log('   ✅ JWT Authentication');
console.log('   ✅ Password Hashing (bcrypt)');
console.log('   ✅ MongoDB Integration');
console.log('   ✅ Input Validation');
console.log('   ✅ CORS Configuration');
console.log('   ✅ Protected Routes');
console.log('   ✅ Error Handling');
console.log('   ✅ TypeScript Support');
console.log('   ✅ Modern UI Components');
