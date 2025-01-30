import * as React from 'react';
import Grid from '@mui/system/Grid';
import Container from '@mui/material/Container';
// import { useTheme } from '@mui/material/styles';

import { MuiMarkdown } from 'mui-markdown';

import StateContext from '../StateContext';

import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

function Srs() {
  const { config } = React.useContext(StateContext);
  // const theme = useTheme();
  const [srs, setSrs] = React.useState([]);
  const [markdownSrs, setMarkdownSrs] = React.useState(`Use left side menu to select SRS topic`);
  const [topics, setTopics] = React.useState({});
  //
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/srs`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        const tpcs = {}
        const transformTree = (n, parentId = '') => {
          const id = `${parentId}.${n.id}`;
          return ({
            id,
            label: n.id,
            children: (Object.keys(n.srs).map(k => {
              const topicId = `${id}.${k}`;
              tpcs[topicId] = n.srs[k];
              return ({id: topicId, label: k});
            })).concat((n.components || []).map( c => transformTree(c, id ))),
          });
        }
        setSrs([transformTree(data.data.srs)]);
        setTopics(tpcs);
        // setLoading(false);
      } catch (error) {
        console.log('error', error);
        // setError(error.message);
        // setLoading(false);
      }
    };
    fetchData();
  }, [config.apiBaseUrl]);

  const [/*lastSelectedItem*/, setLastSelectedItem] = React.useState(null);

  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    if (isSelected) {
      setLastSelectedItem(itemId);
      if (topics[itemId]) {
        setMarkdownSrs(topics[itemId]);
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{pt: 2}}>
      <Grid container spacing={2}>
        <Grid size={{ md: 3 }}  sx={{ display: { xs: "none", md: "block" } }}>
          <RichTreeView items={srs.length?srs:[{id:'nodata', label:'nodata'}]} onItemSelectionToggle={handleItemSelectionToggle} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
        <MuiMarkdown>{markdownSrs}</MuiMarkdown>
        </Grid>
      </Grid>      
    </Container>
  );
}
export default Srs;
