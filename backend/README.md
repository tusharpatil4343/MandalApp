# Ganesh Festival Donation Management Backend

A complete backend system for managing donations and expenses during Ganesh Festival celebrations.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Neon PostgreSQL
- **Development**: Nodemon

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     - `DATABASE_URL`: Your Neon PostgreSQL connection string
     - `GANAPATI_BUDGET`: Estimated budget for the festival
     - `PORT`: Server port (default: 5000)

3. **Database Setup:**
   - Run the SQL commands in `db/init.sql` on your Neon PostgreSQL database
   - This will create tables and insert sample data

## 🏃‍♂️ Running the Application

- **Development mode:**
  ```bash
  npm run dev
  ```

- **Production mode:**
  ```bash
  npm start
  ```

The server will start on port 5000 (or the port specified in your .env file).

## 🗄️ Database Schema

### Tables

1. **donors** - Donor information
   - `id` (SERIAL PRIMARY KEY)
   - `name` (TEXT NOT NULL)
   - `contact` (TEXT)
   - `donation_amount` (NUMERIC(10,2) NOT NULL)
   - `date` (TIMESTAMP DEFAULT NOW())

2. **expenses** - Expense tracking
   - `id` (SERIAL PRIMARY KEY)
   - `description` (TEXT NOT NULL)
   - `amount` (NUMERIC(10,2) NOT NULL)
   - `date` (TIMESTAMP DEFAULT NOW())

## 🔐 API Endpoints

### Donors
- `GET /api/donors` - Fetch all donors (with filters)
- `POST /api/donors` - Add new donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor

### Expenses
- `GET /api/expenses` - Fetch all expenses
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard
- `GET /api/dashboard/donors` - Donors with filters
- `GET /api/dashboard/summary` - Financial summary
- `GET /api/dashboard/expenses` - Expenses summary and history
- `GET /api/dashboard/remaining` - Remaining donation after expenses

## 🔒 Security Features

- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS**: Configured for cross-origin requests
- **SSL**: Database connection with SSL enabled

## 📊 Sample Data

The database comes with sample data:
- 8 sample donors with various donation amounts
- 5 sample expenses for common festival costs

## 🛠️ Development

- **Hot Reload**: Nodemon automatically restarts server on file changes
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Console logging for debugging and monitoring
- **Validation**: Input validation for all API endpoints

## 📝 Notes

- All monetary amounts are stored as NUMERIC(10,2) for precision
- Dates are stored in TIMESTAMP format
- API responses follow consistent format: `{ success: boolean, data: any, error?: string }`
