import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';
import halfway from '../styles/halfway.png';
import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';

const Camera=({onClick, name, status, cameraID})=>{

  const [photoCover, setPhotoCover] = useState();

  useEffect(() => {
    fetch('/photos/latest_photo/' + cameraID)
      .then(res => res.json())
      .then(data => {
        setPhotoCover(data);
      })
      .catch(err => console.log(err));
  }, []);

    return(
          <Box sx={{ border: 'solid', borderColor: status ? 'green' : 'red', padding: '2px' }}>
            <Card sx={{ maxWidth: 340 }}>
              <CardActionArea>
                <CardMedia
                  onClick={onClick}
                  component="img"
                  height="180"
                  src={`data:image/jpeg;base64,${photoCover?.thumbnail_data}`}
                  alt="camera"
                />
              </CardActionArea>
              <CardActions sx={{ backgroundColor: 'red', display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="common.white">{name}</Typography>
                <Button size="small" color="primary">
                  <SettingsIcon sx={{ color: 'white' }} />
                </Button>
              </CardActions>
            </Card>
          </Box>
    )
}


export default Camera;
