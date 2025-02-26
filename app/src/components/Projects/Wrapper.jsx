import { use } from 'react';
import { Container } from '@mui/material';

import { API_BASE_URL } from '../../shared/Consts';
import { errorMsgFetchingProjects } from '../../shared/Errors';
import { getDurationToDate } from '../../shared/utils';
import Project from './Project';

const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects2`);
    if (!response.ok) {
      throw "Error fetching projects";
    }
    const processProject = async () => {
      const data = await response.json();
      const enrichProjets = async (projects) => {
        return await Promise.all(projects.map(async (p) => {
          return ({
            ...p,
            lastUpdateTime: p.lastCommit ? getDurationToDate(p.lastCommit) : '',
            durationToRelease: p.summary.release ? getDurationToDate(p.summary.release.date) : '',
            projects: p.projects ? await enrichProjets(p.projects) : []
          });
        }));
      };

      const projects = await enrichProjets(data.data.projects);
      console.log('projects:', projects);
      return { projects };
    };
    return processProject();
  } catch (error) {
    throw new Error(errorMsgFetchingProjects + `: ${error.message}`);
  } 
};

let projectsPromise = fetchProjects();
const resetProjects = () => {
  projectsPromise = fetchProjects();
}

function Wrapper() {
  const {projects} = use(projectsPromise);
  // const [mode, setMode] = useState('full');

  return (
    <Container maxWidth="xl" sx={{py: 1}}>
      {/*<Box sx={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: 'lightgrey1'}}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(event, newMode) => setMode(newMode)}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="full" aria-label="full">
            <MultilineChartIcon />
            <SummarizeOutlinedIcon />
          </ToggleButton>
          <ToggleButton value="text" aria-label="text">
            <MultilineChartIcon />
          </ToggleButton>
          <ToggleButton value="graph" aria-label="chart">
            <SummarizeOutlinedIcon />
          </ToggleButton>
        </ToggleButtonGroup>        
      </Box>*/}
      {projects.map((p, index) => <Project key={index} project={p} opened={true} />)}
    </Container>
  );
}

export { Wrapper, resetProjects };