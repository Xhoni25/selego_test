# MongoDB Setup Guide

This guide will help you set up MongoDB for the Expense Manager application.

## Option 1: Local MongoDB Installation

### Windows

1. **Download MongoDB Community Server**

   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select Windows and download the MSI installer

2. **Install MongoDB**

   - Run the MSI installer
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service
   - Install MongoDB Compass (optional GUI tool)

3. **Start MongoDB Service**

   - Open Services (services.msc)
   - Find "MongoDB" service
   - Right-click and select "Start"

4. **Verify Installation**
   ```bash
   mongod --version
   mongo --version
   ```

### macOS

1. **Install using Homebrew**

   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**

   ```bash
   brew services start mongodb/brew/mongodb-community
   ```

3. **Verify Installation**
   ```bash
   mongod --version
   mongo --version
   ```

### Linux (Ubuntu/Debian)

1. **Import MongoDB public key**

   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB repository**

   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Install MongoDB**

   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a New Cluster**

   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select a cloud provider and region
   - Name your cluster (e.g., "expense-manager")

3. **Set Up Database Access**

   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**

   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (for development)
   - Or add your specific IP address

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Database Configuration

### Update Environment Variables

1. **For Local MongoDB**

   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-manager
   ```

2. **For MongoDB Atlas**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense-manager?retryWrites=true&w=majority
   ```

### Create Database and Collections

The application will automatically create the database and collections when you first run it. The collections created are:

- `teams` - Stores team information and budgets
- `expenses` - Stores expense records
- `users` - Stores user accounts

## Testing MongoDB Connection

### Using MongoDB Compass (GUI)

1. Download and install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse your databases and collections

### Using Command Line

1. **Connect to MongoDB**

   ```bash
   mongo
   # or for Atlas
   mongo "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/expense-manager"
   ```

2. **List databases**

   ```javascript
   show dbs
   ```

3. **Use your database**

   ```javascript
   use expense-manager
   ```

4. **List collections**
   ```javascript
   show collections
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused Error**

   - Ensure MongoDB service is running
   - Check if port 27017 is available
   - Verify firewall settings

2. **Authentication Failed**

   - Check username and password
   - Ensure user has proper permissions
   - Verify database name in connection string

3. **Network Timeout**

   - Check internet connection for Atlas
   - Verify IP address is whitelisted
   - Check if your ISP blocks MongoDB ports

4. **SSL/TLS Issues**
   - Ensure connection string includes `?retryWrites=true&w=majority`
   - Check if your network allows SSL connections

### Performance Tips

1. **Indexes**

   - The application creates necessary indexes automatically
   - Monitor query performance in MongoDB Compass

2. **Connection Pooling**

   - Default connection pool size is 10
   - Adjust based on your application needs

3. **Memory Usage**
   - MongoDB uses available RAM for caching
   - Monitor memory usage in production

## Security Best Practices

1. **Use Strong Passwords**

   - Generate complex passwords for database users
   - Rotate passwords regularly

2. **Network Security**

   - Restrict IP access in production
   - Use VPN for secure connections

3. **Data Encryption**

   - Enable encryption at rest (Atlas handles this)
   - Use SSL/TLS for connections

4. **Regular Backups**
   - Atlas provides automatic backups
   - Set up manual backups for local installations

## Monitoring

### MongoDB Atlas Monitoring

- Built-in monitoring dashboard
- Performance metrics and alerts
- Query performance insights

### Local MongoDB Monitoring

- Use MongoDB Compass for basic monitoring
- Set up MongoDB monitoring tools
- Monitor logs for errors

## Next Steps

Once MongoDB is set up:

1. Update your `.env` file with the correct connection string
2. Start the application: `npm run dev`
3. Check the console for successful database connection
4. Create your first user account through the registration page

For additional help, refer to the [MongoDB Documentation](https://docs.mongodb.com/) or create an issue in the repository.
