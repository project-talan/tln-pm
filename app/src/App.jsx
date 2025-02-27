import { use, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from '@mui/material/styles';

// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import Context from "./shared/Context";
import './App.css'

import { theme } from './shared/Theme';
import Header from './components/Header';
import Projects from './components/Projects';
import Timeline from './components/Timeline';
import Team from './components/Team';
import Docs from './components/Docs';
import Assessment from './components/Assessment';

import { API_BASE_URL } from './shared/Consts';
import { errorMsgFetchingInfo } from './shared/Errors';

const fetchData = async () => {
  try {
    const responces = await Promise.all(['info', 'projects'].map(async (p) => [p, await fetch(`${API_BASE_URL}/${p}`)]));
    if (responces.some(r => !r[1].ok )) {
      throw "Error fetching info";
    }
    return Promise.all(responces.map(async r => [r[0], (await r[1].json())]));
  } catch (error) {
    throw new Error(errorMsgFetchingInfo + `: ${error.message}`);
  } 
};

let dataPromise = fetchData();
const resetApp = () => {
  dataPromise = fetchData();
}

const pages = [
  { id: 'projects', title: 'Projects', href: '/' },
  { id: 'timeline', title: 'Timeline', href: '/timeline' },
  { id: 'team', title: 'Team', href: '/team' },
  { id: 'docs', title: 'Docs', href: '/docs' },
  { id: 'assessment', title: 'Assessment', href: '/assessment' },
];

function App() {
  const data = Object.fromEntries(use(dataPromise));
  //
  const [context, setContext] = useState({
    version: data.info.data.version,
    projects: data.projects.data.projects,
    team: data.projects.data.team,
    components: [],
    selectedMembers: [], //info[1].data.team.filter((m) => m.scmUser).map((m) => m.id),
    // timeline: info[2].data.timeline,
    // deadline: info[2].data.timeline.map((t) => t.deadline.map((d) => d.current ? d.uid : null).filter((v) => v)).flat(1)[0],
    statuses: { todo: true, dev: true, blocked: true, done: false },
    priorities: { critical: false, high: false, low: false },
  });
  console.log('!App');
  return (
    <Context.Provider value={{ context, setContext }}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Header version={context.version} pages={pages} />
          <Routes>
            <Route index element={<Projects />} />
            <Route path="timeline" element={<Timeline/>} />
            <Route path="team" element={<Team />} />
            <Route path="docs" element={<Docs />} />
            <Route path="assessment" element={<Assessment />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Context.Provider>
  )
}

export { App, resetApp };
