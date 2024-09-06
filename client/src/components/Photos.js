import React, { useEffect, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Pagination from '@mui/material/Pagination';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { Typography } from '@mui/material';
import JSZip from 'jszip';

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

const ViewPhotosPage = ({ setShow, setShowCalendar, cameraID, setLoading, loading, state, setState }) => {

  const ITEMS_PER_PAGE = 9; // Number of items to display per page

  const [photoThumbnail, setPhotoThumbnail] = useState([]);
  const [filteredPhotoThumbnail, setFilteredPhotoThumbnail] = useState([]);
  const [photo, setPhoto] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current photo index

  const handleClose = () => setOpen(false);

  useEffect(() => {
    setLoading({ ...loading, ["skeleton"]: true })
    fetch('/photos/view_photos/' + cameraID)
      .then(res => res.json())
      .then(data => {
        setPhotoThumbnail(data);
        setFilteredPhotoThumbnail(data);
        setLoading(prevLoading => ({ ...prevLoading, skeleton: false }));
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    
    if(state && photoThumbnail.length > 0){
      const startDate = state[0]?.startDate;
      const endDate = state[0]?.endDate;

      const filtered = photoThumbnail?.filter(item => {
        const dateTaken = new Date(item.date_taken);
        return dateTaken >= new Date(startDate)  && dateTaken <= new Date(endDate) ;
      });
      console.log(filtered)
      setFilteredPhotoThumbnail(filtered);
    }
  }, [state]); // Recompute when state or photoThumbnails changes



  const totalPages = Math.ceil(filteredPhotoThumbnail?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredPhotoThumbnail?.length > 0 ? filteredPhotoThumbnail?.slice(startIndex, endIndex) : [];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleButtonClick = () => {
    setState([]); // Clear the state
    setState([
      {
        startDate: new Date(), // Add a new item with default or specific values
        endDate: new Date(),
        key: 'selection',
        color: 'red'
      }]);
    setShowCalendar(false);
    setShow(false);
  }
  const handleButtonGetClick = () => {
    fetch(`photos/album/${1}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPhoto(data);
        setLoading({ ...loading, ["circular"]: false });
        setOpen(true);
  
        downloadPhotosAsZip(data)
      })
      .catch(error => {
        console.error('Error fetching photos:', error);
      });
  };

  const downloadPhotosAsZip = async (photos) => {
    const zip = new JSZip();

    // Loop through each photo and add it to the ZIP file
    photos.forEach((photo, index) => {
      const fileName = `photo_${index + 1}.jpg`;
      const base64Data = cleanBase64String(photo.photo_data);  // Clean the base64 string
      
      // Add the file to the ZIP, convert base64 to binary using `base64ToBinary`
      zip.file(fileName, base64ToBinary(base64Data), { base64: true });
    });

    // Generate the ZIP file and trigger the download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, 'photos.zip');
  };

  // Clean the base64 string by removing the 'data:image/jpeg;base64,' prefix
  const cleanBase64String = (base64Data) => {
    if (base64Data.startsWith('data:image')) {
      return base64Data.split(',')[1];
    }
    return base64Data;
  };

  // Convert base64 string to binary
  const base64ToBinary = (base64Data) => {
    const sanitizedBase64 = base64Data.replace(/\s/g, '');  // Remove any spaces or newlines
    const binaryString = window.atob(sanitizedBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Function to trigger the download of the generated ZIP file
  const triggerDownload = (blob, fileName) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);  // Clean up the DOM
  };

  const onThumbnailClick = (index) => {
    setCurrentIndex(index);
    setLoading({ ...loading, ["circular"]: true })
    fetch(`/photos/photo/${filteredPhotoThumbnail[index]?.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPhoto(data);
        setLoading({ ...loading, ["circular"]: false })
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
      fetch(`/photos/photo/${filteredPhotoThumbnail[prevIndex].id}`)
        .then(response => response.json())
        .then(data => setPhoto(data))
        .catch(error => console.error('Error fetching photo:', error));
    }
  }

  const handleNextClick = () => {
    if (currentIndex < filteredPhotoThumbnail?.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      fetch(`/photos/photo/${filteredPhotoThumbnail[nextIndex].id}`)
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
              <button onClick={handleNextClick} disabled={currentIndex === filteredPhotoThumbnail?.length - 1} style={{ marginLeft: '10px' }}>
                &gt; {/* Right arrow */}
              </button>
            </div>
          </Fade>
        </Box>
      </Modal>

      <div><button id="Back Button" onClick={handleButtonClick}>Back</button></div>
      <div><button id="Get Button" onClick={handleButtonGetClick}>Get</button></div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ImageList cols={3} gap={8}>
            {currentItems?.map((item, index) => (
              <ImageListItem key={item.id} onClick={() => onThumbnailClick(startIndex + index)}>
                <img
                  src={`data:image/jpeg;base64,${item.thumbnail_data}`}
                  alt={item.date_taken}
                  loading="lazy"
                />
                <Typography>{item.date_taken}</Typography>
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
