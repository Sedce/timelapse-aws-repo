import React from 'react'
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import halfway from '../styles/halfway.png';

const Camera=({onClick, name, status})=>{

    return(
        <Card sx={{ maxWidth: 340}}>
        <CardActionArea>
          <CardMedia
            sx={{ border: 'solid', borderColor:( status ? 'green': 'red')}}
            component="img"
            height="180"
            src={halfway}
            alt="camera"
          />
        </CardActionArea>
        <CardActions sx={{backgroundColor:'red'}}>
          <Button size="small" color="primary" onClick={onClick}>
            <Typography color="common.white">{name}</Typography>
          </Button>
        </CardActions>
      </Card>
    )
}


export default Camera;
