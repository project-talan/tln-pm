import './App.css';
import React from 'react';


import Context from './Context';






function App() {
  const [context, setContext] = React.useState({
    apiBaseUrl: 'http://localhost:5445',
    selectedMembers: [],
  });


  return (
    <Context.Provider value={[context, setContext]}>
    </Context.Provider>
  );
}

export default App;
