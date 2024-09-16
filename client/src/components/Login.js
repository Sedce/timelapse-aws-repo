import React, { useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { login } from '../auth';
import { useHistory } from 'react-router-dom';
import evvpLogo from '../styles/EVVAP-WHITE.png';
import { Box, Typography } from '@mui/material';

const style = {
    backgroundColor: 'rgb(255,255,255,0.5)',
    padding: '20px',
    width: '300px'
};

const LoginPage = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const history = useHistory();

    const loginUser = (data) => {
        const requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Convert the user data to a JSON string
        };

        fetch('/auth/login', requestOptions)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Login failed');
                }
                return res.json(); // Parse the JSON response
            })
            .then(data => {
                if (data && data.access_token) {
                    // Save the tokens in localStorage
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);

                    // Optional: Call the login function from createAuthProvider
                    login(data.access_token);

                    // Redirect to the home page or another route
                    history.push('/');
                } else {
                    alert('Invalid username or password');
                }
            })
            .catch(err => {
                console.error('Error during login:', err.message);
                alert('Login failed. Please try again.');
            });

        reset(); // Reset the form fields
    };

    // Add event listener for the "Enter" key
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit(loginUser)();  // Trigger form submission
            }
        };

        window.addEventListener('keypress', handleKeyPress);

        // Cleanup the event listener on unmount
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, [handleSubmit]); // Dependency array ensures the effect runs only once

    return (
        <div className="container">
            <Box
                component="img"
                sx={{
                    height: 'auto',
                    width: 233,
                    margin: '10px',
                }}
                src={evvpLogo}
            />
            <Box sx={style}>
                <form style={{ padding: '20px' }}>
                    <Typography>Welcome!</Typography>
                    <Form.Group>
                        <Form.Control
                            type="text"
                            placeholder="Your username"
                            {...register('username', { required: true, maxLength: 25 })}
                        />
                    </Form.Group>
                    {errors.username && <p style={{ color: 'red' }}><small>Username is required</small></p>}
                    {errors.username?.type === "maxLength" && <p style={{ color: 'red' }}><small>Username should be less than 25 characters</small></p>}
                    <br></br>

                    <Form.Group>
                        <Form.Control
                            type="password"
                            placeholder="Your password"
                            {...register('password', { required: true, minLength: 8 })}
                        />
                    </Form.Group>
                    {errors.password && <p style={{ color: 'red' }}><small>Password is required</small></p>}
                    {errors.password?.type === "minLength" && <p style={{ color: 'red' }}>
                        <small>Password should be at least 8 characters</small>
                    </p>}
                    <br></br>
                    <Form.Group>
                        <Button as="sub" variant="primary" onClick={handleSubmit(loginUser)} style={{ backgroundColor: 'red' }}>LOGIN</Button>
                    </Form.Group>
                    <br></br>
                </form>
            </Box>
        </div>
    );
};

export default LoginPage;
