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
import Assistant from './components/Assistant';

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
  { id: 'assistant', title: 'Assistant', href: '/assistant' },
];

function App() {
  const data = Object.fromEntries(use(dataPromise));
  //
  const today = Date.now();
  const day = 24 * 36e5;
  const scmUserEmail = data.info.data.scmUser ?? '';
  //
  const team = data.projects.data.team;
  const scmUser = team.find(m => m.bandwidth.find(b => b.email == scmUserEmail));
  const selectedMembers = scmUser ? [scmUser.id] : [];
  const timeline = data.projects.data.projects[0].timeline ?? []; // TODO use top level merged timeline
  const deadline = timeline.map( d => d.current ? d.uid : null).filter((v) => v)[0];
  const end = timeline.find( d => d.uid === deadline);
  const interval = {start: today - day, end: end ? today + end.durationToRelease + day : today + 30 * day};
  //
  const [context, setContext] = useState({
    version: data.info.data.version,
    projects: data.projects.data.projects,
    team,
    components: [],
    selectedMembers,
    timeline,
    deadline,
    interval,
    statuses: { todo: true, dev: true, blocked: true, done: false },
    priorities: { critical: false, high: false, low: false },
  });
  // console.log('!App');
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
            <Route path="assistant" element={<Assistant />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Context.Provider>
  )
}

export { App, resetApp };
