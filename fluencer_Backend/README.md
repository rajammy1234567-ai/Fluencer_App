# Influish Backend

Backend API server for Influish - A platform connecting influencers and brands.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MySQL (AWS RDS)
- **Authentication**: JWT
- **Real-time**: Socket.IO 4.6.0
- **Payments**: Razorpay 2.9.2
- **File Upload**: Multer 1.4.5-lts.1
- **Email**: Nodemailer (Gmail SMTP)

## Features

- ✅ User Authentication (JWT-based)
- ✅ Email OTP Verification
- ✅ Influencer & Brand Profile Management
- ✅ Campaign Creation & Management
- ✅ Campaign Applications
- ✅ Real-time Chat (Socket.IO)
- ✅ File Upload System
- ✅ Payment Integration (Razorpay)
- ✅ Message System

## Installation

### Prerequisites

- Node.js 16+ installed
- MySQL database (AWS RDS or local)
- Gmail account with app password
- Razorpay account (for payments)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd Influish_Backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   - Gmail credentials (for OTP emails)
   - Database connection details
   - JWT secret key
   - Razorpay keys

3. **Database Setup**
   ```bash
   # Run the schema file in your MySQL database
   mysql -h your_host -u your_user -p your_database < schema.sql
   ```

4. **Create Upload Directories**
   ```bash
   mkdir -p uploads/profiles uploads/campaigns uploads/chats
   ```

5. **Start Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

Server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup-request` - Request OTP for signup
- `POST /api/auth/verify-otp` - Verify OTP and create account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (protected)

### Influencers
- `POST /api/influencers/profile` - Create/Update influencer profile (protected)
- `GET /api/influencers/profile` - Get influencer profile (protected)
- `GET /api/influencers/profile-exists` - Check if profile exists (protected)
- `POST /api/influencers/upload-image` - Upload profile image (protected)

### Brands
- `POST /api/brands/profile` - Create/Update brand profile (protected)
- `GET /api/brands/profile` - Get brand profile (protected)
- `GET /api/brands/profile-exists` - Check if profile exists (protected)
- `POST /api/brands/upload-image` - Upload profile image (protected)

### Campaigns
- `POST /api/campaigns` - Create campaign (protected, brand only)
- `GET /api/campaigns/my-campaigns` - Get brand's campaigns (protected)
- `GET /api/campaigns/active/all` - Get all active campaigns (protected)
- `GET /api/campaigns/:id` - Get campaign by ID (protected)
- `PUT /api/campaigns/:id` - Update campaign (protected)
- `DELETE /api/campaigns/:id` - Delete campaign (protected)
- `POST /api/campaigns/:id/apply` - Apply to campaign (protected, influencer only)
- `GET /api/campaigns/:id/applications` - Get campaign applications (protected)
- `PUT /api/campaigns/applications/:id/status` - Update application status (protected)

### Messages
- `GET /api/messages/conversations` - Get all conversations (protected)
- `GET /api/messages/:otherUserId` - Get messages with user (protected)
- `POST /api/messages/send` - Send message (protected)
- `PUT /api/messages/mark-read/:otherUserId` - Mark messages as read (protected)
- `GET /api/messages/unread/count` - Get unread count (protected)

### Payments
- `POST /api/payments/create-order` - Create Razorpay order (protected)
- `POST /api/payments/verify-payment` - Verify payment signature (protected)
- `GET /api/payments/history` - Get payment history (protected)
- `POST /api/payments/webhook` - Razorpay webhook handler

## Socket.IO Events

### Client → Server
- `join_chat` - Join a chat room
  ```javascript
  socket.emit('join_chat', { otherUserId: 123 })
  ```

- `send_message` - Send a message
  ```javascript
  socket.emit('send_message', { 
    receiverId: 123, 
    message: 'Hello' 
  })
  ```

- `typing` - User is typing
  ```javascript
  socket.emit('typing', { receiverId: 123 })
  ```

- `stop_typing` - User stopped typing
  ```javascript
  socket.emit('stop_typing', { receiverId: 123 })
  ```

### Server → Client
- `receive_message` - New message received
- `notification` - System notification
- `typing` - Other user is typing
- `stop_typing` - Other user stopped typing
- `campaign_update` - Campaign status updated

## File Upload Limits

- **Profile Images**: 5MB max
- **Chat Files**: 10MB max
- **Multiple Images**: Max 5 files per request
- **Allowed Formats**: 
  - Images: jpeg, jpg, png, gif, webp
  - Documents: pdf, doc, docx

## Database Schema

9 tables:
1. **users** - User accounts
2. **otp_verifications** - Temporary OTP storage
3. **influencer_profiles** - Influencer details
4. **brand_profiles** - Brand details
5. **campaigns** - Campaign listings
6. **campaign_applications** - Application tracking
7. **messages** - Chat messages
8. **payment_orders** - Payment transactions

## Development

```bash
# Run in development mode with auto-reload
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Update Razorpay keys with live credentials
3. Configure production database
4. Set strong JWT_SECRET
5. Run: `npm start`

## Security Notes

- JWT tokens expire based on configuration
- Passwords hashed with bcrypt (10 rounds)
- File upload validation (type, size)
- SQL injection protected (parameterized queries)
- CORS configured for frontend origin
- Socket.IO JWT authentication

## Troubleshooting

**Database Connection Error**
- Verify DB credentials in .env
- Check AWS RDS security group allows your IP
- Ensure database exists

**OTP Email Not Sending**
- Verify Gmail credentials
- Enable "Less secure app access" or use App Password
- Check Gmail daily sending limits

**File Upload Errors**
- Ensure upload directories exist
- Check file size limits
- Verify file type allowed

## Support

For issues or questions, contact: support@influish.com
