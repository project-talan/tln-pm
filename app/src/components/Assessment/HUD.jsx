import { use, useState } from 'react';
import Grid from '@mui/system/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';


import { errorMsgFetchingData } from './../../shared/Errors';
import { API_BASE_URL } from './../../shared/Consts';

import NoData from '../shared/NoData';
import Status from './Status';
import Survey from './Survey';
import Charts from './Charts';
import Actions from './Actions';
import NewAssessment from './NewAssessment';
import { se } from 'date-fns/locale';


const fetchAssessments = async () => {
  try {
    const url = `${API_BASE_URL}/assessments`;
    const response = await fetch(url);
    if (!response.ok) {
      throw `Error fetching assessments (${url}) : ${response.status}`;
    }
    const processAssessments = async () => {
      const { data } = await response.json();
      const catalog = {};
      const transformTree = (n, parentId = '') => {
        const id = `${parentId}.${n.id}`;
        catalog[id] = n.assessments??[];
        return ({
          id,
          label: n.name,
          children: (n.components || []).map( c => transformTree(c, id)),
        });
      }
      const toc = data.assessments ? [transformTree(data.assessments)] : [];
      return {toc, catalog};
    };
    return processAssessments();
  } catch (error) {
    throw new Error(`${error.message} : ${errorMsgFetchingData}`);
  } 
};

let assessmentsPromise = fetchAssessments();
const resetHUD = () => {
  assessmentsPromise = fetchAssessments();
}

function HUD() {
  const {toc, catalog} = use(assessmentsPromise);

  const [selectedProject, setSelectedProject] = useState(null);
  const handleProjectSelection = (event, itemId, isSelected) => {
    if (isSelected) {
      setSelectedProject(itemId);
      if (catalog[itemId]) {
        setAssessments(catalog[itemId]);
      }
    } else {
      setSelectedProject(null);
    }
  };
 
  const [tab, setTab] = useState('survey');

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const [assessments, setAssessments] = useState([]);
  const [selected, setSelected] = useState(assessments.length ? 0 : -1);

  const handleListItemClick = (event, index) => {
    setSelected(index);
  };



  return (
    <Container maxWidth="xl">
      <Grid container spacing={2}>
        <Grid size={{ md: 0, lg: 2 }} sx={{borderRight: 1, borderColor: 'lightgray', pt: 1, display: { md: "none", lg: "block" }}}>
          <RichTreeView items={toc.length?toc:[{id:'nodata', label:'nodata'}]} onItemSelectionToggle={handleProjectSelection} />
        </Grid>

        <Grid sx = {{backgroundColor: 'blue1', position: 'relative'}} size={{ md: 12, lg: 8}}>
          <Box sx={{ position: 'absolute', top: 0, left: -24, zIndex: 1, display: { md: "block", lg: "none" } }}>
            <IconButton aria-label="delete">
              <KeyboardDoubleArrowRightIcon/>
            </IconButton>
          </Box>
          <Box sx={{ position: 'absolute', top: 0, right: -24, zIndex: 1, display: { md: "block", lg: "none" } }}>
            <IconButton aria-label="delete">
              <KeyboardDoubleArrowLeftIcon/>
            </IconButton>
          </Box>
          <Box sx={{ width: '100%'}}>
            <Tabs
              value={tab}
              onChange={handleChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
              centered
            >
              <Tab value="survey" label="Survey" />
              <Tab value="charts" label="Charts" />
              <Tab value="actions" label="Actions" />
            </Tabs>
          </Box>
          { selected === -1 && <NoData details='Initiate a new assessment to enhance and challenge your project'/> }
          { selected !== -1 && tab === 'survey' && <Survey />}
          { selected !== -1 && tab === 'charts' && <Charts />}
          { selected !== -1 && tab === 'actions' && <Actions />}
        </Grid>
        <Grid size={{ md: 0, lg: 2 }} sx={{borderLeft: 1, borderColor: 'lightgray', pt: 1, display: { md: "none", lg: "block" }}}>
          <Box sx={{ width: '100%', p: 1}}>
            <NewAssessment addDisabled={!selectedProject}/>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
              <List>
                {assessments.map((a, i) => (
                  <ListItem key={i} disablePadding
                    secondaryAction={
                      <IconButton edge="end">
                        <MoreVertIcon />
                      </IconButton>
                    }                >
                    <ListItemButton
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#F0F0F0',
                    },
                    p: 0, px: 1
                  }}                
                      selected={selected === i}
                      onClick={(event) => handleListItemClick(event, i)}
                    >
                      <ListItemIcon>
                        <Status status={a.status}/>
                      </ListItemIcon>

                      <ListItemText primary={a.date} secondary="7d ago"/>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Grid>
      </Grid>      
    </Container>
  );
}

export { HUD, resetHUD };