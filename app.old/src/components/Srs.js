import * as React from 'react';
import Grid from '@mui/system/Grid';
import Container from '@mui/material/Container';
// import { useTheme } from '@mui/material/styles';


import Context from '../Context';

import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

function Srs() {
  const [context, setContext] = React.useContext(Context);
  // const theme = useTheme();
  const [srs, setSrs] = React.useState([]);
  const [topics, setTopics] = React.useState({});
  //
  React.useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch(`${context.apiBaseUrl}/srs`);
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok.');
    //     }
    //     const data = await response.json();
    //     // setLoading(false);
    //   } catch (error) {
    //     console.log('error', error);
    //     // setError(error.message);
    //     // setLoading(false);
    //   }
    // };
    // fetchData();
  }, [context.apiBaseUrl]);


  return (
  );
}
export default Srs;
