// Supabase initialization
const supabaseUrl = 'https://wmxflpgdaivlvehivgxj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteGZscGdkYWl2bHZlaGl2Z3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxNTY0OTYsImV4cCI6MjA0ODczMjQ5Nn0.G8UCCXowqppLg_z1mzCMM9qlYuknVq8uQxfDVwFUd6I'
const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Configuration for USAJOBS API
const API_CONFIG = {
    HOST: 'data.usajobs.gov',
    USER_AGENT: 'YOUR_EMAIL_HERE',  // Replace with email registered with USAJOBS
    AUTHORIZATION_KEY: 'CpcNpnH8/tDDrZBXcoM8eO5oMzF7Z1zsLat1BIg15PE='  // Replace with  USAJOBS API key
};

// DOM Elements
const searchInput = document.getElementById('job-search');
const categorySelect = document.getElementById('job-category');
const searchBtn = document.getElementById('search-btn');
const jobsList = document.getElementById('jobs-list');
const recentJobsBtn = document.getElementById('recent-jobs');
const savedJobsBtn = document.getElementById('saved-jobs');
const profileBtn = document.getElementById('profile');

// Event Listeners
searchBtn.addEventListener('click', performJobSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performJobSearch();
});

// Main search function
async function performJobSearch() {
    const searchTerm = searchInput.value.trim();
    const category = categorySelect.value;
    
    try {
        showLoadingState();
        const jobs = await fetchUSAJobs(searchTerm, category);
        displayJobs(jobs);
    } catch (error) {
        showError('Failed to fetch jobs. Please try again later.');
        console.error('Search error:', error);
    } finally {
        hideLoadingState();
    }
}

// Fetch jobs from USAJOBS API
async function fetchUSAJobs(keyword, category) {
    const params = new URLSearchParams({
        Keyword: keyword,
        ResultsPerPage: '10',
        Fields: 'min',
        ...(category && { JobCategoryCode: category })
    });

    const response = await fetch(`https://data.usajobs.gov/api/search?${params}`, {
        headers: {
            'Authorization-Key': API_CONFIG.AUTHORIZATION_KEY,
            'Host': API_CONFIG.HOST,
            'User-Agent': API_CONFIG.USER_AGENT
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.SearchResult.SearchResultItems;
}

//Removes decimals and adds commas
function formatSalaryWithCommas(salary) {
  let salaryNumber = parseFloat(salary);

  if (isNaN(salaryNumber)) return "$0";

  let integerPart = Math.floor(salaryNumber);

  // Add commas to the integer part
  let integerWithCommas = "";
  let count = 0;
  for (let i = integerPart.toString().length - 1; i >= 0; i--) {
    integerWithCommas = integerPart.toString()[i] + integerWithCommas;
    count++;
    if (count % 3 === 0 && i !== 0) {
      integerWithCommas = "," + integerWithCommas;
    }
  }

  return "$" + integerWithCommas;
}

function displayJobs(jobs) {
  if (!jobs.length) {
    jobsList.innerHTML =
      '<p class="no-results">No jobs found. Try different search terms.</p>';
    return;
  }

  jobsList.innerHTML = jobs
    .map((job) => {
      const minSalary =
        job.MatchedObjectDescriptor.PositionRemuneration[0].MinimumRange;
      const maxSalary =
        job.MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange;
      const salaryInterval =
        job.MatchedObjectDescriptor.PositionRemuneration[0].RateIntervalCode;

      return `
            <div class="job-card">
                <h3>${job.MatchedObjectDescriptor.PositionTitle}</h3>
                <p class="department">${
                  job.MatchedObjectDescriptor.DepartmentName
                }</p>
                <p class="location">${
                  job.MatchedObjectDescriptor.PositionLocationDisplay
                }</p>
                <div class="salary">
                    ${formatSalaryWithCommas(
                      minSalary
                    )} - ${formatSalaryWithCommas(maxSalary)} ${salaryInterval}
                </div>
                <div class="job-actions">
                    <button onclick="saveJob('${
                      job.MatchedObjectId
                    }')" class="save-btn">
                        Save Job
                    </button>
                    <a href="${job.MatchedObjectDescriptor.ApplyURI}" 
                       target="_blank" 
                       class="apply-btn">
                        Apply Now
                    </a>
                </div>
            </div>
        `;
    })
    .join("");
}

// Save job to localStorage
async function saveJob(jobId) {
    try {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        if (!savedJobs.includes(jobId)) {
            // Save to localStorage
            savedJobs.push(jobId);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            
            // Save to Supabase
            const { data, error } = await supabaseClient
                .from('saved_jobs')
                .insert([
                    { 
                        job_id: jobId,
                        user_id: 'guest', // Replace with actual user ID when auth is implemented
                        saved_date: new Date().toISOString()
                    }
                ]);
                
            if (error) throw error;
            showNotification('Job saved successfully!');
        } else {
            showNotification('Job already saved!');
        }
    } catch (error) {
        console.error('Error saving job:', error);
        showNotification('Failed to save job. Please try again.');
    }
}

// Update savedJobsBtn click handler
savedJobsBtn.addEventListener('click', async () => {
    try {
        showLoadingState();
        
        // Fetch saved jobs from Supabase
        const { data: savedJobsData, error } = await supabaseClient
            .from('saved_jobs')
            .select('job_id')
            .eq('user_id', 'guest');

        if (error) throw error;

        if (!savedJobsData || savedJobsData.length === 0) {
            jobsList.innerHTML = '<p class="no-results">No saved jobs found.</p>';
            return;
        }

        // Fetch job details for each saved job
        const jobPromises = savedJobsData.map(saved => 
            fetchUSAJobs(saved.job_id, '')
        );

        const jobs = await Promise.all(jobPromises);
        displayJobs(jobs.flat());

    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        showError('Failed to load saved jobs. Please try again later.');
    } finally {
        hideLoadingState();
    }
});


// UI Helper Functions
function showLoadingState() {
    jobsList.innerHTML = '<div class="loading">Loading jobs...</div>';
}

function hideLoadingState() {
    const loadingEl = jobsList.querySelector('.loading');
    if (loadingEl) loadingEl.remove();
}

function showError(message) {
    jobsList.innerHTML = `<div class="error">${message}</div>`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add these functions to app.js

// Function to fetch job statistics
async function fetchJobStats() {
    try {
        const response = await fetch('http://localhost:3000/api/job-stats');
        const stats = await response.json();
        
        // Update UI with statistics
        document.getElementById('total-saved').textContent = stats.totalSaved;
        document.getElementById('recent-saved').textContent = stats.recentlySaved;
    } catch (error) {
        console.error('Error fetching job stats:', error);
    }
}

// Function to save job application status
async function saveApplicationStatus(jobId, status, notes) {
    try {
        const response = await fetch('http://localhost:3000/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobId, status, notes })
        });
        const result = await response.json();
        showNotification('Application status updated successfully!');
    } catch (error) {
        console.error('Error saving application status:', error);
        showNotification('Failed to update application status');
    }
}

// Add to your existing initialization code
document.addEventListener('DOMContentLoaded', () => {
    performJobSearch();
    fetchJobStats(); // Fetch initial statistics
});
// Quick Access Button Handlers
recentJobsBtn.addEventListener('click', () => {
    // Implementation for showing recent jobs
    performJobSearch();
});

savedJobsBtn.addEventListener('click', () => {
    // Implementation for showing saved jobs
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (savedJobs.length === 0) {
        jobsList.innerHTML = '<p class="no-results">No saved jobs found.</p>';
        return;
    }
    // Fetch and display saved jobs
    // This would need to fetch each saved job by ID
});

profileBtn.addEventListener('click', () => {
    // Implementation for profile page navigation
    // This could be expanded based on your authentication system
    alert('Profile feature coming soon!');
});

// Initialize job statistics chart
function initializeJobStats(data) {
    const ctx = document.getElementById('jobStatsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Saved', 'Recent Saves'],
            datasets: [{
                label: 'Job Statistics',
                data: [data.totalSaved, data.recentlySaved],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize featured jobs carousel
function initializeFeaturedJobs(jobs) {
    const carousel = $('.featured-jobs-carousel');
    carousel.empty();
    
    jobs.forEach(job => {
        carousel.append(`
            <div class="featured-job">
                <h3>${job.MatchedObjectDescriptor.PositionTitle}</h3>
                <p>${job.MatchedObjectDescriptor.DepartmentName}</p>
                <p>${job.MatchedObjectDescriptor.PositionLocationDisplay}</p>
            </div>
        `);
    });

    // Initialize Slick carousel
    carousel.slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
}

// Update the existing fetchJobStats function
async function fetchJobStats() {
    try {
        const response = await fetch('http://localhost:3000/api/job-stats');
        const stats = await response.json();
        initializeJobStats(stats);
    } catch (error) {
        console.error('Error fetching job stats:', error);
    }
}

// Update performJobSearch to initialize carousel
async function performJobSearch() {
    try {
        showLoadingState();
        const searchTerm = searchInput.value.trim();
        const category = categorySelect.value;
        const jobs = await fetchUSAJobs(searchTerm, category);
        displayJobs(jobs);
        initializeFeaturedJobs(jobs.slice(0, 5)); // Show first 5 jobs in carousel
    } catch (error) {
        showError('Failed to fetch jobs. Please try again later.');
        console.error('Search error:', error);
    } finally {
        hideLoadingState();
    }
}
