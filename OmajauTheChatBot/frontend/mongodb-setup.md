# MongoDB Setup Guide

Your backend can't start because MongoDB is not installed. Here are your options:

## 🚀 Option 1: MongoDB Atlas (Recommended - Cloud Database)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free"
3. Create an account

### Step 2: Create a Cluster
1. Choose "FREE" tier (M0)
2. Select your preferred cloud provider (AWS/Google Cloud/Azure)
3. Choose a region close to you
4. Click "Create"

### Step 3: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

### Step 4: Update Backend .env
Edit `backend/.env`:
```env
# Replace the local MongoDB URI with Atlas URI
MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/auth-system
```

## 💻 Option 2: Install MongoDB Locally

### Windows Installation
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB as a service
5. MongoDB will run on `localhost:27017`

### macOS Installation (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux Installation (Ubuntu)
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 🧪 Test MongoDB Connection

After setting up MongoDB:

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: localhost
🚀 Server running on port 5000
```

## 🔧 Quick Fix for Testing

If you want to test without MongoDB temporarily, you can modify the backend to skip database connection:

Edit `backend/server.js` and comment out the database connection:
```javascript
// Comment out this line temporarily:
// connectDB();
```

But this will break authentication features.

## 📞 Need Help?

1. **MongoDB Atlas** is the easiest option - no installation needed
2. **Local MongoDB** gives you full control but requires installation
3. Both options will work with your current setup

Choose MongoDB Atlas if you want to get started quickly!
