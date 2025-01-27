import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
// import { useTheme } from '@mui/material/styles';

// import StateContext from '../StateContext';

function Srs() {
  // const { config } = React.useContext(StateContext);
  // const theme = useTheme();
  // const [tasks, setTasks] = React.useState([]);
  // const fetchData = async () => {
  //   try {
  //     const response = await fetch(`${config.apiBaseUrl}/tasks`);
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok.');
  //     }
  //     const data = await response.json();
  //     setTasks(data.data.tasks);
  //     // setLoading(false);
  //   } catch (error) {
  //     // setError(error.message);
  //     // setLoading(false);
  //   }
  // };
  // //
  // React.useEffect(() => {
  //   fetchData();
  // }, []);

  return (
    <Container maxWidth="xl" sx={{pt: 2}}>
      <Box sx={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: 'lightgrey'}}>
        aaa
      </Box>
    </Container>
  );
}
export default Srs;
