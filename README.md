# AwesomeSocks Chat Application

A modern real-time chat application with private messaging, public rooms, and social features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Development Journey](#development-journey)
  - [Backend Challenges](#backend-challenges)
  - [Frontend Challenges](#frontend-challenges)
- [Screenshots](#screenshots)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Changelog](#changelog)

## Overview

AwesomeSocks Chat is a full-featured chat application that allows users to communicate in real-time through both private messages and public chat rooms. The application supports user authentication, friend requests, random chat matching, and public room categorization.

## Features

- **User Authentication**: Secure login and registration system
- **Private Messaging**: One-on-one chat sessions with real-time updates
- **Public Chat Rooms**: Categorized public rooms for group discussions
- **Friend System**: Send, accept, and manage friend requests
- **Random Chat Matching**: Connect with random users for spontaneous conversations
- **User Blocking**: Block unwanted users from contacting you
- **User Reporting**: Report inappropriate behavior
- **Real-time Updates**: Instant message delivery using Socket.IO
- **Responsive Design**: Works on both desktop and mobile devices
- **Theme Support**: Light and dark mode options

## Architecture

### Backend

The backend is built with Node.js and Express, using MongoDB as the database. It follows a modular architecture with the following components:

- **Models**: Define the data structure for users, messages, chat sessions, and public rooms
- **Controllers**: Handle business logic for each feature
- **Routes**: Define API endpoints for client-server communication
- **Middleware**: Handle authentication, error handling, and socket connections
- **Socket.IO**: Manage real-time communication between clients

### Frontend

The frontend is built with React and uses a modern component-based architecture:

- **Components**: Reusable UI elements for consistent design
- **Pages**: Main application views (Home, Login, Signup, Explore, etc.)
- **Store**: State management using Zustand for global application state
- **Lib**: Utility functions and API client setup
- **Assets**: Static resources like images and icons

## Development Journey

### Backend Challenges

1. **Chat Session Redesign**: 
   - Initially, messages were stored with sender and receiver IDs
   - Migrated to a chat session model for better organization and bidirectional chat matching
   - Created migration scripts to move existing messages to the new structure
   - Implemented proper session IDs for more reliable message delivery

2. **Socket.IO Integration**:
   - Implemented room-based communication for both private chats and public rooms
   - Managed user connections and disconnections
   - Handled real-time updates across multiple devices
   - Ensured proper cleanup when users leave rooms

3. **Public Room Implementation**:
   - Created a flexible model for public rooms with categories
   - Implemented join/leave functionality with participant tracking
   - Added real-time participant updates
   - Managed message delivery to all room participants

4. **Authentication and Security**:
   - Implemented JWT-based authentication
   - Added middleware for protected routes
   - Secured socket connections with user verification
   - Implemented user blocking and reporting features

5. **Database Optimization**:
   - Added indexes for frequently queried fields
   - Structured data models for efficient retrieval
   - Implemented pagination for message history

### Frontend Challenges

1. **State Management**:
   - Initially used React Context for state management
   - Migrated to Zustand for better performance and simpler state updates
   - Implemented separate stores for authentication, chat, and theme
   - Added optimistic updates for better user experience

2. **Real-time Updates**:
   - Implemented Socket.IO client integration
   - Added message subscription management
   - Handled reconnection scenarios
   - Prevented duplicate messages from appearing

3. **UI/UX Design**:
   - Implemented responsive design for all components
   - Added loading states and error handling
   - Created intuitive navigation between private chats and public rooms
   - Implemented search functionality for finding users and rooms

4. **Chat Session Redesign**:
   - Updated UI to display chat sessions instead of individual users
   - Added proper handling of chat session participants
   - Implemented last message preview in the sidebar
   - Added unread message indicators

5. **Public Room Experience**:
   - Created an Explore page with category tabs and search
   - Implemented room cards with participant counts
   - Added participant management panel
   - Created real-time messaging interface for public rooms

## Screenshots

[Insert screenshots of the login page]

[Insert screenshots of the chat interface]

[Insert screenshots of the public rooms]

[Insert screenshots of the explore page]

## Demo

[Insert link to live demo or video demonstration]

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Socket.IO**: Real-time communication
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Cloudinary**: Image storage and management
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **React Router**: Navigation
- **Zustand**: State management
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client
- **TailwindCSS**: Utility-first CSS framework
- **DaisyUI**: UI component library
- **date-fns**: Date formatting
- **react-hot-toast**: Toast notifications
- **Lucide React**: Icon library

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with the following variables
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=5001

# Start the server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Changelog

### v1.0.0 (Initial Release)
- Basic user authentication
- One-on-one messaging
- User profiles
- Online status indicators

### v1.1.0 (Chat Session Redesign)
- Implemented chat session model
- Added bidirectional chat matching
- Migrated existing messages to chat sessions
- Improved real-time message delivery

### v1.2.0 (Public Rooms)
- Added public chat rooms
- Implemented room categories (Gaming, Music, Movie, Random)
- Created Explore page for browsing rooms
- Added room search functionality
- Implemented participant management

### v1.3.0 (Social Features)
- Added friend request system
- Implemented user blocking
- Added user reporting
- Enhanced profile management
