# Mini CRM – Client Lead Management System
*Built for Future Interns – Full Stack Web Development Task 2*

## Features
- **Admin Login System**: Secure access for managing leads (demo creds: `admin` / `admin123`)
- **Lead Listing & Management**: View leads in a responsive table with creation timestamps
- **Inline Status Updates**: Move leads from "New" → "Contacted" → "Converted"
- **Follow-up Notes**: Track internal discussions for each lead
- **Search & Filter**: Find leads quickly by name/email or filter by status
- **Analytics Dashboard**: Real-time counters showing total, new, contacted, and converted leads
- **Delete Leads**: Securely remove spam or outdated leads
- **Add New Leads**: Clean pop-up modal for manual lead entry

## Tech Stack
- Frontend: React.js, Vite, Axios, Lucide React
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB Atlas (Cloud)

## Setup

1. **Clone the repository**
2. **Setup Backend**:
   - `cd backend`
   - `npm install`
   - *(Note: Ensure your IP is whitelisted in MongoDB Atlas or update the connection string in `server.js`)*
   - `node server.js` (Runs on http://localhost:5000)
3. **Setup Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev` (Runs on http://localhost:5173)

### Admin Access
Use the following demo credentials to securely log into the CRM dashboard from the frontend:
- **Username:** admin
- **Password:** admin123

### Portfolio Highlight Line
*“Built a secure full-stack CRM system to manage client leads, track follow-ups, and convert prospects using React, Node.js, Express, and MongoDB Atlas cloud database.”*
