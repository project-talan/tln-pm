import './App.css';
import React from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey, purple } from '@mui/material/colors';
import StateContext from './StateContext';
import Header from './Components/Header';
import Dashboard from './Components/Dashboard';
import Team from './Components/Team';

const theme = createTheme({
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: purple,
  },
  tasks: {
    todo: {
      backgroundColor: '#FFA500',
    },
    dev: {
      backgroundColor: '#007BFF',
    },
    blocked: {
      backgroundColor: '#DC3545',
    },
    done: {
      backgroundColor: '#28A745',
    },
  },
});

function App() {
  const [config] = React.useState({
    apiBaseUrl: 'http://localhost:5445',
  });

  return (
    <StateContext.Provider value={{ config }}>
      <ThemeProvider theme={theme}>
        <Header />
        {<Dashboard />}
        <Team />
      </ThemeProvider>
    </StateContext.Provider>
  );
}

export default App;
