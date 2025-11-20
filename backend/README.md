# Backend API - Trello Clone with Smart Recommendations

Complete backend server with JWT authentication, board management, and smart task recommendations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trello
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Optional)
# If not configured, invites will still be created in database but emails won't be sent
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
# EMAIL_FROM_NAME=Trello Clone
# FRONTEND_URL=http://localhost:5173
```

3. Make sure MongoDB is running locally, or update `MONGODB_URI` to your MongoDB Atlas connection string.

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Boards

- `GET /api/boards` - Get all boards for user (protected)
- `POST /api/boards` - Create new board (protected)
- `GET /api/boards/:boardId` - Get single board with lists and cards (protected)
- `PUT /api/boards/:boardId` - Update board (protected, owner only)
- `DELETE /api/boards/:boardId` - Delete board (protected, owner only)

### Lists

- `POST /api/lists/:boardId` - Create new list (protected)
- `PUT /api/lists/:listId` - Update list (protected)
- `DELETE /api/lists/:listId` - Delete list (protected)

### Cards

- `POST /api/cards/:listId` - Create new card (protected)
- `PUT /api/cards/:cardId` - Update card (protected)
- `DELETE /api/cards/:cardId` - Delete card (protected)

### Invites

- `POST /api/invites/:boardId` - Send invite to user (protected)
- `GET /api/invites/accept/:token` - Accept invitation (protected)
- `GET /api/invites/:boardId/members` - Get board members (protected)

### Recommendations

- `GET /api/recommendations/:boardId` - Get smart recommendations (protected)

## Smart Recommendations Features

The recommendations system analyzes cards and provides:

1. **Due Date Suggestions**: Analyzes card descriptions for keywords (urgent, soon, deadline) and suggests appropriate due dates
2. **List Movement Suggestions**: Detects keywords like "started", "completed" and suggests moving cards to appropriate lists
3. **Related Cards**: Groups cards with similar keywords together
4. **Overdue Alerts**: Highlights cards that are past their due date
5. **Missing Descriptions**: Identifies cards that could benefit from descriptions

## Database Models

- **User**: Authentication and user info
- **Board**: Board with owner and members
- **List**: Lists within boards
- **Card**: Cards with title, description, due date
- **BoardInvite**: Invitation tracking

## Email Configuration (Optional)

Email notifications for invitations are **optional**. The invite system works without email configuration:

- **Without email**: Invites are created in the database. Users can accept invites using the token directly via API.
- **With email**: Invitation emails are sent automatically with a clickable link.

### Setting up Email (Optional)

1. **Gmail Example**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password  # Use App Password, not regular password
   EMAIL_FROM_NAME=Trello Clone
   FRONTEND_URL=http://localhost:5173
   ```

2. **Other SMTP Providers**: Update `EMAIL_HOST` and `EMAIL_PORT` accordingly.

3. **Note**: For Gmail, you need to:
   - Enable 2-factor authentication
   - Generate an "App Password" (not your regular password)
   - Use the app password in `EMAIL_PASS`

## Security

- JWT token authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Access control (owner/member checks)
