import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import Highcharts from 'highcharts'
import gantt from "highcharts/highcharts-gantt";
import HighchartsReact from 'highcharts-react-official'

import StateContext from '../StateContext';

const day = 24 * 36e5,
//today = Math.floor(Date.now() / day) * day;
  today = Date.now();
const getGanttOptions = (theme) => ({
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

  series: [{
    name: 'Offices',
    data: [{
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
    }]
  },/* {
    name: 'Product',
    data: [{
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
  }*/],
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
    min: today - 3 * day,
    max: today + 18 * day,
    custom: {
      today,
      weekendPlotBands: true
    },
    plotLines: [{
      label: {
        rotation: 0,
        text: '0.15.0',
        x: 0,
        y: -5
      },
      value: today + 10 * day,
      color: 'red',
      width: 5,
      zIndex: 3
    },
    {
      label: {
        rotation: 0,
        text: '0.16.0',
        x: 0,
        y: -5
      },
      value: today + 12 * day,
      color: 'green',
      width: 5,
      zIndex: 3
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

function Timeline() {
  const { config } = React.useContext(StateContext);
  const theme = useTheme();
  const [/*tasks*/, setTasks] = React.useState([]);
  //
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/tasks`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setTasks(data.data.tasks);
        // setLoading(false);
      } catch (error) {
        // setError(error.message);
        // setLoading(false);
      }
    };
    fetchData();
  }, [config.apiBaseUrl]);

  return (
    <Container maxWidth="xl" sx={{pt: 2}}>
      <Box sx={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: 'lightgrey'}}>
      </Box>
      <HighchartsReact
        constructorType={"ganttChart"}
        highcharts={gantt}
        options={getGanttOptions(theme)}
      />

    </Container>
  );
}
export default Timeline;
