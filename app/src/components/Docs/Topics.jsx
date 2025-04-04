import { use, useState } from 'react';
import Grid from '@mui/system/Grid';
import Container from '@mui/material/Container';
import { MuiMarkdown, getOverrides } from 'mui-markdown';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import Box from '@mui/material/Box';

import { errorMsgFetchingData } from './../../shared/Errors';
import { API_BASE_URL } from './../../shared/Consts';

const fetchDocs = async () => {
  try {
    const url = `${API_BASE_URL}/docs`;
    const response = await fetch(url);
    if (!response.ok) {
      throw `Error fetching assessments (${url}) : ${response.status}`;
    }
    const processDocs = async () => {
      const data = await response.json();
      const topics = {};
      const transformTree = (n, parentId = '') => {
        const id = `${parentId}.${n.id}`;
        return ({
          id,
          label: n.id,
          children: (n.docs.map(d => {
            const topicId = `${id}.${d.id}`;
            topics[topicId] = d.md;
            return ({id: topicId, label: d.id});
          })).concat((n.components || []).map( c => transformTree(c, id ))),
        });
      }
      const toc = data.data.docs ? [transformTree(data.data.docs)] : [];
      return {toc, topics};
    };
    return processDocs();
  } catch (error) {
    throw new Error(`${error.message} : ${errorMsgFetchingData}`);
  } 
};

let docsPromise = fetchDocs();
const resetDocs = () => {
  docsPromise = fetchDocs();
}

function Topics() {
  const {toc, topics} = use(docsPromise);
  const [markdown, setMarkdown] = useState(`use TOC to select specific topic`);
  //
  const [/*lastSelectedItem*/, setLastSelectedItem] = useState(null);
  const handleTopicSelection = (event, itemId, isSelected) => {
    if (isSelected) {
      setLastSelectedItem(itemId);
      if (topics[itemId]) {
        setMarkdown(topics[itemId]);
      }
    }
  };
  // Drawer
  const [openDrawer, setOpenDrawer] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };

  return (
    <Container maxWidth="xl" sx={{pt: 2}} >
      <IconButton size="small1" onClick={toggleDrawer(true)} sx={{ display: { xs: "block", md: "none" } }}>
        <TopicOutlinedIcon fontSize="inherit"/>
      </IconButton>
      <Drawer open={openDrawer} anchor='left' onClose={toggleDrawer(false)}>
        <Box sx={{ p: 2, width: 320 }} role="presentation">
          <RichTreeView items={toc.length?toc:[{id:'nodata', label:'nodata'}]} onItemSelectionToggle={handleTopicSelection} />
        </Box>
      </Drawer>

      <Grid container spacing={2}>
        <Grid size={{ md: 3 }}  sx={{ display: { xs: "none", md: "block" } }}>
          <RichTreeView items={toc.length?toc:[{id:'nodata', label:'nodata'}]} onItemSelectionToggle={handleTopicSelection} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <MuiMarkdown
            overrides={{
              ...getOverrides({}), // This will keep the other default overrides.
              h1: {
                component: 'p',
                props: {
                  style: { fontSize: '32px' },
                },
              },
              h2: {
                component: 'p',
                props: {
                  style: { fontSize: '24px' },
                },
              },
              h3: {
                component: 'p',
                props: {
                  style: { fontSize: '16px' },
                },
              },
              h4: {
                component: 'p',
                props: {
                  style: { fontSize: '14px' },
                },
              },
              h5: {
                component: 'p',
                props: {
                  style: { fontSize: '12px' },
                },
              },
            }}
          >
            {markdown}
          </MuiMarkdown>
        </Grid>
      </Grid>      
    </Container>
  );
}

export { Topics, resetDocs };