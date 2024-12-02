# GradJobs - Federal Job Search Platform

## Project Overview
GradJobs is a web application designed to help recent graduates find federal job opportunities. The platform integrates with USAJOBS API and provides interactive visualizations of job statistics using Chart.js.

## Features
- Real-time job search with multiple filters
- Interactive job statistics visualization
- Job bookmarking system
- Featured jobs carousel
- Responsive design for all devices

## Technical Requirements Met

### Frontend (110 points) ✅
1. **FetchAPI Data Integration**
   - USAJOBS API integration
   - Custom backend API calls
   - Supabase database queries

2. **Required Fetch Calls**
   - External: USAJOBS API for job listings
   - Backend: `/api/job-stats` for statistics
   - Backend: `/api/applications` for saving applications

3. **JavaScript Libraries**
   - Chart.js for job statistics visualization
   - Slick Carousel for featured jobs display

4. **Required Pages**
   - Home Page (`index.html`): Featured jobs and quick search
   - Job Search Page (`jobs.html`): Advanced search with statistics
   - About Page (`about.html`): Platform information

5. **CSS Implementation**
   - Modern flexbox/grid layouts
   - Responsive design
   - Cross-browser compatibility

### Backend (60 points) ✅
1. **Database Integration**
   - Supabase implementation for data persistence
   - User job bookmarks storage
   - Application tracking

2. **Custom API Endpoints**
   - GET `/api/job-stats`: Retrieves job statistics
   - POST `/api/applications`: Saves job applications

## Project Structure
```
├── index.html          # Home page
├── jobs.html           # Job search page
├── about.html          # About page
├── help.html          # Help page
├── style.css          # Global styles
├── app.js             # Main application logic
├── jobs.js            # Job search functionality
└── server.js          # Backend API endpoints
```

## Technologies Used
- Frontend: HTML5, CSS3, JavaScript
- Libraries: Chart.js, jQuery, Slick Carousel
- Database: Supabase
- API: USAJOBS API

## Setup Instructions
1. Clone the repository
2. Set up environment variables in your JavaScript:
```javascript
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_KEY = 'your_supabase_key';
const USAJOBS_API_KEY = 'your_usajobs_key';
```
3. Open `index.html` in your browser

## API Documentation
- `GET /api/job-stats`: Returns job statistics
- `POST /api/applications`: Saves job applications
- Full API documentation available in `/docs`

## Contributors
- Aaron Tekle, Amina Shabbir, Richard Lac, Hassan Wasim, and Kedrala Mohammed
