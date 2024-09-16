import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

const SettingsPage = ({ setShowSettings }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState('')

  const handleButtonClick = () => setShowSettings(false);

  const handleChangePassword= async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
            // Retrieve tokens from localStorage
            let item = localStorage.getItem('username');
            console.log(item)
            setUser(localStorage.getItem('username'));

            let token = localStorage.getItem('access_token');
            
            const refreshToken = localStorage.getItem('refresh_token');
            if (!token) return;

            const requestOptions = {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                  password,
              }),
            };
            // Make the fetch request
            let response = await fetch('/auth/user', requestOptions);
            // If the token is expired, refresh it
            if (response.status === 401) {
                console.log('here3')
                if (refreshToken) {
                    console.log('here4')
                    // Attempt to refresh the token
                    const refreshResponse = await fetch('/auth/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        token = refreshData.access_token;
                        localStorage.setItem('access_token', token);

                        // Retry the original request with the new token
                        requestOptions.headers['Authorization'] = `Bearer ${token}`;
                        response = await fetch('/auth/user', requestOptions);
                    } else {
                        throw new Error('Token refresh failed');
                    }
                } else {
                    throw new Error('No refresh token available');
                }
            }

            if (response.ok) {
              console.log("Password changed successfully");
            } else {
                console.log("PASSWORD NOT CHANGED");
            }

        } catch (err) {
            console.error('Error fetching cameras:', err);
        }
    }

  return (
    <Container>
     <button id="Settings" onClick={() => handleButtonClick()}>Back</button>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">
              Username: {user?.username}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">
              Email: {user?.email}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Typography color="error">
                {error}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleChangePassword}
            >
              Change Password
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SettingsPage;
