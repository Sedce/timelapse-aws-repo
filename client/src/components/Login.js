import React, { useState } from 'react';
import {Form,Button} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {useForm} from 'react-hook-form'
import { login } from '../auth'
import {useHistory} from 'react-router-dom'
import { Box, Typography } from '@mui/material';


const style = {
    backgroundColor:'rgb(255,255,255,0.5)',
    paddding:'20px',
    width: '300px'
  };

const LoginPage=()=>{
    
    const {register,handleSubmit,reset,formState:{errors}}=useForm()

    const history=useHistory()
    


    const loginUser = (data) => {
        console.log(data); // Logging user input data
    
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
                // Handle HTTP errors
                throw new Error('Login failed');
            }
            return res.json(); // Parse the JSON response
        })
        .then(data => {
            console.log(data.access_token); // Logging the received access token
            
            if (data && data.access_token) {
                // Save the tokens in localStorage
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token); // If you are using refresh tokens
                
                console.log(data.access_token)
                // Optional: Call the login function from createAuthProvider
                login(data.access_token);
    
                console.log("Logging in!");
                
                // Redirect to the home page or another route
                history.push('/');
            } else {
                alert('Invalid username or password');
            }
        })
        .catch(err => {
            console.error('Error during login:', err.message); // Log any error that occurred during the fetch
            alert('Login failed. Please try again.');
        });
    
        reset(); // Reset the form fields (assuming reset is a function that does this)
    };

    return(
        <div className="container">
        <h1>Timelapse Management System</h1>
        <Box sx={style}>
            <form style={{padding:'20px'}}>
                <Typography>Welcome!</Typography>
                <Form.Group>
                    <Form.Control type="text"
                        placeholder="Your username"
                        {...register('username',{required:true,maxLength:25})}
                    />
                </Form.Group>
                {errors.username && <p style={{color:'red'}}><small>Username is required</small></p>}
                {errors.username?.type === "maxLength" && <p style={{color:'red'}}><small>Username should be 25 characters</small></p>}
                <br></br>
               
                <Form.Group>
                    <Form.Control type="password"
                        placeholder="Your password"
                        {...register('password',{required:true,minLength:8})}
                    />
                </Form.Group>
                {errors.username && <p style={{color:'red'}}><small>Password is required</small></p>}
                {errors.password?.type === "maxLength" && <p style={{color:'red'}}>
                    <small>Password should be more than 8 characters</small>
                    </p>}
                <br></br>
                <Form.Group>
                    <Button as="sub" variant="primary" onClick={handleSubmit(loginUser)} style={{backgroundColor:'red'}}>LOGIN</Button>
                </Form.Group>
                <br></br>
                
            </form>
        </Box>
    </div>
    )
}

export default LoginPage