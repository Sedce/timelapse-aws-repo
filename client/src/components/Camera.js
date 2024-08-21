import React from 'react'
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import halfway from '../styles/halfway.png';

const Camera=({onClick, description})=>{

    return(
        <Card sx={{ maxWidth: 340}}>
        <CardActionArea>
          <CardMedia
            sx={{}}
            component="img"
            height="180"
            src={halfway}
            alt="green iguana"
          />
        </CardActionArea>
        <CardActions sx={{backgroundColor:'red'}}>
          <Button size="small" color="primary" onClick={onClick}>
            <Typography color="common.white">Halfway Camera {description}</Typography>
          </Button>
        </CardActions>
      </Card>
    )
}


export default Camera;
