import { use } from 'react';
import { Container } from '@mui/material';

import Context from '../../shared/Context';
import Project from './Project';


function Wrapper() {
  const projects = use(Context).context.projects;
  // console.log('!Wrapper', projects);

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

export default Wrapper;