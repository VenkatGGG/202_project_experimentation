import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Paper, CircularProgress, Alert, Container } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { fetchBookingAnalytics } from '../../features/analytics/analyticsSlice';
import moment from 'moment';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const { bookingStats, status, error } = useSelector((state) => state.analytics);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch analytics only if user is admin and data hasn't been fetched or is stale
    // (basic check, could be more sophisticated with timestamps)
    if (user && user.role === 'admin' && status === 'idle') {
      dispatch(fetchBookingAnalytics());
    }
  }, [dispatch, user, status]);

  if (!user || user.role !== 'admin') {
    return <Alert severity="error">Access Denied. You must be an admin to view this page.</Alert>;
  }

  if (status === 'loading') {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  if (status === 'failed') {
    return <Alert severity="error">Error fetching analytics: {error?.error || error?.message || JSON.stringify(error)}</Alert>;
  }
  
  const chartLabels = bookingStats.map(stat => moment(`${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`).format('MMM D'));
  
  const totalBookingsData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Total Bookings per Day (Last 30 Days)',
        data: bookingStats.map(stat => stat.totalBookings),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const averagePartySizeData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Average Party Size per Day (Last 30 Days)',
        data: bookingStats.map(stat => stat.averagePartySize),
        fill: false,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Optional: for line charts, fill color under line
        tension: 0.1,
      },
    ],
  };

  const chartOptions = (chartTitle) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartTitle,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { 
                precision: 0 // Ensure y-axis shows whole numbers for counts
            }
        },
        x: {
            title: {
                display: true,
                text: 'Date'
            }
        }
    }
  });

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 10, sm: 12, md: 14 },
        mb: 4,
        pt: 2,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center"
          sx={{
            fontWeight: 700,
            mb: 4,
            color: 'text.primary',
          }}
        >
          Admin Analytics Dashboard
        </Typography>
        {bookingStats.length === 0 && status === 'succeeded' && (
          <Alert severity="info" sx={{ mt: 2 }}>No booking data available for the last month.</Alert>
        )}
        {bookingStats.length > 0 && (
          <Box>
            <Box sx={{ height: '400px', mb: 5 }}>
              <Bar options={chartOptions('Total Bookings')} data={totalBookingsData} />
            </Box>
            <Box sx={{ height: '400px' }}>
              <Line options={chartOptions('Average Party Size')} data={averagePartySizeData} />
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboard;
