import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import Camera from './Camera'
import { Modal ,Form,Button} from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import ViewPhotosPage from './Photos'
import { Grid } from '@mui/material'
import { ThemeProvider, createTheme } from "@mui/material/styles";

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

const LoggedinHome = ({setShowCalendar}) => {
    const [cameras, setCameras] = useState([]);
    const [show, setShow] = useState(false);
    const [showPhotos, setShowPhotos] = useState(false);
    const {register,handleSubmit,setValue,formState:{errors}}=useForm()
    const [cameraId,setCameraId]=useState(0);

    useEffect(
        () => {
            fetch('/camera/cameras')
                .then(res => res.json())
                .then(data => {
                    setCameras(data)
                })
                .catch(err => console.log(err))
        }, []
    );

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

    const showModal = (id) => {
        setShow(true)
        setCameraId(id)
        cameras.map(
            (camera)=>{
                if(camera.id==id){
                    setValue('title',camera.title)
                    setValue('description',camera.description)
                }
            }
        )
    }

    const showPhotosComponent = () => {
        console.log('show photos! ')
        setShowCalendar(true);
        setShowPhotos(true);
    }
    let token=localStorage.getItem('REACT_TOKEN_AUTH_KEY')

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
                show={show}
                size="lg"
                onHide={closeModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Update Camera
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text"
                                {...register('title', { required: true, maxLength: 25 })}
                            />
                        </Form.Group>
                        {errors.title && <p style={{ color: 'red' }}><small>Title is required</small></p>}
                        {errors.title?.type === "maxLength" && <p style={{ color: 'red' }}>
                            <small>Title should be less than 25 characters</small>
                        </p>}
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={5}
                                {...register('description', { required: true, maxLength: 255 })}
                            />
                        </Form.Group>
                        {errors.description && <p style={{ color: 'red' }}><small>Description is required</small></p>}
                        {errors.description?.type === "maxLength" && <p style={{ color: 'red' }}>
                            <small>Description should be less than 255 characters</small>
                        </p>}
                        <br></br>
                        <Form.Group>
                            <Button variant="primary" onClick={handleSubmit(updateCamera)}>
                                Save
                            </Button>
                        </Form.Group>
                    </form>
                </Modal.Body>
            </Modal>
            {showPhotos && <ViewPhotosPage setShowCalendar={setShowCalendar} setShow={setShowPhotos}/>}
            
            {!showPhotos && (
                       <>
                       <Grid container spacing={2} padding='100px'>
                           {cameras.map((camera) => (
                               <Grid item xs={4} md={4} key={camera.id} >
                                   <Camera
                                       title={camera.source}
                                       description={camera.id}
                                       onClick={() => showPhotosComponent(camera.id)}
                                       onDelete={() => deleteCamera(camera.id)}
                                       status={camera.status}
                                   />
                               </Grid>
                           ))}
                       </Grid>
                   </>
            )}
        </div>
    )
}


const LoggedOutHome = () => {
    return (
        <div className="home container">
            <h1 className="heading">Welcome to the Cameras</h1>
            <Link to='/signup' className="btn btn-primary btn-lg">Get Started</Link>
        </div>
    )
}

const HomePage = ({showCalendar, setShowCalendar}) => {

    const [logged] = useAuth();
    return (
        <ThemeProvider theme={theme}>
        <div>
            {logged ? <LoggedinHome setShowCalendar={setShowCalendar} /> : <LoggedOutHome />}
        </div>
        </ThemeProvider>
    )
}

export default HomePage