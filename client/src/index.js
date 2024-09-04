import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css'
import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import NavBar from './components/Navbar';

import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom'
import HomePage from './components/Home';
import SignUpPage from './components/SignUp';
import LoginPage from './components/Login';
import CreateCameraPage from './components/CreateCamera';

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from '@mui/material';

const themeLight = createTheme({
  palette: {
    background: {
      default: "#000000",
    },
    text: {
      primary: "#ffffff",
      secondary: "#ffffff"
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        outlined: {
          color: "red",
        },
      },
    },
  },
});


const App=()=>{

    const [show, setShow] =  useState(false);
    const [showVideos, setShowVideos] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [albumID, setAlbumID] = useState();
    const [state, setState] = useState([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
        color:'red'
      }
    ]);
    const [loading, setLoading] = useState({
      circular: false,
      linear: false,
      skeleton: false
    });

    return (
        <ThemeProvider theme={themeLight}>
        <CssBaseline>
        <Router>
        <div className="">
            <NavBar 
            show={show}
            setShow={setShow}
            showCalendar={showCalendar}
            showVideos={showVideos}
            setShowVideos={setShowVideos}
            albumID={albumID}
            setAlbumID={setAlbumID}
            state={state}
            setState={setState}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            loading={loading}
            setLoading={setLoading}
            />
            <Switch>
                <Route path="/create_camera">
                    <CreateCameraPage/>
                </Route>
                <Route path="/login">
                    <LoginPage/>
                </Route>
                <Route path="/signup">
                    <SignUpPage/>                
                </Route>    
                <Route path="/">
                    <HomePage
                        showCalendar={showCalendar}
                        setShowCalendar={setShowCalendar}
                        showVideos={showVideos}
                        setShowVideos={setShowVideos}
                        albumID={albumID}
                        setAlbumID={setAlbumID}
                        state={state}
                        setState={setState}
                        showSettings={showSettings}
                        setShowSettings={setShowSettings}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </Route>
            </Switch>
        </div>
        </Router>
        </CssBaseline>
        </ThemeProvider>
    )
}


ReactDOM.render(<App/>,document.getElementById('root'))