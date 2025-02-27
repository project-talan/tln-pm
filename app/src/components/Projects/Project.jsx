import { useState } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

import * as Highcharts from 'highcharts';
import 'highcharts/modules/accessibility';
import HighchartsReact from 'highcharts-react-official';



import { checkValue, checkMember } from '../../shared/utils';
import Utilization from './../shared/Utilization';
import Status from './../shared/Status';

const TableValue = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 14,
  fontStyle: 'italic',
  fontWeight: 'bold'
}));

const style = {
  py: 0,
  width: '100%',
//    maxWidth: 360,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'background.paper',
};

const getPieOptions = (theme, tasks) => ({
  credits: {
    enabled: false
  },  
  chart: {
    type: 'pie',
    custom: {},
    events: {
      render() {
        const chart = this, series = chart.series[0];
        let customLabel = chart.options.chart.custom.label;

        if (!customLabel) {
          customLabel = chart.options.chart.custom.label =
            chart.renderer.label(
              `done:<strong>${tasks.done}</strong>`
            )
            .css({
              color: '#000',
              textAnchor: 'middle'
            })
            .add();
        }

        const x = series.center[0] + chart.plotLeft,
          y = series.center[1] + chart.plotTop -
          (customLabel.attr('height') / 2);

        customLabel.attr({
          x,
          y
        });
        // Set font size based on chart diameter
        customLabel.css({
          fontSize: `${series.center[2] / 12}px`
        });
      }
    }
  },
  accessibility: {
    point: {
      valueSuffix: '%'
    }
  },
  title: {
    text: ''
  },
  subtitle: {
    text: ''
  },
  tooltip: {
    pointFormat: '<b>{point.percentage:.0f}%</b>'
  },
  legend: {
    enabled: true
  },
  colors: [theme.tasks.todo.backgroundColor, theme.tasks.dev.backgroundColor, theme.tasks.blocked.backgroundColor],
  plotOptions: {
    series: {
      allowPointSelect: true,
      cursor: 'pointer',
      borderRadius: 8,
      dataLabels: [{
        enabled: false,
        distance: 20,
        format: '{point.name}'
      }, {
        enabled: false,
        distance: -30,
        format: '{point.percentage:.0f}',
        style: {
          fontSize: '0.9em'
        }
      }],
      showInLegend: true
    }
  },
  series: [{
    name: 'Tasks',
    colorByPoint: true,
    innerSize: '55%',
    data: [{
      name: `todo (${tasks.todo})`,
      y: tasks.todo,
    }, {
      name: `dev (${tasks.dev})`,
      y: tasks.dev
    }, {
      name: `blocked (${tasks.blocked})`,
      y: tasks.blocked
    }]
  }]
});

const getUtilizationColor = (value, theme) => {
  if (value < 0.64) {
    return theme.rag.red.backgroundColor;
  } else if (value < 0.8) {
    return theme.rag.amber.backgroundColor;
  }
  return theme.rag.green.backgroundColor;
};

function Project({ project, opened }) {
  const theme = useTheme();
  const [open, setOpen] = useState(opened);
  const utilization = project.summary.team.utilization;

  const [fte] = useState(
    [{ color: getUtilizationColor(utilization[0], theme), position: 0 }].
    concat(utilization.map( (v, index) => ({
      color: getUtilizationColor(v, theme),
      position: index * 10 + 5
    }))).
    concat([ { color: getUtilizationColor(utilization[utilization.length - 1], theme), position: 100 }])
  );
  const total = project.summary.tasks.todo + project.summary.tasks.dev + project.summary.tasks.blocked;
  const status = [
    { id: 'todo', value: project.summary.tasks.todo, percents: '0%', color: theme.tasks.todo.color, backgroundColor: theme.tasks.todo.backgroundColor},
    { id: 'dev', value: project.summary.tasks.dev, percents: '0%', color: theme.tasks.dev.color, backgroundColor: theme.tasks.dev.backgroundColor},
    { id: 'blocked', value: project.summary.tasks.blocked, percents: '0%', color: theme.tasks.blocked.color, backgroundColor: theme.tasks.blocked.backgroundColor},
  ].map((s) => ({ ...s, percents: total > 0 ? Math.round(100*s.value/total) + '%' : '0%' }));
  
  return (
    <Card variant="outlined" sx={{my: 2, position: 'relative', overflow: 'visible', backgroundColor: 'lightgrey1'}}>
      <Typography gutterBottom sx={{ color: 'text.secondary', backgroundColor: 'white', fontSize: 14, position: 'absolute', right: 64, top: -12}}>
        <i><b>{project.lastUpdateTime ? `updated ${project.lastUpdateTime} ago` : ''}</b></i>
      </Typography>
      { !open && (
        <Typography gutterBottom sx={{ color: 'text.secondary', backgroundColor: 'white', fontSize: 14, position: 'absolute', left: 64, top: -12}}>
        <i><b>{checkMember(project.summary.release, 'id', '', '', '')}{checkMember(project.summary.release, 'durationToReleaseHR', ' in ', '', '')}</b></i>
        </Typography>
      )}
      <IconButton sx={{position: 'absolute', right: -6, top: -8}} onClick={() => setOpen(!open)}>
        {open ? <ExpandLess /> : <ExpandMore />}
      </IconButton>

      <CardContent sx={{ py: 3, overflow: 'visible'}}>
        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: {xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)'}}}>
          <Box>
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
              {project.id}
            </Typography>
            <Typography variant="h5" component="div">
              {project.name}
            </Typography>
            { open && (
              <>
                <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{project.description}</Typography>
                <Box sx={{px: 4 }}>
              <List sx={style}>
                <ListItem
                  secondaryAction={
                    <TableValue >{checkMember(project.summary.release, 'durationToReleaseHR', 'in ')}</TableValue>
                  }
                >
                  <ListItemText primary={<Typography><b>Release</b></Typography>}/>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem
                  sx={{pl: 4}}
                  secondaryAction={
                    <TableValue>{checkMember(project.summary.release, 'id')}</TableValue>
                  }
                >
                  <ListItemText primary="Version" />
                </ListItem>
                <ListItem
                  sx={{pl: 4}}
                  secondaryAction={
                    <TableValue>{checkMember(project.summary.release, 'date')}</TableValue>
                  }
                >
                  <ListItemText primary="Date" />
                </ListItem>
                <ListItem sx={{pl: 4}}
                  secondaryAction={
                    <TableValue>{checkMember(project.summary.release, 'features')}</TableValue>
                  }
                >
                  <ListItemText primary="Features" />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText primary={<Typography><b>Bandwidth & Utilization</b></Typography>} />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem sx={{pl: 4}}
                  secondaryAction={
                    <TableValue>{project.summary.team.size}({project.summary.team.total})</TableValue>
                  }
                >
                  <ListItemText primary="Team size (total)" />
                </ListItem>
                <ListItem sx={{pl: 4}} >
                  <Utilization fte={fte} />
                </ListItem>
              </List>
                </Box>
              </>
            )}
          </Box>
          <Box>
            { !open && (
              <>
                <Box sx={{px: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center'}}>
                  <Status status={status} width='48%' />
                  <Utilization fte={fte} width='48%' />
                </Box>
                <Box sx={{px: 2, pt: 2, display: 'flex', flexWrap: "wrap", gap: 2, flexDirection: 'row', justifyContent: 'start', alignContent: 'center'}}>
                  {project.assessment.nfr.map((a, index) => (
                    <Badge key={index} color="secondary" variant="dot">
                      <Typography variant="caption" sx={{color: 'text.primary', fontSize: 12}}>{a.name}</Typography>
                    </Badge>
                  ))}
                </Box>
              </>
            )}
            { open && (
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: {xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)'}}}>
              <HighchartsReact
                highcharts={Highcharts}
                options={getPieOptions(theme, project.summary.tasks)}
              />
              {/*<HighchartsReact
                highcharts={Highcharts}
                options={getWheelOptions(theme, project)}
              />*/}
            </Box>)}
          </Box>
        </Box>              
        { open && (<Box sx={{px: 4 }}>
          {project.projects && project.projects.map((p, index) => (
            <Project key={index} project={p} opened={false} />
          ))}
        </Box>)}
      </CardContent>
    </Card>
  );
}

export default Project;