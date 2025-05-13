import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  MenuItem,
  Stack,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

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

const RestaurantForm = ({ initialData, onSubmit, loading, error, isEdit = false }) => {
  console.log('Initial data received:', initialData);
  
  // Ensure tables are properly initialized with the requested sizes
  const defaultTables = [
    { tableSize: 1, count: 0 },
    { tableSize: 2, count: 0 },
    { tableSize: 4, count: 0 },
    { tableSize: 6, count: 0 },
    { tableSize: 8, count: 0 },
    { tableSize: 10, count: 0 },
    { tableSize: 20, count: 0 }
  ];
  
  // Initialize tables from initialData if available, otherwise use defaults
  let initialTables = defaultTables;
  if (initialData?.tables && Array.isArray(initialData.tables) && initialData.tables.length > 0) {
    // Use existing tables data, but ensure all required sizes are present
    
    // Create a complete table array with all required sizes
    initialTables = defaultTables.map(defaultTable => {
      const existingTable = initialData.tables.find(t => t.tableSize === defaultTable.tableSize);
      return existingTable || defaultTable;
    });
  }
  
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
    photos: initialData?.photos || [],
    tables: initialTables
  });
  
  // State for photo upload
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Update form data when initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      console.log('Updating form with initial data:', initialData);
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        cuisineType: initialData.cuisineType || '',
        costRating: initialData.costRating || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          zip: initialData.address?.zip || ''
        },
        contactInfo: {
          phone: initialData.contactInfo?.phone || '',
          email: initialData.contactInfo?.email || ''
        },
        hours: {
          opening: initialData.hours?.opening ? moment(initialData.hours.opening, 'HH:mm') : moment('09:00', 'HH:mm'),
          closing: initialData.hours?.closing ? moment(initialData.hours.closing, 'HH:mm') : moment('22:00', 'HH:mm')
        },
        capacity: initialData.capacity || '',
        photos: initialData.photos || [],
        tables: initialTables
      });
    }
  }, [initialData]); // Remove initialTables from dependencies to prevent circular updates

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

  const handleTableChange = (index, field, value) => {
    setFormData(prev => {
      const updatedTables = [...prev.tables];
      updatedTables[index] = {
        ...updatedTables[index],
        [field]: value
      };
      return {
        ...prev,
        tables: updatedTables
      };
    });
  };

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove a photo from the list
  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };
  
  // Clear the selected photo
  const handleClearSelectedPhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    // Create FormData for file upload
    const formattedData = new FormData();
    
    // Add basic fields
    formattedData.append('name', formData.name);
    formattedData.append('description', formData.description);
    formattedData.append('cuisineType', formData.cuisineType);
    formattedData.append('costRating', formData.costRating);
    formattedData.append('capacity', formData.capacity);
    
    // Add address fields
    Object.entries(formData.address).forEach(([key, value]) => {
      formattedData.append(`address[${key}]`, value);
    });
    
    // Add contact info fields
    Object.entries(formData.contactInfo).forEach(([key, value]) => {
      formattedData.append(`contactInfo[${key}]`, value);
    });
    
    // Add hours
    formattedData.append('hours[opening]', formData.hours.opening.format('HH:mm'));
    formattedData.append('hours[closing]', formData.hours.closing.format('HH:mm'));
    
    // Add tables (filter out tables with count 0)
    const validTables = formData.tables.filter(table => table.count > 0);
    formattedData.append('tables', JSON.stringify(validTables));
    
    // Add existing photos
    if (formData.photos && formData.photos.length > 0) {
      formattedData.append('existingPhotos', JSON.stringify(formData.photos));
    }
    
    // Add new photo if selected
    if (selectedPhoto) {
      formattedData.append('photo', selectedPhoto);
    }
    
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
            Table Management
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Specify the number of tables available for each size
          </Typography>
        </Grid>
        
        {formData.tables.map((table, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <TextField
              fullWidth
              label={`${table.tableSize}-Person Tables`}
              type="number"
              value={table.count}
              onChange={(e) => handleTableChange(index, 'count', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2">{table.tableSize}x</Typography>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        ))}

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
          <Typography variant="h6" gutterBottom>
            Photos
          </Typography>
          
          {/* Display existing photos */}
          {formData.photos && formData.photos.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Current Photos:</Typography>
              <Grid container spacing={1}>
                {formData.photos.map((photo, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        position: 'relative',
                        height: 120,
                        overflow: 'hidden',
                        backgroundImage: `url(${photo})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <IconButton 
                        size="small" 
                        sx={{ 
                          position: 'absolute', 
                          top: 5, 
                          right: 5, 
                          bgcolor: 'rgba(255,255,255,0.7)' 
                        }}
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Photo URL input */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Photo URLs"
            name="photos"
            value={formData.photos.join('\n')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              photos: e.target.value.split('\n').filter(url => url.trim())
            }))}
            helperText="Enter one URL per line"
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          {/* Photo upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ mb: 2 }}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
            
            {/* Photo preview */}
            {photoPreview && (
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, mb: 2 }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 1,
                    height: 200,
                    backgroundImage: `url(${photoPreview})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <IconButton 
                  size="small" 
                  sx={{ 
                    position: 'absolute', 
                    top: 5, 
                    right: 5, 
                    bgcolor: 'rgba(255,255,255,0.7)' 
                  }}
                  onClick={handleClearSelectedPhoto}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                  {selectedPhoto?.name} ({Math.round(selectedPhoto?.size / 1024)} KB)
                </Typography>
              </Box>
            )}
          </Box>
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
