// Configuration for USAJOBS API
const API_CONFIG = {
    HOST: 'data.usajobs.gov',
    USER_AGENT: 'YOUR_EMAIL_HERE',
    AUTHORIZATION_KEY: 'CpcNpnH8/tDDrZBXcoM8eO5oMzF7Z1zsLat1BIg15PE='
};

// DOM Elements
const keywordSearch = document.getElementById('keyword-search');
const locationSearch = document.getElementById('location-search');
const remoteWork = document.getElementById('remote-work');
const searchBtn = document.getElementById('search-btn');
const jobsList = document.getElementById('jobs-list');
const sortBy = document.getElementById('sort-by');
const pagination = document.getElementById('pagination');

// State management
let currentPage = 1;
const resultsPerPage = 10;

// Event Listeners
searchBtn.addEventListener('click', performJobSearch);
sortBy.addEventListener('change', () => {
    currentPage = 1;
    performJobSearch();
});

// Main search function
async function performJobSearch() {
    try {
        showLoadingState();
        const searchParams = getSearchParams();
        const jobs = await fetchUSAJobs(searchParams);
        
        if (!Array.isArray(jobs)) {
            console.error('Invalid jobs data received:', jobs);
            return;
        }
        if (sortBy.value === 'date') {
            jobs.sort((a, b) => {
                const dateA = new Date(a.MatchedObjectDescriptor.DatePosted);
                const dateB = new Date(b.MatchedObjectDescriptor.DatePosted);
                return dateB - dateA; // Sort descending (newest first)
            });
        }
        else if (sortBy.value === 'salary'){
            jobs.sort((a,b) => {
                const salaryA = a.MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange;
                const salaryB = b.MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange;
                return salaryB - salaryA; 
            });
        }

        // Calculate stats
        const stats = {
            totalJobs: jobs.length,
            remoteJobs: 0,
            entryLevel: 0,
            recentGrad: 0
        };

        // Process each job
        jobs.forEach(job => {
            const jobData = job.MatchedObjectDescriptor;
            
            // Remote work check
            if (jobData.PositionLocationDisplay?.toLowerCase().includes('remote') ||
                jobData.UserArea?.Details?.TeleworkEligible?.toLowerCase() === 'yes') {
                stats.remoteJobs++;
            }
            
            // Entry level check
            if (jobData.JobGrade?.[0]?.Code?.match(/GS-(05|07)/i) ||
                jobData.QualificationSummary?.toLowerCase().includes('entry')) {
                stats.entryLevel++;
            }
            
            // Recent graduate check
            if (jobData.QualificationSummary?.toLowerCase().includes('recent grad')) {
                stats.recentGrad++;
            }
        });

        console.log('Job stats:', stats);
        createJobStatsChart(stats);
        displayJobs(jobs);
        updatePagination(jobs.length);
    } catch (error) {
        showError('Failed to fetch jobs. Please try again later.');
        console.error('Search error:', error);
    } finally {
        hideLoadingState();
    }
}

// Chart creation function
function createJobStatsChart(data) {
    console.log('Creating chart with data:', data);
    const ctx = document.getElementById('jobStatsChart');
    
    if (!ctx) {
        console.error('Could not find chart canvas element');
        return;
    }

    if (window.jobChart) {
        window.jobChart.destroy();
    }

    const chartData = {
        totalJobs: Number(data.totalJobs) || 0,
        remoteJobs: Number(data.remoteJobs) || 0,
        entryLevel: Number(data.entryLevel) || 0,
        recentGrad: Number(data.recentGrad) || 0
    };

    console.log('Chart data:', chartData);

    window.jobChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Jobs', 'Remote Jobs', 'Entry Level', 'Recent Graduate'],
            datasets: [{
                label: 'Job Statistics',
                data: [
                    chartData.totalJobs,
                    chartData.remoteJobs,
                    chartData.entryLevel,
                    chartData.recentGrad
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            }
        }
    });
}

// Fetch jobs from USAJOBS API
async function fetchUSAJobs(searchParams) {
    const params = new URLSearchParams({
        Keyword: searchParams.Keyword,
        LocationName: searchParams.LocationName,
        ResultsPerPage: '10',
        Fields: 'min'
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

// Get search parameters
function getSearchParams() {
    return {
        Keyword: keywordSearch.value.trim(),
        LocationName: locationSearch.value.trim(),

        Page: currentPage,
        ResultsPerPage: resultsPerPage,
        SortBy: sortBy.value
    };
}

// Display jobs in the list
function displayJobs(jobs) {
    if (!jobs.length) {
        jobsList.innerHTML = '<div class="no-results">No jobs found matching your criteria.</div>';
        return;
    }

    jobsList.innerHTML = jobs.map(job => `
        
        <div class="job-card">
            <h3>${job.MatchedObjectDescriptor.PositionTitle}</h3>
            <p>${job.MatchedObjectDescriptor.DepartmentName}</p>
            <p>${job.MatchedObjectDescriptor.PositionLocationDisplay}</p>
            <p>$${Math.floor(job.MatchedObjectDescriptor.PositionRemuneration[0].MinimumRange).toLocaleString()} - $${Math.floor(job.MatchedObjectDescriptor.PositionRemuneration[0].MaximumRange).toLocaleString()}</p>
            <a href="${job.MatchedObjectDescriptor.ApplyURI}" target="_blank">Apply Now</a>
        </div>
    `).join('');
}

// Helper functions
function updatePagination(totalResults) {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    pagination.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
    `;
}

function changePage(newPage) {
    currentPage = newPage;
    performJobSearch();
}

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

function getSalaryRangeLow(range) {
    if (!range) return null;
    const [low] = range.split('-');
    return low;
}

function getSalaryRangeHigh(range) {
    if (!range) return null;
    const [, high] = range.split('-');
    return high === '+' ? null : high;
}

// Initialize with test data
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, testing chart...');
    createJobStatsChart({
        totalJobs: 10,
        remoteJobs: 4,
        entryLevel: 6,
        recentGrad: 3
    });
    performJobSearch();
});