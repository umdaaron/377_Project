# GradJobs - Federal Job Search Platform
# Group Members: Aaron Tekle, Amina Shabbir, Hassan Wasim, Richard Lac, and Kedrala Mohammed

## Project Description
GradJobs is a web application designed to help recent graduates find federal job opportunities. The platform integrates with USAJOBS API and provides interactive visualizations of job statistics using Chart.js.

## Target Browsers:
- Chrome (v90+)
- Firefox (v80+)
- Edge (v89+)
- Safari (v14+)

## Link to Developer Manual
- [Developer Manual](README.md)


## Features
- Real-time job search
- Interactive job statistics visualization
- Job bookmarking system
- Featured jobs
- Responsive design for all devices

## Technical Requirements Met

### Frontend ✅
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
   - Saved Jobs Page (`saved-jobs.html`): Webpage that allows you to view jobs oyu saved
   - Help Page (`jobs.html`): PoC (Proof of Concept) Contact Information to Developer Team for Bugs
   - About Page (`about.html`): Platform information

5. **CSS Implementation**
   - Modern flexbox/grid layouts
   - Responsive design
   - Cross-browser compatibility

### Backend ✅
1. **Database Integration**
   - Supabase implementation for data persistence
   - User job bookmarks storage
   - Application tracking

2. **Custom API Endpoints**
   - GET `/api/job-stats`: Retrieves job statistics
   - POST `/api/applications`: Saves job applications

## Project Structure
```
377_Project/
│   ├── index.html        # Home page
│   ├── jobs.html         # Job search page
│   ├── saved-jobs.html   # Saved jobs page
│   ├── help.html         # Help page
│   └── about.html        # About page
│   ├── app.js            # Frontend logic
│   ├── jobs.js           # Job search logic
│   ├── server.js         # Backend server
│   └── style.css         # Stylesheet
│-- docs/                 # Documentation
└-- README.md             # Project Overview & Developer Manual
└-- REQS.md             # Project Requirements Implementation
└-- PROOF_REQS..md      # Proof that our Project Requirements were met according to the rubruc

```
## How to Run Tests

**Manual Testing:**
   - Open index.html and navigate to various pages (e.g., jobs.html, about.html) to verify functionality.
   
   - Use the Job Search section on jobs.html to search for specific job positions and test the filtering functionality.
   - Use browser developer tools to inspect and debug.
   - No automated testing scripts are included in this project.


## Technologies Used
- Frontend: HTML5, CSS3, JavaScript
- Libraries: Chart.js, Slick Carousel
- Database: Supabase
- API: USAJOBS API

## Setup Instructions
1. Clone the repository
2. Use the provided environment variables within your system:
```javascript
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_KEY = 'your_supabase_key';
const USAJOBS_API_KEY = 'your_usajobs_key';
```
3. Open `index.html` in your browser

## API Documentation
- `GET /api/job-stats`: Returns job statistics
- `POST /api/applications`: Saves job applications

## Known Bugs
- Chart visualization does not load up some of the summary statistics for the different types of aggregates, when it comes to job postings, which limits the number of visualizations.

## Future Development:
- Improve search filter functionality.
- Implement user authentication to restrict access to certain features, such as job bookmarking. Only registered and authenticated users will have the ability to bookmark jobs, ensuring these features are exclusive to signed-up users.
- Voice commands and screen reader support for visually impaired users.
- Keyboard navigability for all interactive elements.
- Offline support for viewing previously saved jobs and applications.
- Trends analysis (e.g., most sought-after job types, locations, or agencies)

## Target Audience:
This documentation is intended for developers with general knowledge of web applications but no prior experience with this system. Ensure Supabase and API keys are configured correctly before development.

## Contributors
- Aaron Tekle, Amina Shabbir, Richard Lac, Hassan Wasim, and Kedrala Mohammed
