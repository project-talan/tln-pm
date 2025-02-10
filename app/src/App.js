import './App.css';
import React from 'react';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey, purple } from '@mui/material/colors';
import Context from './Context';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import Team from './components/Team';
import Srs from './components/Srs';

const theme = createTheme({
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: purple,
  },
  tasks: {
    todo: {
      backgroundColor: '#fac858',
      color: 'black',
    },
    dev: {
      backgroundColor: '#5470c6',
      color: 'white',
    },
    blocked: {
      backgroundColor: '#ee6666',
      color: 'black',
    },
    done: {
      backgroundColor: '#28A745',
      color: 'black',
    },
  },
});

/*

0: #5470c6
1: #91cc75
2: #fac858
3: #ee6666
4: #73c0de
5: #3ba272
6: #fc8452
7: #9a60b4
8: #ea7ccc
*/

function App() {
  const [context, setContext] = React.useState({
    apiBaseUrl: 'http://localhost:5445',
    selectedMembers: [],
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${context.apiBaseUrl}/info`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const json = await response.json();
        setContext({...context, version: json.data.version, selectedMembers: [json.data.memberId]});
        // setLoading(false);
      } catch (error) {
        // setError(error.message);
        // setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Context.Provider value={[context, setContext]}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="timeline" element={<Timeline/>} />
            <Route path="team" element={<Team />} />
            <Route path="srs" element={<Srs />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Context.Provider>
  );
}

export default App;
