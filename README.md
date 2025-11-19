# MiniFooty Stats & MVP Voting App

A full-stack MERN application for managing weekly football games, tracking player statistics, and conducting MVP voting. **Now supports multiple independent groups** - each admin manages their own football group with complete data isolation.

## 🎯 Features

### Multi-Group Support
- **Group Isolation**: Each football group has its own players, matches, stats, and leaderboards
- **Group Selection**: Public users choose which group to view
- **Admin Management**: Admins only see and manage data for their assigned group

### Public Features (No Login Required)
- **Group Selection**: Choose which football group to view
- **Home Page**: View latest match results and top players for selected group
- **Leaderboards**: See rankings for goals, assists, saves, MVP awards, and appearances
- **MVP Voting**: Cast your vote for Man of the Match by simply entering your name

### Admin Features (JWT-Protected)
- **Player Management**: Add and manage players within your group
- **Match Creation**: Create weekly match records for your group
- **Attendance Tracking**: Mark which players attended each match
- **Stats Entry**: Enter goals, assists, and saves for each player
- **Voting Control**: Start and close MVP voting polls
- **Results Publishing**: Automatically determine and publish MVP winners

## 🔧 Tech Stack

- **Frontend**: React 18 + Tailwind CSS + React Router + Native Fetch API
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT (Admin only, includes groupId)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn
