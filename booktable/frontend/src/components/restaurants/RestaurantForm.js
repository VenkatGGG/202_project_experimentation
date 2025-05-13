import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  MenuItem,
  Stack
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

const cuisineTypes = [
  'American',
  'Italian',
  'Chinese',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'Mediterranean',
  'French',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Other'
];

const RestaurantForm = ({ initialData, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    cuisineType: initialData?.cuisineType || '',
    costRating: initialData?.costRating || '',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      zip: initialData?.address?.zip || ''
    },
    contactInfo: {
      phone: initialData?.contactInfo?.phone || '',
      email: initialData?.contactInfo?.email || ''
    },
    hours: {
      opening: initialData?.hours?.opening ? moment(initialData.hours.opening, 'HH:mm') : moment('09:00', 'HH:mm'),
      closing: initialData?.hours?.closing ? moment(initialData.hours.closing, 'HH:mm') : moment('22:00', 'HH:mm')
    },
    capacity: initialData?.capacity || '',
    photos: initialData?.photos || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTimeChange = (time, field) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [field]: time
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      hours: {
        opening: formData.hours.opening.format('HH:mm'),
        closing: formData.hours.closing.format('HH:mm')
      }
    };
    onSubmit(formattedData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Restaurant Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Cuisine Type"
            name="cuisineType"
            value={formData.cuisineType}
            onChange={handleChange}
            required
          >
            {cuisineTypes.map((cuisine) => (
              <MenuItem key={cuisine} value={cuisine}>
                {cuisine}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Cost Rating (1-4)"
            name="costRating"
            type="number"
            value={formData.costRating}
            onChange={handleChange}
            required
            inputProps={{ min: 1, max: 4 }}
            helperText="1 ($) to 4 ($$$$)"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Seating Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleChange}
            required
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Address
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="City"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="State"
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="ZIP Code"
            name="address.zip"
            value={formData.address.zip}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Contact Information
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">+1</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="contactInfo.email"
            type="email"
            value={formData.contactInfo.email}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Operating Hours
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              label="Opening Time"
              value={formData.hours.opening}
              onChange={(newValue) => handleTimeChange(newValue, 'opening')}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimePicker
              label="Closing Time"
              value={formData.hours.closing}
              onChange={(newValue) => handleTimeChange(newValue, 'closing')}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Photos
          </Typography>
          <TextField
            fullWidth
            label="Photo URLs"
            name="photos"
            value={formData.photos.join('\n')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              photos: e.target.value.split('\n').filter(url => url.trim())
            }))}
            multiline
            rows={3}
            helperText="Enter one URL per line"
          />
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : (initialData ? 'Update Restaurant' : 'Create Restaurant')}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantForm;
