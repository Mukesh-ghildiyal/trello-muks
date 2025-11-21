# Trello-Style Board Application with Smart Recommendations

A full-stack Trello clone built with React, Node.js, Express, and MongoDB. Features include board management, collaboration via email invitations, and AI-powered smart recommendations.

## Features

### ✅ Core Features

1. **Basic Trello-Style Board**
   - Create and manage multiple boards
   - Create lists within boards (To Do, In Progress, Done, etc.)
   - Add cards to lists with titles, descriptions, and due dates
   - Drag-and-drop cards between lists
   - Modern, responsive UI built with React and Tailwind CSS

2. **Collaboration**
   - Invite users to boards via email
   - Shared users can add/update cards
   - Real-time board member management
   - Secure invitation system with token-based acceptance

3. **Smart Recommendations (AI Insights)**
   - **Due Date Suggestions**: Analyzes card content for keywords (urgent, soon, deadline) and suggests appropriate due dates
   - **List Movement Suggestions**: Detects keywords like "started", "completed" and suggests moving cards to appropriate lists
   - **Related Cards**: Groups cards with similar keywords together
   - **Overdue Alerts**: Highlights cards that are past their due date
   - **Missing Descriptions**: Identifies cards that could benefit from descriptions
   - **Stale Cards**: Flags cards that haven't been updated in a while

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Vite
- Tailwind CSS
- @dnd-kit (drag-and-drop)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer (for email invitations)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd trello
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Backend Environment**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/trello
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Email Configuration (Optional)
   # If not configured, invites will still be created in database but emails won't be sent
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM_NAME=Trello Clone
   FRONTEND_URL=http://localhost:5173
   ```

   **Note**: For Gmail, you need to:
   - Enable 2-factor authentication
   - Generate an App Password (not your regular password)
   - Use the App Password in `EMAIL_PASS`

5. **Configure Frontend Environment (Optional)**

   Create a `.env` file in the `frontend` directory if you want to customize the API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   # On macOS/Linux
   mongod

   # On Windows
   # Start MongoDB service or run mongod.exe
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

3. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

### Creating Your First Board

1. Sign up for a new account or log in
2. Click "Create Board" on the dashboard
3. Enter a board name and optional description
4. Your board will be created with default lists: "To Do", "In Progress", and "Done"

### Adding Cards

1. Open a board
2. Click "Add Card" in any list
3. Enter a card title and optional description
4. Cards can be dragged and dropped between lists

### Inviting Collaborators

1. Open a board
2. Click the "Invite" button in the header
3. Enter the email address of the user you want to invite
4. The user will receive an email with an invitation link (if email is configured)
5. The user can accept the invitation and will be added to the board

### Using Smart Recommendations

1. Open a board
2. Click the "AI Insights" button in the header
3. View recommendations in the side panel:
   - Apply due date suggestions
   - Move cards to suggested lists
   - Review related cards
   - Check for overdue cards

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

## Project Structure

```
trello/
├── backend/
│   ├── controller/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Email service
│   ├── index.js          # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   └── main.jsx      # App entry point
│   └── package.json
└── README.md
```

## Smart Recommendations Logic

The recommendation system analyzes cards using:

1. **Keyword Analysis**: Detects urgency keywords (urgent, asap, critical), time references (soon, deadline, this week), and status keywords (started, completed, done)

2. **Content Similarity**: Uses keyword extraction and overlap detection to find related cards

3. **Temporal Analysis**: Tracks due dates, overdue cards, and stale cards (cards not updated recently)

4. **Context Awareness**: Considers list names and card positions when making suggestions

## Email Configuration

Email notifications are **optional**. The invite system works without email configuration:

- **Without email**: Invites are created in the database. Users can accept invites using the token directly via API.
- **With email**: Invitation emails are sent automatically with a clickable link.

### Setting up Email (Optional)

1. **Gmail Example**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM_NAME=Trello Clone
   FRONTEND_URL=http://localhost:5173
   ```

2. **Other SMTP Providers**: Update `EMAIL_HOST` and `EMAIL_PORT` accordingly.

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

## Production Build

### Build Frontend
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

### Run Backend in Production
```bash
cd backend
npm start
```

## License

This project is open source and available for personal and educational use.

## Contributing

Feel free to submit issues and enhancement requests!

