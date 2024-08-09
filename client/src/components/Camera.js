import React from 'react'
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';


const Camera=({title,description,onClick,onDelete, status})=>{

    return(
        <Card sx={{ maxWidth: 340}}>
        <CardActionArea>
          <CardMedia
            sx={{}}
            component="img"
            height="180"
            image="https://media.istockphoto.com/id/116180672/photo/dark-black-and-white-television-static.jpg?s=612x612&w=0&k=20&c=WTLAPJKvNbhysXE-loVBqspxIchY30uu2l2d37Q8PlA="
            alt="green iguana"
          />
        </CardActionArea>
        <CardActions sx={{backgroundColor:'red'}}>
          <Button size="small" color="primary" onClick={onClick}>
            <Typography color="common.white">Camera 1 - Area 1</Typography>
          </Button>
        </CardActions>
      </Card>
    )
}


export default Camera;