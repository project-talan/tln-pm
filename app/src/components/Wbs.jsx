import { use, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import Highcharts from 'highcharts'
//import Gantt from "highcharts/highcharts-gantt";
import Gantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';  
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';

import Context from '../shared/Context';
import { errorMsgFetchingWbs } from '../shared/Errors';
import { API_BASE_URL } from '../shared/Consts';

function Wbs() {
  const theme = useTheme();
  const { setContext } = use(Context);
  const team = use(Context).context.team;
  const components = use(Context).context.components;
  const selectedMembers = use(Context).context.selectedMembers;
  const timeline = use(Context).context.timeline;
  const deadline = use(Context).context.deadline;
  const statuses = use(Context).context.statuses;
  const priorities = use(Context).context.priorities;
  //
  // Components
  const handleComponentsChange = (newComponents) => {
    let value = [];
    if (newComponents) {
      if (typeof newComponents === 'string') {
        value = [...components, newComponents];
      } else {
        value = newComponents;
      }
    }
    setContext((prev) => ({...prev, components: value}));
  };
  //
  // Subcomponents
  const [subComponents, setSubComponents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const subComponentOpen = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //
  // Timeline
  const plotLines = [];
  const [deadlines] = useState(timeline.map((t) => Object.keys(t.deadline).map((k) => {
    const id = `${t.id}-${t.deadline[k].id}`;
    if (t.deadline[k].active) {
      plotLines.push({
        id,
        value: t.deadline[k].deadline,
        color: t.deadline[k].current ? 'red' : 'blue',
        width: 5
      });
    }
    return id;
  })).flat(1));
  const handleDeadlineChange = (event) => {
    setContext((prev) => ({...prev, deadline: event.target.value}));
  };
  //
  // Statuses
  const handleStatusesChange = (key, value) => {
    const changes = {...statuses};
    changes[key] = value;
    setContext((prev) => ({...prev, statuses: changes}));
  };
  //
  // Priorities
  const handlePrioritiesChange = (key, value) => {
    const changes = {...priorities};
    changes[key] = value;
    setContext((prev) => ({...prev, priorities: changes}));
  };

  //
  // Members
  const [members] = useState(team.filter(m => m.summary.fte > 0).map((m) => {
    return { id: m.id, name: m.name, avatar: m.name.split(' ').map(n => n.substring(0, 1).toUpperCase() ) }
  }));
  const handleToggle = (value) => () => {
    const currentIndex = selectedMembers.indexOf(value);
    const newChecked = [...selectedMembers];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setContext((prev) => ({...prev, selectedMembers: newChecked}));
  };
  //
  // Drawer
  const [openDrawer, setOpenDrawer] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpenDrawer(newOpen);
  };
  const DrawerList = (
    <Box sx={{ p: 2, width: 320 }} role="presentation">
      <Typography variant="h7" component="div" sx={{ flexGrow: 1, pb: 2 }}>
        Details
      </Typography>
      <IconButton
        aria-label="close"
        onClick={toggleDrawer(false)}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 4,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>      
      <FormControl fullWidth size="small">
        <InputLabel id="deadline-select-label">deadline</InputLabel>
        <Select
          labelId="deadline-select-label"
          id="deadline-select"
          value={deadline}
          label="deadline"
          onChange={handleDeadlineChange}
        >
          {deadlines.map((d, index) => (
            <MenuItem key={index} size="small" value={d}><small>{d}</small></MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ py: 2 }}>
        <Divider />
      </Box>
      <FormControl sx={{ width: '100%' }} component="fieldset" >
        <FormLabel component="legend">Priority</FormLabel>
        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          {[{id: 'critical', label: 'Critical'}, {id: 'high', label: 'High'}, {id: 'low', label: 'Low'}].map((p) => (
            <FormControlLabel
              key={p.id}
              sx={{ "& .MuiTypography-root": { fontSize: "14px" }}}
              control={
                <Checkbox 
                  size="small"
                  checked={priorities[p.id]}
                  onChange={(event) => handlePrioritiesChange(p.id, event.target.checked)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />}
              label={p.label}
            />
          ))}
        </Box>        
      </FormControl>
      <Box sx={{ py: 2 }}>
        <Divider />
      </Box>
      <FormControl sx={{ width: '100%' }} component="fieldset" >
        <FormLabel component="legend">Team</FormLabel>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {members.map((m) => {
          const labelId = `checkbox-list-label-${m.id}`;

          return (
            <ListItem
              key={m.id}
              secondaryAction={
                <Avatar sx={{ width: 32, height: 32 }}>{m.avatar}</Avatar>
              }
              disablePadding
            >
              <ListItemButton role={undefined} onClick={handleToggle(m.id)} sx={{pl: 0}} dense>
                <ListItemIcon>
                  <Checkbox
                    size="small"
                    edge="start"
                    checked={selectedMembers.includes(m.id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${m.name} (${m.id})`} />
              </ListItemButton>
            </ListItem>
          );
        })}
        </List>
      </FormControl>
    </Box>
  );
  //
  // Tasks
  const day = 24 * 36e5,
  //today = Math.floor(Date.now() / day) * day;
    today = Date.now();
  
  const transformTasks = (data) => {
    const series = [];
    const processComponent = (parentId, team, timeline, component) => {
      const id = [parentId, component.id].join('.');
      const item = {
        name: component.name,
        id,
        parent: parentId !== '' ? parentId : undefined,
        start: today + component.start,
        end: today + component.end,
        // data: 'data',
        // owner: 'Linda'
        completed: {
          amount: Math.trunc(Math.random() * 100) / 100
        },
      };
      // TODO: add completed amount into task
      // completed: {
      //   amount: 0.2
      // },
    
      series.push(item);
      //
      const processTasks = (parentId, tasks) => {
        tasks.forEach((t, index) => {
          const id = [parentId, t.id ? t.id : index].join('.');
          const task = {
            name: t.title,
            id,
            parent: parentId,
            start: today + t.start,
            end: today + t.end,
          };
          series.push(task);
          //
          processTasks(id, t.tasks);
        });
      };
      processTasks(id, component.tasks);
      component.components.forEach((c) => {          
        processComponent(id, team, timeline, c);
      });
    };
    //
    processComponent('', {}, {}, data);
    //console.log(JSON.stringify(series));
    return series;
  };
  const [chartOptions, setChartOptions] = useState({
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
        dataLabels: [
          {
          enabled: true,
          align: 'left',
          format: '',
          padding: 10,
          style: {
            color: 'white',
            fontWeight: 'normal',
            textOutline: 'none'
          }
          }, {
            enabled: true,
            align: 'center',
            format: '{#if point.completed}{(multiply ' +
              'point.completed.amount 100):.0f}%{/if}',
            padding: 10,
            style: {
              fontWeight: 'normal',
              textOutline: 'none',
              opacity: 0.6
            }
          }
        ]
      }
    },

    series: [
      {
        name: 'WBS',
        data: []
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
      max: today + 8 * day,
      custom: {
        today,
        weekendPlotBands: true
      },
      plotLines: plotLines.map((l) => ({
        label: {
          rotation: 0,
          text: l.id,
          x: 0,
          y: -5
        },
        value: l.value,
        color: l.color,
        width: l.width,
        zIndex: 10
      }))
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

  useEffect(() => {
    const getTasks = async () => {
      try {
        const query = [];
        if (statuses) {
          query.push(`status=${Object.keys(statuses).filter((k) => statuses[k]).join(',')}`);
        }
        // Assignees 
        if (selectedMembers.length) {
          query.push(`assignees=${selectedMembers.join(',')}`);
        }
        // Tags
        const tags = [];
        if (deadline) {
          tags.push(deadline.split('-')[1]);
        }
        Object.keys(priorities).forEach((k) => {
          if (priorities[k]) {
            tags.push(k);
          }
        });
        if (tags.length) {
          query.push(`tags=${tags.join(',')}`);
        }
        // Search
        // if (search.length) {
        //   query.push(`search=${search.join(',')}`);
        // }
        const p = (['tasks'].concat(components)).join('/');
        const q = query.join('&');
        const url = `${API_BASE_URL}/${p}?${q}`;
        console.log('url:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw error;
        }
        const data = await response.json();
        if (data.success) {
          const tasks = transformTasks(data.data);
          setChartOptions( prev => ({...prev, series: [
            {
              name: 'WBS',
              data: tasks
            },
          ]}));
          setSubComponents(data.data.components.map((c) => c.id));
          console.log('tasks:', tasks);
        }
      } catch (error) {
        console.log('error:', error);
        throw new Error(errorMsgFetchingWbs + `\nDetails: ${error.message}`);
      } 
    };
    getTasks();
  }, [components, statuses, selectedMembers, deadline, priorities]);

  //
  console.log('!Wbs');
  return (
    <Container maxWidth="xl" sx={{pt: 1}}>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center'}}>
        {/* Breadcrumbs menu */}
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={subComponentOpen}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {subComponents.map((c, index) => (
            <MenuItem key={index} onClick={(event) => {
              setAnchorEl(null);
              handleComponentsChange(c);
            }}>{c}</MenuItem>
          ))}
        </Menu>        
        <Breadcrumbs aria-label="breadcrumb">
          <IconButton size="small" onClick={() => handleComponentsChange()}>
            <HomeIcon fontSize="inherit"/>
          </IconButton>
          {components.map((c, index) => (
            <Button key={index} size="small" sx={{textTransform : "none"}} onClick={() => handleComponentsChange(components.slice(0, index+1))}>{c}</Button>
          ))}
          {subComponents.length && <IconButton
            size="small"
            id="basic-button"
            aria-controls={subComponentOpen ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={subComponentOpen ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreHorizIcon fontSize="inherit"/>
          </IconButton>}
        </Breadcrumbs>
        {/* Statuses */}
        <FormControl component="fieldset" >
          <FormGroup aria-label="position" row>
            {Object.keys(statuses).map((key, index) => (
              <FormControlLabel
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
                onChange={(event) => handleStatusesChange(key, event.target.checked)} />}
                label={<Box component="div" fontSize={14}>{key}</Box>}
                labelPlacement="end"
              />
            ))}
            {/* Filtering details Drawer */}
            <FormControl variant="standard" sx={{ pl: 4}}>
              <IconButton size="small" onClick={toggleDrawer(true)}>
                <TuneIcon fontSize="inherit"/>
              </IconButton>
            </FormControl>

          </FormGroup>
          <Drawer open={openDrawer} anchor='right' onClose={toggleDrawer(false)}>
            {DrawerList}
          </Drawer>          
        </FormControl>
      </Box>
      <HighchartsReact
        containerProps={{ style: { height: "100%" } }}
        constructorType={'ganttChart'}
        highcharts={Gantt}
        options={chartOptions}
      />
    </Container>
  );
}

export default Wbs;