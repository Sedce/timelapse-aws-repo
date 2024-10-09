import React, { useEffect, useState } from 'react';
import { Box, FormControl, FormLabel, Grid, Typography, Pagination } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Link } from 'react-router-dom';
import { useAuth, authFetch } from '../auth';
import Camera from './Camera';
import { Modal, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ViewPhotosPage from './Photos';
import ViewArchivePage from './Archive';
import SettingsPage from './Settings';
import LoginPage from './Login';
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
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "dfs",
        },
      },
    },
  },
});

const LoggedinHome = ({ setShowCalendar, showVideos, setShowVideos, setAlbumID, state, setState, showSettings, setShowSettings, loading, setLoading }) => {
  const [cameras, setCameras] = useState([]);
  const [show, setShow] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [showPhotos, setShowPhotos] = useState(false);
  const [cameraId, setCameraId] = useState(2);
  const [authState] = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of items per page

  let token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        let token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!token) return;

        const requestOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        };

        let response = await fetch('/camera/cameras', requestOptions);

        if (response.status === 401) {
          if (refreshToken) {
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

              requestOptions.headers['Authorization'] = `Bearer ${token}`;
              response = await fetch('/camera/cameras', requestOptions);
            } else {
              throw new Error('Token refresh failed');
            }
          } else {
            throw new Error('No refresh token available');
          }
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        setCameras(data);
      } catch (err) {
        console.error('Error fetching cameras:', err);
      }
    };

    fetchCameras();
  }, []);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCameras = cameras.slice(startIndex, startIndex + itemsPerPage);

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
        onHide={() => setShow(false)}
      >
        {/* Modal Content */}
      </Modal>

      {showVideos && <ViewArchivePage setShowVideos={setShowVideos} />}
      {showSettings && <SettingsPage setShowSettings={setShowSettings} />}
      {loading.skeleton ? <SkeletonLoading /> : null}
      {loading.circular ? <CircularLoading /> : null}
      {showPhotos && <ViewPhotosPage cameraID={cameraId} setShowCalendar={setShowCalendar} setShow={setShowPhotos} loading={loading} setLoading={setLoading} state={state} setState={setState} />}

      {(!showPhotos && !showVideos && !showSettings) && (
        <>
          <Grid container spacing={2} padding='100px'>
            {displayedCameras.map((camera) => (
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
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <Pagination
              count={Math.ceil(cameras.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </div>
  );
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
      <LoginPage />
    </div>
  )
}

const HomePage = ({ setShowVideos, setShowCalendar, showVideos, albumID, setAlbumID, state, setState, showSettings, setShowSettings, loading, setLoading }) => {
  const [logged] = useAuth();
  return (
    <ThemeProvider theme={theme}>
      <div>
        {logged ? <LoggedinHome setShowVideos={setShowVideos} setShowCalendar={setShowCalendar} showVideos={showVideos} albumID={albumID}
          setAlbumID={setAlbumID} state={state} setState={setState} showSettings={showSettings} setShowSettings={setShowSettings} loading={loading} setLoading={setLoading} /> : <LoggedOutHome />}
      </div>
    </ThemeProvider>
  )
}

export default HomePage;
