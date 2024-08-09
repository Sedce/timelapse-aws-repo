import React, { useEffect, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Pagination from '@mui/material/Pagination';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%', // Adjust width as needed
  height: '70%',
  overflow: 'hidden', // Hide overflow to ensure image fits within modal
  bgcolor: 'rgb(0,0,0,0.5)',
  borderRadius: '8px',
  boxShadow: 24,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Center items horizontally
  justifyContent: 'center', // Center items vertically
  
};

const imageStyle = {
  maxWidth: '100%', // Ensure image scales to fit the modal width
  maxHeight: '100%', // Ensure image scales to fit the modal height
  width: 'auto',
  height: 'auto',
};

const ViewPhotosPage = ({ setShow, setShowCalendar }) => {

  const ITEMS_PER_PAGE = 9; // Number of items to display per page

  const [photoThumbnail, setPhotoThumbnail] = useState([]);
  const [photo, setPhoto] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current photo index

  const handleClose = () => setOpen(false);

  useEffect(() => {
    fetch('/photos/view_photos/' + '1')
      .then(res => res.json())
      .then(data => {
        setPhotoThumbnail(data);
      })
      .catch(err => console.log(err));
  }, []);

  const totalPages = Math.ceil(photoThumbnail?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = photoThumbnail?.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleButtonClick = () => {
    setShowCalendar(false);
    setShow(false);
  }

  const onThumbnailClick = (index) => {
    setCurrentIndex(index);
    fetch(`/photos/photo/${photoThumbnail[index].id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPhoto(data);
        setOpen(true);
      })
      .catch(error => {
        console.error('Error fetching photo:', error);
      });
  }

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      fetch(`/photos/photo/${photoThumbnail[prevIndex].id}`)
        .then(response => response.json())
        .then(data => setPhoto(data))
        .catch(error => console.error('Error fetching photo:', error));
    }
  }

  const handleNextClick = () => {
    if (currentIndex < photoThumbnail.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      fetch(`/photos/photo/${photoThumbnail[nextIndex].id}`)
        .then(response => response.json())
        .then(data => setPhoto(data))
        .catch(error => console.error('Error fetching photo:', error));
    }
  }

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
              <button onClick={handlePrevClick} disabled={currentIndex === 0} style={{ marginRight: '10px' }}>
                &lt; {/* Left arrow */}
              </button>
              <img
                src={`data:image/jpeg;base64,${photo?.photo_data}`}
                alt="Photo"
                style={imageStyle}
              />
              <button onClick={handleNextClick} disabled={currentIndex === photoThumbnail.length - 1} style={{ marginLeft: '10px' }}>
                &gt; {/* Right arrow */}
              </button>
            </div>
          </Fade>
        </Box>
      </Modal>
      <button id="Back Button" onClick={handleButtonClick}>Back</button>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ImageList cols={3} gap={8}>
            {currentItems.map((item, index) => (
              <ImageListItem key={item.id} onClick={() => onThumbnailClick(startIndex + index)}>
                <img
                  src={`data:image/jpeg;base64,${item.thumbnail_data}`}
                  alt={item.date_taken}
                  loading="lazy"
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

export default ViewPhotosPage;
