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
// import Assessment from './components/Assessment';
import Assistant from './components/Assistant';

import { API_BASE_URL } from './shared/Consts';
import { errorMsgFetchingData } from './shared/Errors';

const fetchData = async () => {
  try {
    const responces = await Promise.all(['info', 'projects'].map(async (p) => [p, await fetch(`${API_BASE_URL}/${p}`)]));
    if (responces.some(r => !r[1].ok )) {
      throw `Error fetching data : ${response.status}`;
    }
    return Promise.all(responces.map(async r => [r[0], (await r[1].json())]));
  } catch (error) {
    throw new Error(`${error.message} : ${errorMsgFetchingData}`);
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
  // { id: 'assessment', title: 'Assessment', href: '/assessment' },
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
            {/*<Route path="assessment" element={<Assessment />} />*/}
            <Route path="assistant" element={<Assistant />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Context.Provider>
  )
}

export { App, resetApp };

/*
To connect a React 19 frontend with an Express backend using WebSockets, you'll typically use Socket.IO, which simplifies WebSocket communication with fallbacks and event-based APIs.

Here’s a step-by-step guide:

✅ 1. Install Dependencies
Backend (Express)
npm install express socket.io

Frontend (React)
npm install socket.io-client

✅ 2. Backend: Set Up Express + WebSocket
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // Required for socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // React dev server
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('send-message', (data) => {
    console.log('Received:', data);
    socket.broadcast.emit('receive-message', data); // Send to others
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Socket server is running');
});

server.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});

✅ 3. Frontend: Connect React to Socket.IO
// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket() {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:4000');

    socket.current.on('connect', () => {
      console.log('Connected:', socket.current.id);
    });

    socket.current.on('receive-message', (msg) => {
      console.log('Message from server:', msg);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return socket;
}

// src/App.jsx
import React, { useState } from 'react';
import useSocket from './hooks/useSocket';

function App() {
  const [message, setMessage] = useState('');
  const socket = useSocket();

  const sendMessage = () => {
    socket.current.emit('send-message', message);
    setMessage('');
  };

  return (
    <div>
      <h1>WebSocket Chat</h1>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
🔄 Summary
Backend listens on http://localhost:4000 and manages socket events.

React frontend connects using socket.io-client and emits/listens to messages.

You can customize events as needed (send-message, user-typing, join-room, etc.)
*/