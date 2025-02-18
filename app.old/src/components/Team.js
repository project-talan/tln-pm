import * as React from 'react';

import Context from '../Context';


function Team() {
  const [context, setContext] = React.useContext(Context);
  const [, setTeam] = React.useState('');
  const [rows, setRows] = React.useState([]);
  //
  React.useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch(`${context.apiBaseUrl}/team`);
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok.');
    //     }
    //     const data = await response.json();
    //     setTeam(data.data);
    //     // setLoading(false);
    //   } catch (error) {
    //     // setError(error.message);
    //     // setLoading(false);
    //   }
    // };
    // fetchData();
  }, [context.apiBaseUrl, theme]);

  return (
  );
}
export default Team;
