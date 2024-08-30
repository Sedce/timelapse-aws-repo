import React, {useState} from 'react';
import { useAuth ,logout} from '../auth'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import { Button } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css';
import { DateRange } from 'react-date-range';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Card, CardMedia, CardContent } from '@mui/material';
import evvpLogo from '../styles/EVVAP-WHITE.png';
import '../styles/main.css';


const drawerWidth = 300;
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%', // Adjust width as needed
  height: '70%',
  overflow: 'hidden', // Hide overflow to ensure image fits within modal
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center items horizontally
  justifyContent: 'center', // Center items vertically
};

const videoStyle = {
  maxWidth: '100%', // Ensure image scales to fit the modal width
  maxHeight: '100%', // Ensure image scales to fit the modal height
  width: '100%',
  height: '100%',
};


const NavBar = ({showCalendar, setShowVideos, albumID, setAlbumID}) => {

    const [logged] = useAuth();
    const [open, setOpen] = useState(false)
    const [state, setState] = useState([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
        color:'red'
      }
    ]);
    const handleClose = () => setOpen(false); 
    const archive = () => setShowVideos(true); 
    const [videoURL, setVideoURL] = useState(''); 

    const generate_timelapse = async () =>  {

      // Prepare data to send in the request
      const formData = new FormData();
      formData.append('begin_date', state[0]?.startDate);  // Replace with actual begin date
      formData.append('end_date', state[0]?.endDate);    // Replace with actual end date

      console.log(formData)
      try {
        const response = await fetch(`/photos/generate_timelapse/` + albumID, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok){
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setVideoURL('photos/' + result.generated_video_path)
        setOpen(true);
        // You can handle the result here, e.g., display it to the user
        // For example, you might want to show the video path or provide a download link

      } catch (error) {
        console.error('Error generating timelapse:', error);
      }
    };


    return (
      <>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Fade in={open} timeout={500}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Card
              style={videoStyle}
              >
              <CardMedia
                component="video"
                controls
                src={videoURL}
                alt="Video description"
              />
              <CardContent>
              </CardContent>
            </Card>
              </div>
            </Fade>
          </Box>
        </Modal>
        {logged && (
          <Box sx={{ display: 'flex' }}>
  <CssBaseline />
  <Drawer
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        paddingTop: '20px',
        backgroundColor: 'rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center content horizontally
        justifyContent: 'space-between', // Adjust spacing
      },
    }}
    variant="permanent"
    anchor="left"
  >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          component="img"
          sx={{
            height: 'auto',
            width: 233,
            margin: '10px',
          }}
          src={evvpLogo}
        />
        {showCalendar && (
          <>
            <Divider sx={{ width: '80%' }} />
            <div className='calendarWrapper' style={{ width: '80%', marginTop: '10px' }}>
              <DateRange
                style={{ backgroundColor: "rgb(0,0,0,1)" }}
                editableDateInputs={true}
                onChange={item => setState([item.selection])}
                moveRangeOnFirstSelection={false}
                showDateDisplay={false}
                showMonthAndYearPickers={false}
                ranges={state}
              />
            </div>
            <Button
              sx={{
                width: '80%',
                backgroundColor: '#bdbdbd',
                margin: '10px',
              }}
              onClick={() => { generate_timelapse() }}
            >
              Generate Timelapse
            </Button>
            <Divider sx={{ width: '80%' }} />
          </>
        )}
        <Button
          sx={{
            width: '80%',
            backgroundColor: 'red',
            color: 'white',
            marginTop: '30px',
          }}
          onClick={() => { archive() }}
        >
          Archive
        </Button>
        <Divider sx={{ width: '80%' }} />
        <Button
          sx={{
            width: '80%',
            backgroundColor: 'red',
            color: 'white',
            marginTop: '10px',
          }}
        >
          Settings
        </Button>
        <Divider sx={{ width: '80%' }} />
        <Button
          sx={{
            width: '50%',
            color: 'white',
            backgroundColor: 'gray',
            margin: '10px',
          }}
          onClick={() => { logout() }}
        >
          Log Out
        </Button>
      </Box>
    </Drawer>
  </Box>

        )}
      </>
    );
  };
export default NavBar
