import React, { useEffect, useState } from 'react'
import { Box, FormControl, FormLabel } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Link } from 'react-router-dom'
import { useAuth, authFetch } from '../auth'
import Camera from './Camera'
import { Modal, Button} from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import ViewPhotosPage from './Photos'
import ViewArchivePage from './Archive'
import { Grid, Typography } from '@mui/material'
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/system";
import CircularProgress from "@mui/material/CircularProgress";

const theme = createTheme({
    palette: {
      background: {
        default: "#0d0507",
      },
      text: {
        primary: "#ffffff",
        secondary: "#ffffff"
      }
    },
      components: {
        // Name of the component ⚛️
        MuiButton: {
          styleOverrides: {
              // Name of the slot
              root: {
                // Some CSS
                backgroundColor: "dfs",
                
              },
            },
        },
      },
    });

const LoggedinHome = ({setShowCalendar, showVideos, setShowVideos, albumID, setAlbumID}) => {
    const [cameras, setCameras] = useState([]);
    const [show, setShow] = useState(false);
    const {register,handleSubmit,setValue,formState:{errors}}=useForm()
    const [showPhotos, setShowPhotos] = useState(false);
    const [cameraId,setCameraId]=useState(2);
    const [authState] = useAuth();
    const [loading, setLoading] = useState({
        circular: false,
        linear: false,
        skeleton: false
      });

    let token=localStorage.getItem('REACT_TOKEN_AUTH_KEY')

    useEffect(() => {
      // Retrieve token from localStorage
      const token = localStorage.getItem('access_token');
      
      // Check if token exists
      if (token) {
          const requestOptions = {
              method: 'GET', // Ensure method matches the server endpoint
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, // Ensure the token is correct
              },
          };

          // Make the fetch request
          fetch('/camera/cameras', requestOptions)
              .then(response => {
                  if (!response.ok) {
                      return response.json().then(err => {
                          throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(err)}`);
                      });
                  }
                  return response.json();
              })
              .then(data => {
                  setCameras(data);
              })
              .catch(err => {
                  console.error('Error fetching cameras:', err);
              });
      }
  }, []);


    const getAllCameras=()=>{
        fetch('/camera/cameras')
        .then(res => res.json())
        .then(data => {
            console.log(cameras)
            setCameras(data)
        })
        .catch(err => console.log(err))
    }
    

    const closeModal = () => {
        setShow(false)
    }

    const showPhotosComponent = (id) => {
        setAlbumID(id)
        setCameraId(id)
        setShowCalendar(true);
        setShowPhotos(true);
    }

    const updateCamera=(data)=>{
        console.log(data)
        const requestOptions={
            method:'PUT',
            headers:{
                'content-type':'application/json',
                'Authorization':`Bearer ${JSON.parse(token)}`
            },
            body:JSON.stringify(data)
        }

        fetch(`/camera/camera/${cameraId}`,requestOptions)
        .then(res=>res.json())
        .then(data=>{
            console.log(data)

            const reload =window.location.reload()
            reload() 
        })
        .catch(err=>console.log(err))
    }



    const deleteCamera=(id)=>{
        console.log(id)
        

        const requestOptions={
            method:'DELETE',
            headers:{
                'content-type':'application/json',
                'Authorization':`Bearer ${JSON.parse(token)}`
            }
        }
        fetch(`/camera/camera/${id}`,requestOptions)
        .then(res=>res.json())
        .then(data=>{
            console.log(data)
            getAllCameras()
        
        })
        .catch(err=>console.log(err))
    }

    return (
        <div className="recipes-container">
            <Modal
                BackdropProps={{
                    sx: { backgroundColor: 'black' },
                  }}
                show={show}
                size="lg"
                onHide={closeModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Typography sx={{ color:'black'}}>Update Camera</Typography>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                sx={{background:'black'}}
                >
                    <Box
                        sx={{
                        width: '100%',
                        height: 200,
                        backgroundColor: grey[300],
                        borderRadius: 2,
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        }}
                    >
                    <img
                    src={'https://www.freeiconspng.com/thumbs/camera-photo-png/vintage-camera-png-images-for--camera-png--23.png'}
                    loading="lazy"
                    />              
                    </Box>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{color:"black"}}>Camera ID</FormLabel>
                        <FormLabel sx={{color:"black"}}>Status</FormLabel>
                        <FormLabel sx={{color:"black"}}>Name  <input></input></FormLabel>
                        <FormLabel sx={{color:"black"}}>Photo Interval  <input></input></FormLabel>
                    </FormControl>
                <Button>Save</Button>
                </Modal.Body>
            </Modal>
            {showVideos && <ViewArchivePage setShowVideos={setShowVideos}/>}
            {loading.skeleton ? <SkeletonLoading /> : null}
            {loading.circular ? <CircularLoading /> : null}
            {showPhotos && <ViewPhotosPage cameraID={cameraId} setShowCalendar={setShowCalendar} setShow={setShowPhotos} loading={loading} setLoading={setLoading}/>}
            {(!showPhotos && !showVideos )&& (
                       <>
                       <Grid container spacing={2} padding='100px'>
                           {cameras.map((camera) => (
                               <Grid item xs={4} md={4} key={camera.id} >
                                   <Camera
                                       title={camera.source}
                                       name={camera.name}
                                       onClick={() => showPhotosComponent(camera.album)}
                                       onDelete={() => deleteCamera(camera.id)}
                                       status={camera.status}
                                       cameraID={camera.album}
                                       setShow={setShow}
                                   />
                               </Grid>
                           ))}
                       </Grid>
                   </>
            )}
        </div>
    )
}

const DisabledBackground = styled(Box)({
    width: "100%",
    height: "100%",
    position: "fixed",
    background: "#ccc",
    opacity: 0.5,
    zIndex: 1
  });
  
  const CircularLoading = () => (
    <>
      <CircularProgress
        size={70}
        sx={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2
        }}
      />
      <DisabledBackground />
    </>
  );

  const SkeletonLoading = () => (
    <Box sx={{ p: 1 }}>
      <Grid container wrap="nowrap">
        {Array.from(new Array(3)).map((item, index) => (
          <Box key={index} sx={{ width: 300, marginRight: 1, my: 2 }}>
            <Skeleton variant="rectangular" width={300} height={200} />
            <Box sx={{ pt: 0.5 }}>
              <Skeleton />
              <Skeleton width="60%" />
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  );
  
const LoggedOutHome = () => {
    return (
        <div className="home container">
            <h1 className="heading">Eagle Vision Video Timelapse</h1>
            <Link to='/login' className="btn btn-primary btn-lg">Log In</Link>
        </div>
    )
}

const HomePage = ({setShowVideos, setShowCalendar, showVideos, albumID, setAlbumID}) => {

    const [logged] = useAuth();
    return (
        <ThemeProvider theme={theme}>
        <div>
            {logged ? <LoggedinHome setShowVideos={setShowVideos} setShowCalendar={setShowCalendar} showVideos={showVideos} albumID={albumID}
                        setAlbumID={setAlbumID}/> : <LoggedOutHome />}
        </div>
        </ThemeProvider>
    )
}

export default HomePage
