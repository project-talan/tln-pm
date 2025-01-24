import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import MultilineChartIcon from '@mui/icons-material/MultilineChart';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import InboxIcon from '@mui/icons-material/Inbox';
import Divider from '@mui/material/Divider';

import { styled, useTheme } from '@mui/material/styles';

import { compareAsc, format } from "date-fns";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import StateContext from '../StateContext';
import { getLocalISOString, getClosestRelease, getLastUpdateTime } from '../shared/utils';

const TableValue = styled('Typography')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 14,
  fontStyle: 'italic',
  fontWeight: 'bold',
}));

const getPieOptions = (theme, tasks) => ({
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

const getLineOptions = (theme, project) => {
  const numberofDays = 10;
  const totalFte = project.summary.totalFte;
  const base = 0.5 * (Math.random() + 1);
  const diff = (1 - base) * totalFte;

  return ({
    title: {
      text: ' ',
      align: 'left'
    },

    // subtitle: {
    //   text: 'By Job Category. Source: <a href="https://irecusa.org/programs/solar-jobs-census/" target="_blank">IREC</a>.',
    //   align: 'left'
    // },

    yAxis: {
      // title: {
      //   text: 'Number of Employees'
      // }
    },

    xAxis: {
      accessibility: {
        rangeDescription: 'Range: 2010 to 2022'
      }
    },

    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle'
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false
        },
        pointStart: 1
      }
    },

    series: [{
      name: 'Max FTE',
      data: Array(numberofDays).fill(totalFte)
    }, {
      name: 'Actual FTE',
      data: Array(numberofDays).fill(0).map( (v) => totalFte * base + (Math.random() * 2 * diff - diff))
    }],

    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  })
};

function Dashboard() {
  const { config } = React.useContext(StateContext);
  const theme = useTheme();
  
  const [projects, setProjects ] = React.useState([]);
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/projects`);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setProjects(data.data.projects.map((p) => {
        const size = p.summary.team.reduce((acc, member) => acc + (member.bandwidth[0].fte > 0 ? 1 : 0), 0);
        const total = p.summary.team.length;
        return ({
          ...p,
          release: getClosestRelease(p.summary.timeline),
          team: { size, total },
          lastUpdateTime: getLastUpdateTime(p.summary)});
      }));
      // setLoading(false);
    } catch (error) {
      // setError(error.message);
      // setLoading(false);
    }
  };
  //
  React.useEffect(() => {
    fetchData();
  }, []);
  //
  const [mode, setMode] = React.useState('full');
  const handleMode = (event, newMode) => {
    setMode(newMode);
  };  

  const style = {
    py: 0,
    width: '100%',
//    maxWidth: 360,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
  };
  return (
    <Container maxWidth="xl" sx={{backgroundColor: 'skyblue1', pt: 2}}>
      {/*<Box sx={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: 'lightgrey1'}}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleMode}
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
      {projects.map((p, index) => {
        return (
          <Card variant="outlined" key={index} sx={{my: 2}}>
            <CardContent>
            <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: {xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)'}}}>
              <Box sx={{ position: 'relative'}}>
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14, position: 'absolute', left: 0, bottom: -20 }}>
                  <i>updated {p.lastUpdateTime} ago</i>
                </Typography>
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  {p.id}
                </Typography>
                <Typography variant="h5" component="div">
                  {p.name}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{p.description}</Typography>
                <Box sx={{px: 4 }}>
                <List sx={style}>
                  <ListItem
                    secondaryAction={
                      <TableValue>in {p.release.timeToRelease}</TableValue>
                    }
                  >
                    <ListItemText primary={<Typography><b>Release</b></Typography>}/>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem
                    sx={{pl: 4}}
                    secondaryAction={
                      <TableValue>{p.release.releaseName}</TableValue>
                    }
                  >
                    <ListItemText primary="Version" />
                  </ListItem>
                  <ListItem
                    sx={{pl: 4}}
                    secondaryAction={
                      <TableValue>{getLocalISOString(p.release.releaseDate)}</TableValue>
                    }
                  >
                    <ListItemText primary="Date" />
                  </ListItem>
                  <ListItem sx={{pl: 4}}
                    secondaryAction={
                      <TableValue>{p.release.releaseFeatures}</TableValue>
                    }
                  >
                    <ListItemText primary="Features" />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary={<Typography><b>Workload & Bandwidth</b></Typography>} />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                  <ListItem sx={{pl: 4}}
                    secondaryAction={
                      <TableValue>{p.team.size}({p.team.total})</TableValue>
                    }
                  >
                    <ListItemText primary="Team size (total)" />
                  </ListItem>
                </List>

                </Box>     
              </Box>
              <Box>
              <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: {xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)'}}}>
                  <HighchartsReact
                	  highcharts={Highcharts}
                    options={getPieOptions(theme, p.summary.tasks)}
                  />
                  <HighchartsReact
                	  highcharts={Highcharts}
                    options={getLineOptions(theme, p)}
                  />
                </Box>
              </Box>
            </Box>              
            </CardContent>
            {/*<CardActions>
              <Button size="small">Learn More</Button>
            </CardActions>*/}
          </Card>
        );
      })}      
    </Container>
  );
}
export default Dashboard;
