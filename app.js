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
                    }')" class="save-btn"
                    style="color: green; font-weight: bold;">
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
// Update the saveJob function
// Save job to localStorage
async function saveJob(jobId) {
    try {
        // Fetch the full job details before saving
        const jobDetails = await fetchUSAJobs(jobId, '');
        const job = jobDetails[0]; // Assuming the first result is the correct job

        if (!job) {
            throw new Error('Job details not found');
        }

        // Get existing saved jobs from localStorage
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

        // Check if the job is already saved
        const jobExists = savedJobs.some(savedJob => savedJob.job_id === jobId);
        if (jobExists) {
            alert('Job is already saved!');
            return;
        }

        // Save job details to localStorage
        savedJobs.push({
            job_id: jobId,
            job_title: job.MatchedObjectDescriptor.PositionTitle,
            department: job.MatchedObjectDescriptor.DepartmentName,
            location: job.MatchedObjectDescriptor.PositionLocationDisplay,
            apply_uri: job.MatchedObjectDescriptor.ApplyURI
        });

        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));

        // Show success alert
        alert('Job saved successfully!');
    } catch (error) {
        console.error('Error saving job:', error);
        alert('Failed to save job. Please try again.');
    }
}

// Update the savedJobsBtn click handler
// Update the savedJobsBtn click handler
savedJobsBtn.addEventListener('click', () => {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];

    if (savedJobs.length === 0) {
        jobsList.innerHTML = '<p class="no-results">No saved jobs found.</p>';
        return;
    }

    // Display saved jobs, filtering out any undefined or incomplete jobs
    jobsList.innerHTML = savedJobs
        .filter(job => job && job.job_title && job.department && job.location && job.apply_uri) // Filter out undefined jobs
        .map(job => `
            <div class="job-card">
                <h3>${job.job_title}</h3>
                <p class="department">${job.department}</p>
                <p class="location">${job.location}</p>
                <div class="job-actions">
                    <a href="${job.apply_uri}" 
                       target="_blank" 
                       class="apply-btn">
                        Apply Now
                    </a>
                </div>
            </div>
        `)
        .join('');

    // If all jobs were filtered out, show a no results message
    if (jobsList.innerHTML === '') {
        jobsList.innerHTML = '<p class="no-results">No valid saved jobs found.</p>';
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
                <a href="${job.MatchedObjectDescriptor.ApplyURI}" target="_blank" class="job-link">
                    <h3>${job.MatchedObjectDescriptor.PositionTitle}</h3>
                </a>
                <p>${job.MatchedObjectDescriptor.DepartmentName}</p>
                <p>${job.MatchedObjectDescriptor.PositionLocationDisplay}</p>
                <div class="job-actions">
                    <button onclick="saveJob('${job.MatchedObjectId}')" class="save-btn"
                        style="color: green; font-weight: bold;">
                        Save Job
                    </button>
                </div>
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
        autoplay: true,       // Enable autoplay
        autoplaySpeed: 2000,  // Time between slides (2 seconds)
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

// ... existing code ...
// ... existing code ...
$(document).ready(function(){
    // Initialize the carousel
    $('.carousel').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    });

    // Fetch featured jobs from the API
// Update the existing fetchFeaturedJobs function in app.js
// Update the existing fetchFeaturedJobs function in app.js
async function fetchFeaturedJobs() {
    try {
        const response = await fetch('/api/featured-jobs'); // Adjust the endpoint as needed
        const jobs = await response.json();

        // Populate the carousel with job items
        const carousel = $('#featured-jobs-carousel');
        jobs.forEach(job => {
            const jobItem = `
    <div class="job-item">
        <a href="${job.ApplyURI}" target="_blank" class="job-link">
            ${job.PositionTitle}
        </a>
    </div>
`;
            carousel.append(jobItem);
        });

        // Initialize the carousel after adding items
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
    } catch (error) {
        console.error('Error fetching featured jobs:', error);
    }
}

    fetchFeaturedJobs(); // Call the function to fetch jobs
});
// ... existing code ...
// ... existing code ...
