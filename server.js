const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://wmxflpgdaivlvehivgxj.supabase.co';
const supabaseKey = 'your_supabase_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// API Endpoint 1: Get Job Statistics
app.get('/api/job-stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('saved_jobs')
            .select('*')
            .order('saved_date', { ascending: false });

        if (error) throw error;

        // Process the data to get statistics
        const stats = {
            totalSaved: data.length,
            recentlySaved: data.filter(job => {
                const savedDate = new Date(job.saved_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return savedDate > weekAgo;
            }).length,
            // Add more statistics as needed
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API Endpoint 2: Save Job Application Status
app.post('/api/applications', async (req, res) => {
    try {
        const { jobId, status, notes } = req.body;
        const { data, error } = await supabase
            .from('job_applications')
            .insert([
                {
                    job_id: jobId,
                    status: status,
                    notes: notes,
                    application_date: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
