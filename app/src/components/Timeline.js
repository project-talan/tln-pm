import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import Highcharts from 'highcharts'
import gantt from "highcharts/highcharts-gantt";
import HighchartsReact from 'highcharts-react-official'
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import StateContext from '../StateContext';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';


const day = 24 * 36e5,
//today = Math.floor(Date.now() / day) * day;
  today = Date.now();

const testData = 
    [
      {
        name: 'Hierarchy',
        data: [
          {
            name: 'New offices',
            id: 'new_offices',
            owner: 'Peter'
          }, {
            name: 'Prepare office building',
            id: 'prepare_building',
            parent: 'new_offices',
            start: today - (2 * day),
            end: today + (6 * day),
            completed: {
              amount: 0.2
            },
            data: 'data',
            owner: 'Linda'
          },{
            name: 'Inspect building',
            id: 'inspect_building',
            dependency: 'prepare_building',
            parent: 'new_offices',
            start: today + 6 * day,
            end: today + 8 * day,
            owner: 'Ivy'
          }, {
            name: 'Relocate',
            id: 'relocate',
            dependency: 'inspect_building',
            parent: 'new_offices',
            owner: 'Josh'
          }, {
            name: 'Relocate staff',
            id: 'relocate_staff',
            parent: 'relocate',
            start: today + 10 * day,
            end: today + 11 * day,
            owner: 'Mark'
          }, {
            name: 'Relocate test facility',
            dependency: 'relocate_staff',
            parent: 'relocate',
            start: today + 11 * day,
            end: today + 13 * day,
            owner: 'Anne'
          }, {
            name: 'Relocate cantina',
            dependency: 'relocate_staff',
            parent: 'relocate',
            start: today + 11 * day,
            end: today + 14 * day
          }
        ]
      }, 
      {
        name: 'Product',
        data: [
        {
          name: 'New product launch',
          id: 'new_product',
          owner: 'Peter'
        }, {
          name: 'Development',
          id: 'development',
          parent: 'new_product',
          start: today - day,
          end: today + (11 * day),
          completed: {
            amount: 0.6,
            fill: '#e80'
          },
          owner: 'Susan'
        }, {
          name: 'Beta',
          id: 'beta',
          dependency: 'development',
          parent: 'new_product',
          start: today + 12.5 * day,
          milestone: true,
          owner: 'Peter'
        }, {
          name: 'Final development',
          id: 'finalize',
          dependency: 'beta',
          parent: 'new_product',
          start: today + 13 * day,
          end: today + 17 * day
        }, {
          name: 'Launch',
          dependency: 'finalize',
          parent: 'new_product',
          start: today + 17.5 * day,
          milestone: true,
          owner: 'Peter'
        }]
      }
    ];


const getGanttOptions = (theme, data) => {
  return ({
    credits: {
      enabled: false
    },  
    chart: {
      type: 'gantt',
      plotBackgroundColor: 'rgba(128,128,128,0.02)',
      plotBorderColor: 'rgba(128,128,128,0.1)',
      plotBorderWidth: 1
    },

    plotOptions: {
      series: {
        borderRadius: '50%',
        connectors: {
          dashStyle: 'ShortDot',
          lineWidth: 2,
          radius: 5,
          startMarker: {
            enabled: false
          }
        },
        groupPadding: 0,
        dataLabels: [{
          enabled: true,
          align: 'left',
          format: '{point.name}',
          padding: 10,
          style: {
            fontWeight: 'normal',
            textOutline: 'none'
          }
        }, {
          enabled: true,
          align: 'right',
          format: '{#if point.completed}{(multiply ' +
            'point.completed.amount 100):.0f}%{/if}',
          padding: 10,
          style: {
            fontWeight: 'normal',
            textOutline: 'none',
            opacity: 0.6
          }
        }]
      }
    },

    series: [
      {
        name: 'Hierarchy',
        data
      },
    ],
    // series: testData,
    tooltip: {
      pointFormat: '<span style="font-weight: bold">{point.name}</span><br>' +
        '{point.start:%e %b}' +
        '{#unless point.milestone} → {point.end:%e %b}{/unless}' +
        '<br>' +
        '{#if point.completed}' +
        'Completed: {multiply point.completed.amount 100}%<br>' +
        '{/if}' +
        'Assignee: {#if point.owner}{point.owner}{else}unassigned{/if}'
    },
    /*
    title: {
      text: '',
    },
    */
    xAxis: [{
      currentDateIndicator: {
        color: '#2caffe',
        dashStyle: 'ShortDot',
        width: 2,
        label: {
          format: ''
        }
      },
      dateTimeLabelFormats: {
        day: '%e<br><span style="opacity: 0.5; font-size: 0.7em">%a</span>'
      },
      grid: {
        borderWidth: 0
      },
      gridLineWidth: 1,
      min: today - day,
      max: today + 18 * day,
      custom: {
        today,
        weekendPlotBands: true
      },
      plotLines: [{
        label: {
          rotation: 0,
          text: 'talentwise-0.15.0',
          x: 0,
          y: -5
        },
        value: today + 10 * day,
        color: 'red',
        width: 5,
        zIndex: 10
      },
      {
        label: {
          rotation: 0,
          text: 'talentwise-0.16.0',
          x: 0,
          y: -5
        },
        value: today + 12 * day,
        color: 'green',
        width: 5,
        zIndex: 10
      }]
    }],
    yAxis: {
      grid: {
        borderWidth: 0
      },
      gridLineWidth: 0,
      labels: {
        symbol: {
          width: 8,
          height: 6,
          x: -4,
          y: -2
        }
      },
      staticScale: 30
    },
    accessibility: {
      keyboardNavigation: {
        seriesNavigation: {
          mode: 'serialize'
        }
      },
      point: {
        descriptionFormatter: function(point) {
          const completedValue = point.completed ?
            point.completed.amount || point.completed : null,
            completed = completedValue ?
            ' Task ' + Math.round(completedValue * 1000) / 10 +
            '% completed.' :
            '',
            dependency = point.dependency &&
            point.series.chart.get(point.dependency).name,
            dependsOn = dependency ?
            ' Depends on ' + dependency + '.' : '';

          return Highcharts.format(
            point.milestone ?
            '{point.yCategory}. Milestone at {point.x:%Y-%m-%d}. ' +
            'Owner: {point.owner}.{dependsOn}' :
            '{point.yCategory}.{completed} Start ' +
            '{point.x:%Y-%m-%d}, end {point.x2:%Y-%m-%d}. Owner: ' +
            '{point.owner}.{dependsOn}', {
              point,
              completed,
              dependsOn
            }
          );
        }
      }
    },
    lang: {
      accessibility: {
        axis: {
          xAxisDescriptionPlural: 'The chart has a two-part X axis ' +
            'showing time in both week numbers and days.'
        }
      }
    }
  });
}

Highcharts.addEvent(Highcharts.Axis, 'foundExtremes', e => {
  if (e.target.options.custom && e.target.options.custom.weekendPlotBands) {
    const axis = e.target,
      chart = axis.chart,
      day = 24 * 36e5,
      isWeekend = t => /[06]/.test(chart.time.dateFormat('%w', t)),
      plotBands = [];

    let inWeekend = false;

    for (
      let x = Math.floor(axis.min / day) * day; x <= Math.ceil(axis.max / day) * day; x += day
    ) {
      const last = plotBands.at(-1);
      if (isWeekend(x) && !inWeekend) {
        plotBands.push({
          from: x,
          color: {
            pattern: {
              path: 'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
              width: 10,
              height: 10,
              color: 'rgba(128,128,128,0.15)'
            }
          }
        });
        inWeekend = true;
      }

      if (!isWeekend(x) && inWeekend && last) {
        last.to = x;
        inWeekend = false;
      }
    }
    axis.options.plotBands = plotBands;
  }
});

 const transformTasks = (data) => {
    const series = [];
    let step = 0;
    const processComponent = (parentId, team, timeline, component) => {
      const id = [parentId, component.id].join('.');
      const item = {
        name: component.name,
        id,
        parent: parentId !== '' ? parentId : undefined,
        start: today + step * day,
        end: today + (step + 1) * day,
        // data: 'data',
        // owner: 'Linda'
        completed: {
          amount: 0.5
        },
      };
      // TODO: add completed amount into task
      // completed: {
      //   amount: 0.2
      // },
    
      const index = series.push(item) - 1;
      step++;
      //
      const processTasks = (parentId, tasks) => {
        tasks.forEach((t, index) => {
          const id = [parentId, t.id ? t.id : index].join('.');
          const task = {
            name: t.title,
            id,
            parent: parentId,
            start: today + step * day,
            end: today + (step + 1) * day,
          };
          series.push(task);
          step++;
          //
          processTasks(id, t.tasks);
        });
      };
      processTasks(id, component.tasks);
      series[index].end = today + (series.length - index) * day;
      component.components.forEach((c) => {          
        processComponent(id, team, timeline, c);
      });
    };
    //
    processComponent('', {}, {}, data);
    //console.log(JSON.stringify(series));
    return series;
  }
  
function Timeline() {
  const { config } = React.useContext(StateContext);
  const theme = useTheme();
  const [tasks, setTasks] = React.useState([]);
  const [components, setComponents] = React.useState([]);
  // Statuses
  const [statuses, setStatuses] = React.useState({todo: true, dev: true, blocked: true, done: false});
  // Next level components
  const [subComponents, setSubComponents] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  //
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const p = (['tasks'].concat(components)).join('/');
        const q = Object.keys(statuses).map((key) => `${key}=${statuses[key]}`).join('&');
        const response = await fetch(`${config.apiBaseUrl}/${p}?${q}`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        const tasks = transformTasks(data.data);
        setTasks(tasks);
        setSubComponents(data.data.components.map((c) => c.id));
        // setLoading(false);
      } catch (error) {
        console.error(error);
        // setError(error.message);
        // setLoading(false);
      }
    };
    fetchData();
  }, [theme, config.apiBaseUrl, components, statuses]);

  return (
    <Container maxWidth="xl" sx={{pt:1}}>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center'}}>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {subComponents.map((c, index) => (
            <MenuItem key={index} onClick={(event) => {
              setAnchorEl(null);
              setComponents([...components, c]);
            }}>{c}</MenuItem>
          ))}
        </Menu>        
        <Breadcrumbs aria-label="breadcrumb">
          <IconButton size="small" onClick={() => setComponents([])}>
            <HomeIcon fontSize="inherit"/>
          </IconButton>
          {components.map((c, index) => (
            <Button key={index} size="small" sx={{textTransform : "none"}} onClick={() => setComponents(components.slice(0, index+1))}>{c}</Button>
          ))}
          {subComponents.length && <IconButton
            size="small"
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreHorizIcon fontSize="inherit"/>
          </IconButton>}
        </Breadcrumbs>

        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            {Object.keys(statuses).map((key, index) => (
              <FormControlLabel
                disabled
                key={index}
                value="end"
                control={<Switch checked={statuses[key]} size="small" sx={{
                  "&.MuiSwitch-root .MuiSwitch-switchBase": {
                    color: "darkgray"
                  },
                  "&.MuiSwitch-root .MuiSwitch-track": {
                    backgroundColor: theme.tasks[key].backgroundColor,
                  },                
                  "&.MuiSwitch-root .Mui-checked": {
                   color: theme.tasks[key].backgroundColor
                  }
                 }}
                onChange={(event)=> { const changes = {}; changes[key] = event.target.checked; setStatuses({...statuses, ...changes })}} />}
                label={<Box component="div" fontSize={14}>{key}</Box>}
                labelPlacement="end"
              />
            ))}
          </FormGroup>
        </FormControl>

      </Box>
      <HighchartsReact
        containerProps={{ style: { height: "100%" } }}
        constructorType={"ganttChart"}
        highcharts={gantt}
        options={getGanttOptions(theme, tasks)}
      />
    </Container>
  );
}
export default Timeline;


