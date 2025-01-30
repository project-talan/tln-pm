import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import Highcharts from 'highcharts'
import gantt from "highcharts/highcharts-gantt";
import HighchartsReact from 'highcharts-react-official'

import StateContext from '../StateContext';

/*
const data1 = [
  {
    timeline: [
      {"id":"25.2.0","deadline":"2025-02-04T15:00:00.000Z","features":9},
      {"id":"25.1.1","deadline":"2025-01-30T15:00:00.000Z","features":17},
      {"id":"25.1.0","deadline":"2025-01-14T15:00:00.000Z","features":7},
      {"id":"24.12.1","deadline":"2024-12-28T12:00:00.000Z","features":1},
      {"id":"24.12.0","deadline":"2024-12-07T22:50:00.000Z","features":16},
      {"id":"24.11.2","deadline":"2024-11-27T21:10:00.000Z","features":3},
      {"id":"24.11.1","deadline":"2024-11-22T22:30:00.000Z","features":7},
      {"id":"24.11.0","deadline":"2024-11-15T15:00:00.000Z","features":2},
      {"id":"24.10.0","deadline":"2024-11-02T21:00:00.000Z","features":34},
      {"id":"24.9.1","deadline":"2024-10-14T13:00:00.000Z","features":0},
      {"id":"24.9.0","deadline":"2024-10-11T13:00:00.000Z","features":49}
    ],
    components: [
      {
        "id":"talentwise",
        "relativePath":"",
        "name":"Talentwise.me",
        "tasks":[
          {
            "status":">","id":"019","title":"Main use cases","percentage":57,"deadline":"25.1.1","assignees":["vlad.k"],"tags":["high"],"links":[],
            "tasks":[
              {"status":"+","id":"","title":"Register/login/reset password/logout/deactivate account","percentage":100,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
              {"status":"+","id":"","title":"Manage employees","percentage":100,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
              {"status":"+","id":"","title":"Manage teams (add/update/soft delete)","percentage":100,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
              {"status":"+","id":"","title":"Register/Soft delete employee and add/remove to/from team","percentage":100,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
              {"status":">","id":"","title":"Fill ERM form for employee","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
              {"status":">","id":"","title":"Get valid information inside dashboard area","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
              {"status":">","id":"","title":"Get valid reports inside ERM area + History","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]}
            ]
          }
        ],
        "components":[
          {
            "id":"backend",
            "relativePath":"backend",
            "name":"backend",
            "tasks":[
              {"status":"-","id":"002","title":"Make DB connection self-healing cycle cancelable","percentage":0,"deadline":"v25.2.0","assignees":["artem.y"],"tags":[],"links":[],"tasks":[]}
            ],
            "components":[
              {
                "id":"services",
                "relativePath":"backend/services",
                "name":"services",
                "tasks":[],
                "components":[
                  {
                    "id":"core",
                    "relativePath":"backend/services/core",
                    "name":"core",
                    "tasks":[
                      {"status":"-","id":"011","title":"Action points and Actions","percentage":0,"deadline":"25.2.0","assignees":["artem.y"],"tags":["medium"],"links":[],"tasks":[]},
                      {"status":">","id":"010","title":"Surveys and Answers","percentage":75,"deadline":"25.1.1","assignees":["artem.y"],"tags":["high"],"links":[],"tasks":[]},
                    ],
                    "components":[]
                  },
                  {
                    "id":"iam",
                    "relativePath":"backend/services/iam",
                    "name":"iam",
                    "tasks":[
                      {"status":"-","id":"013","title":"Implement /iam/invites endpoint","percentage":0,"deadline":"25.1.1","assignees":["vlad.k"],"tags":["medium"],"links":[],"tasks":[]},
                      {"status":"-","id":"006","title":"Integrate Stipe keys","percentage":0,"deadline":"25.1.1","assignees":["vlad.k"],"tags":["medium"],"links":[],"tasks":[]}
                    ],
                    "components":[]
                  }
                ]
              }
            ]
          },
          {
            "id":"web",
            "relativePath":"web",
            "name":"web",
            "tasks":[
              {"status":">","id":"007","title":"Incapsulate communication with backend api inside single class (X-API-Version one definition per app)","percentage":50,"deadline":"25.1.1","assignees":["artem.y"],"tags":[],"links":[],
                "tasks":[
                  {"status":"+","id":"","title":"app","percentage":100,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
                  {"status":">","id":"","title":"landing","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]}
                ]
              }
            ],
            "components":[
              {
                "id":"app",
                "relativePath":"web/app",
                "name":"app",
                "tasks":[
                  {"status":"-","id":"031","title":"Add time interval and period (day, week, month, quarter, year) pickers inside Dashboard area and use them during API calls","percentage":0,"deadline":"25.1.1","assignees":["artem.y"],"tags":["medium"],"links":[],"tasks":[]},
                  {"status":"-","id":"029","title":"When chart data is not awailable, display overlay element with \"No data available\" as a text","percentage":0,"deadline":"25.1.1","assignees":["artem.y"],"tags":["medium"],"links":[],"tasks":[]},
                  {"status":"-","id":"028","title":"Optimize survey answers storage","percentage":0,"deadline":"25.2.0","assignees":["artem.y"],"tags":["medium"],"links":[],"tasks":[]},
                  {"status":">","id":"027","title":"Connect Dashboard charts with backedn API endpoint /core/bi","percentage":0,"deadline":"25.1.1","assignees":["artem.y"],"tags":["medium"],"links":[],"tasks":[]},
                  {"status":"-","id":"021","title":"Onboarding survey","percentage":0,"deadline":"25.2.0","assignees":["artem.y"],"tags":[],"links":[],
                    "tasks":[
                      {"status":"-","id":"","title":"Two tabs: 30 days / 90 days","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
                      {"status":"-","id":"","title":"Chart for factors","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
                      {"status":"-","id":"","title":"Chart for dimentions","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
                      {"status":"-","id":"","title":"List of employees which should be surveyed","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]}
                    ]
                  },
                  {"status":"-","id":"013","title":"Login page UI/UX","percentage":0,"deadline":"25.2.0","assignees":["artem.y"],"tags":["highest"],"links":[],"tasks":[]},
                  {"status":"-","id":"010","title":"Add \"Settings\" page","percentage":0,"deadline":"25.2.0","assignees":["artem.y"],"tags":["high"],"links":[],"tasks":[]},
                  {"status":">","id":"009","title":"Add \"My account\" page","percentage":0,"deadline":"25.1.1","assignees":["artem.y"],"tags":["high"],"links":[],"tasks":[]},
                  {"status":"-","id":"005","title":"Read & display user profile","percentage":0,"deadline":"25.2.0","assignees":["artem.y"],"tags":["high"],"links":[],
                    "tasks":[
                      {"status":"-","id":"","title":"Current user profile - https://app.dev01.talentwise.one/profile","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]},
                      {"status":"-","id":"","title":"Any User profile - https://app.dev01.talentwise.one/profile/93c2f91c-346b-4c15-bbc8-8b07fba76833","percentage":0,"deadline":"","assignees":[],"tags":[],"links":[],"tasks":[]}
                      ]
                    }
                  ],
                  "components":[]
                }
            ]
          },
          {
            "id":"platform",
            "relativePath":"platform",
            "name":"platform",
            "tasks":[
                {"status":"-","id":"031","title":"Describe how Tenants/Orgs/RBAC/ACL should work","percentage":0,"deadline":"25.1.1","assignees":["vlad.k"],"tags":["medium"],"links":[],"tasks":[]},
                {"status":"-","id":"029","title":"Add Cognito attributes mapping and integrate AD OIDP (Hiringwise)","percentage":0,"deadline":"25.2.0","assignees":["vlad.k"],"tags":["medium"],"links":[],"tasks":[]},
                {"status":"-","id":"028","title":"Update Cognito CSS file to tweak login page (https://docs.aws.amazon.com/cognito/latest/developerguide/hosted-ui-classic-branding.html)","percentage":0,"deadline":"v25.1.1","assignees":["artem.y","vlad.k"],"tags":["low"],"links":[],"tasks":[]},
                {"status":"!","id":"023","title":"Configure Keycloack email service","percentage":0,"deadline":"v25.2.0","assignees":["vlad.k"],"tags":["high"],"links":[],"tasks":[]},
                {"status":"-","id":"022","title":"Add tenant registration API call during deployment","percentage":0,"deadline":"v25.1.1","assignees":["vlad.k"],"tags":["medium"],"links":[],"tasks":[]},
                {"status":"!","id":"017","title":"Add env vars to define tokens validity time","percentage":0,"deadline":"25.2.0","assignees":["vlad.k"],"tags":[],"links":[],"tasks":[]}
            ],
            "components":[]
          }
        ]
      }
    ]
  }
];
*/

const day = 24 * 36e5,
//today = Math.floor(Date.now() / day) * day;
  today = Date.now();
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
        zIndex: 10
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
