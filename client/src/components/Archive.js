import React, { useEffect, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Pagination from '@mui/material/Pagination';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Card, CardMedia, CardContent } from '@mui/material';

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

const ViewArchivePage = ({ setShowVideos, setShowCalendar, cameraID }) => {

  const ITEMS_PER_PAGE = 9; // Number of items to display per page

  const [videoThumbnail, setVideoThumbnail] = useState();
  const [video, setVideo] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current photo index

  const handleClose = () => setOpen(false);

  useEffect(() => {
    fetch('/photos/videos')
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setVideoThumbnail(data.videos)
      })
      .catch(err => console.log(err));
  }, []);

  const totalPages = Math.ceil(videoThumbnail?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = videoThumbnail?.length > 0 ? videoThumbnail?.slice(startIndex, endIndex) : [];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleButtonClick = () => {
    setShowVideos(false);
  }

  const onThumbnailClick = (index) => {
    setCurrentIndex(index);
    setVideo('photos/' + videoThumbnail[index]); // Set the video URL to be displayed in the modal
    setOpen(true);
  };
  
  const handlePrevClick = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevVideoUrl = videoThumbnail[prevIndex];
      setVideo(prevVideoUrl);
    }
  };
  
  const handleNextClick = () => {
    if (currentIndex < videoThumbnail?.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextVideoUrl = videoThumbnail[nextIndex];
      setVideo(nextVideoUrl);
    }
  };

  return (
    <Container>
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
                src={video}
                alt="Video description"
              />
              <CardContent>
              </CardContent>
            </Card>
              </div>
            </Fade>
          </Box>
        </Modal>
      <button id="Back Button" onClick={handleButtonClick}>Back</button>
      <Grid container spacing={2}>
    <Grid item xs={12}>
        <ImageList cols={3} gap={8}>
        {currentItems?.map((videoUrl, index) => (
            <ImageListItem key={index} onClick={() => onThumbnailClick(startIndex + index)}>
            <video
                src={'photos/' + videoUrl} // Use video URL directly
                style={{ width: '100%', height: 'auto' }}
                controls
            />
            </ImageListItem>
        ))}
        </ImageList>
    </Grid>
    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        />
    </Grid>
    </Grid>
    </Container>
  )
}

export default ViewArchivePage;
