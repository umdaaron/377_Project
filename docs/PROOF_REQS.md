# Breakdown with direct examples proving the project requirements were met.


### **1. Frontend Requirements (110 pts)**  
**a) FetchAPI Calls**  
- **External API**: USAJOBS API  
   - **Example**: `fetchUSAJobs()` function in `app.js`  
   ```javascript
   const response = await fetch(`https://data.usajobs.gov/api/search?${params}`, { headers: API_CONFIG });
   ```
- **Backend API Calls**:  
   - **Get Job Statistics**: `/api/job-stats`  
     Example in `app.js`:  
     ```javascript
     const response = await fetch('http://localhost:3000/api/job-stats');
     ```
   - **Save Application Status**: `/api/applications`  
     Example in `app.js`:  
     ```javascript
     await fetch('http://localhost:3000/api/applications', { method: 'POST', body: JSON.stringify({ jobId, status }) });
     ```

**b) JavaScript Libraries**  
- **Chart.js**: Used for job statistics in `jobs.js`:  
   ```javascript
   new Chart(ctx, { type: 'bar', data: { labels, datasets } });
   ```
- **Slick Carousel**: Featured Jobs in `index.html`  
   ```javascript
   $('.carousel').slick({ dots: true, autoplay: true, slidesToShow: 3 });
   ```

**c) Responsive CSS (Flexbox/Grids)**  
- Flexbox used for the navigation bar in `style.css`:  
   ```css
   nav ul { display: flex; justify-content: center; gap: 2rem; }
   ```

**d) Application Pages**  
- **Home Page**: `index.html`  
- **About Page**: `about.html`  
- **Core Functionality Page**: `jobs.html` (Job Search & Statistics)  

---

### **2. Backend Requirements (60 pts)**  
**a) Supabase Database Integration**  
- Example: `server.js` connects to Supabase.  
   ```javascript
   const supabase = createClient(supabaseUrl, supabaseKey);
   ```

**b) Custom API Endpoints**  
- **Retrieve Data**: `/api/job-stats`  
   ```javascript
   app.get('/api/job-stats', async (req, res) => { /* Fetch saved jobs */ });
   ```
- **Write Data**: `/api/applications`  
   ```javascript
   app.post('/api/applications', async (req, res) => { /* Save job application status */ });
   ```

---

### **3. Deployment Requirements (30 pts)**  
- **Deployment Ready**:  
   Project deployed onto vercel.  (https://377-final-project-nine.vercel.app/)

---

### **4. Extra Credit (CSS Animations)**  
- **Button Animations** in `style.css`:  
   ```css
   .search-btn:hover { box-shadow: 0 4px 10px rgba(20, 167, 62, 0.8); }
   ```

- **Text Animations**: Saved Jobs H1:  
   ```css
   @keyframes greenCycle { 0% { color: #4CAF50; } 50% { color: red; } }
   ```
