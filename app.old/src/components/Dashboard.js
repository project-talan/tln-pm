import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';



import Context from '../Context';


function Dashboard() {
  const [context, setContext] = React.useContext(Context);
  
  const [projects, setProjects ] = React.useState([]);
  //
  React.useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch(`${context.apiBaseUrl}/projects`);
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok.');
    //     }
    //     const data = await response.json();
    //     // setLoading(false);
    //   } catch (error) {
    //     // setError(error.message);
    //     // setLoading(false);
    //   }
    // };
    // fetchData();
  }, [context.apiBaseUrl]);
  //
  // const [mode, setMode] = React.useState('full');
  // const handleMode = (event, newMode) => {
  //   setMode(newMode);
  // };  

  return (
  );
}
export default Dashboard;
