import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SupportIcon from '@mui/icons-material/Support';
import { colors } from '../../styles/designSystem';

const About = () => {
  const theme = useTheme();

  const stats = [
    { icon: <RestaurantIcon sx={{ fontSize: 40 }} />, value: '1000+', label: 'Restaurants' },
    { icon: <PeopleIcon sx={{ fontSize: 40 }} />, value: '50K+', label: 'Happy Customers' },
    { icon: <AccessTimeIcon sx={{ fontSize: 40 }} />, value: '24/7', label: 'Support' },
    { icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />, value: '98%', label: 'Satisfaction' }
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'Founder & CEO',
      image: 'https://source.unsplash.com/random/400x400/?portrait,man',
      description: 'Passionate about revolutionizing the dining experience.'
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Operations',
      image: 'https://source.unsplash.com/random/400x400/?portrait,woman',
      description: 'Ensuring seamless restaurant partnerships and operations.'
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      image: 'https://source.unsplash.com/random/400x400/?portrait,asian',
      description: 'Building the technology that powers our platform.'
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden', background: 'linear-gradient(135deg, #F0FDFA 0%, #E0F2FE 100%)' }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.900',
          color: '#fff',
          mb: 8,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random/1920x1080/?restaurant,team)',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            background: `linear-gradient(135deg, 
              ${alpha('#134E4A', 0.95)} 0%, 
              ${alpha('#0F766E', 0.9)} 50%, 
              ${alpha('#14B8A6', 0.85)} 100%)`,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  background: 'linear-gradient(45deg, #fff 30%, #E0F2FE 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                About BookTable
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  color: '#E0F2FE'
                }}
              >
                Revolutionizing the way people discover and book restaurants
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Paper>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Fade in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #fff 0%, #F0FDFA 100%)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    transition: 'all 0.3s ease-in-out',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(20, 184, 166, 0.15)',
                      background: 'linear-gradient(135deg, #fff 0%, #E0F2FE 100%)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      color: '#0F766E',
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: colors.primary.main,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Mission Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(colors.primary.main, 0.97)} 0%, 
            ${alpha(colors.primary.dark, 0.95)} 50%,
            ${alpha(colors.primary.light, 0.93)} 100%)`,
          color: colors.primary.contrast,
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(https://source.unsplash.com/random/1920x1080/?restaurant,pattern)',
            backgroundSize: 'cover',
            opacity: 0.05,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      mb: 3,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      color: colors.primary.contrast,
                    }}
                  >
                    Our Mission
                  </Typography>
                  <Typography
                    variant="h6"
                    paragraph
                    sx={{
                      mb: 3,
                      opacity: 0.9,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      color: alpha(colors.primary.contrast, 0.9),
                      lineHeight: 1.8,
                    }}
                  >
                    At BookTable, we're on a mission to transform the dining experience. We believe that finding and booking a restaurant should be as effortless as enjoying the meal itself. Our platform connects food lovers with their perfect dining destinations, making every reservation a seamless experience.
                  </Typography>
                  <Typography
                    variant="h6"
                    paragraph
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      color: alpha(colors.primary.contrast, 0.9),
                      lineHeight: 1.8,
                    }}
                  >
                    We work tirelessly to ensure that every restaurant on our platform meets our high standards of quality and service, providing our users with the best possible dining experiences.
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000} style={{ transitionDelay: '500ms' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {[
                    {
                      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
                      title: 'Secure Booking',
                      description: 'Your reservations are protected with industry-leading security measures.'
                    },
                    {
                      icon: <SupportIcon sx={{ fontSize: 32 }} />,
                      title: '24/7 Support',
                      description: 'Our dedicated team is always here to help you with any questions.'
                    },
                    {
                      icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />,
                      title: 'Quality Assured',
                      description: 'Every restaurant is carefully vetted to ensure the best experience.'
                    }
                  ].map((feature, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          background: 'rgba(255, 255, 255, 0.15)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            color: '#fff',
                            p: 1.5,
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: '#fff',
                              mb: 0.5,
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Container maxWidth="lg" sx={{ my: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: colors.primary.main,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Meet Our Team
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: colors.text.secondary,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}
          >
            The passionate people behind BookTable
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out',
                    background: 'linear-gradient(135deg, #fff 0%, #F0FDFA 100%)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(20, 184, 166, 0.15)',
                      background: 'linear-gradient(135deg, #fff 0%, #E0F2FE 100%)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #134E4A 30%, #0F766E 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{
                        color: '#14B8A6',
                        fontWeight: 500,
                        mb: 2,
                      }}
                    >
                      {member.role}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748B',
                        lineHeight: 1.6,
                      }}
                    >
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default About; 