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
    


    const loginUser=(data)=>{
       console.log(data)

       const requestOptions={
           method:"POST",
           headers:{
               'content-type':'application/json'
           },
           body:JSON.stringify(data)
       }
        
       fetch('/auth/login',requestOptions)
       .then(res=>res.json())
       .then(data=>{
           console.log(data.access_token)
           
           if (data){
            login(data.access_token)
            console.log("logging in!")
            history.push('/')
           }
           else{
               alert('Invalid username or password')
           }


       })
       reset()
    }

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