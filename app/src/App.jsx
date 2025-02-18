import { use, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from '@mui/material/styles';

// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import Context from "./shared/Context";
import './App.css'

import { theme } from './shared/Theme';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import Team from './components/Team';
import Srs from './components/Srs';
import Assessment from './components/Assessment';

import { API_BASE_URL } from './shared/Consts';
import { errorMsgFetchingInfo } from './shared/Errors';

const fetchInfo = async () => {
  try {
    const responces = await Promise.all(['info', 'team', 'timeline'].map(async (p) => await fetch(`${API_BASE_URL}/${p}`)));
    if (responces.some(r => !r.ok )) {
      throw error;
    }
    return Promise.all(responces.map(async r => r.json()));
  } catch (error) {
    throw new Error(errorMsgFetchingInfo);
  } 
};

let infoPromise = fetchInfo();
const resetApp = () => {
  infoPromise = fetchInfo();
}

function App() {
  const info = use(infoPromise);
  const [context, setContext] = useState({
    version: info[0].data.version,
    team: info[1].data.team,
    selectedMembers: info[1].data.team.filter((m) => m.scmUser).map((m) => m.id),
    timeline: info[2].data.timeline,
  });
  console.log('!App', context);
  return (
    <Context.Provider value={{ context, setContext }}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
              <Header version={context.version}/>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="timeline" element={<Timeline/>} />
                <Route path="team" element={<Team />} />
                <Route path="srs" element={<Srs />} />
                <Route path="assessment" element={<Assessment />} />
              </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Context.Provider>
  )
}

export { App, resetApp };
