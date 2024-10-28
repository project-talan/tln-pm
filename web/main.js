//-----------------------------------------------------------------------------
// Global variables
google.charts.setOnLoadCallback(drawChart);

let projects = [];
let timeline = {};
let teams = {};

const colorsRAG = {
  red: '#c45850', //'#dc3545',
  amber: '#e8c3b9', //'#ffc107',
  green: '#3cba9f' //'#28a745'
};
//-----------------------------------------------------------------------------
// Initialisation
$(document).ready(function(){
  // get general information
  $.getJSON("info", function(res, status){
    if (res.success) {
      $('#nav_version').text(res.data.version);
    }
  });
  //
  initTeam(); updateTeam();
  //initTimeline(); updateTimeline();
  initDashboard(); updateDashboard();
  //
});

//-----------------------------------------------------------------------------
// Utils


//-----------------------------------------------------------------------------
// Dashboard
$("#dashboard-tab").click(function(){
  updateDashboard();
});

function getProject(id, name, summary) {
  const r = { ids: { tasks: `project-${id}-tasks`, workload: `project-${id}-workload` } };
  const lut = dateFns.fp.intervalToDuration({start: new Date(summary.lastCommit), end: new Date() });
  let diff = '?';
  if (lut.years) {
    diff = `${lut.years}y`;
  } else if (lut.months) {
    diff = `${lut.months}m`;
  } else if (lut.days) {
    diff = `${lut.days}d`;
  } else if (lut.hours) {
    diff = `${lut.hours}h`;
  } else if (lut.minutes) {
    diff = `${lut.minutes}m`;
  } else if (lut.seconds) {
    diff = `${lut.seconds}s`;
  }
  const lastUpdateTime = `Updated ${diff} ago`;

  // const rd = dateFns.fp.intervalToDuration({start: new Date(summary.release.date), end: new Date() });
  // console.log(rd);


  r.html = '' +
  '<div class="col pb-4">' +
  ' <div class="card">' +
  '   <div class="card-header bg-body text-body">' +
  `     <span class="badge float-end rounded-pill text-bg-danger">24.10.0 in 15d</span>` +
  `     <div class="card-title d-inline"><span class="fw-bold">${name}</span> (${id})</div>` +
  '   </div>' +
  '   <div class="card-body">' +
  `     <div class="container-fluid">` +
  `       <div class="row 1row-cols-1 1row-cols-sm-2 1row-cols-md-2">` +
  '         <div class="col-5">' +
  `           <canvas id="${r.ids.tasks}"></canvas>` +
  '         </div>' +
  '         <div class="col-7">' +
  `           <canvas id="${r.ids.workload}"></canvas>` +
  '         </div>' +
  '       </div>' +
  '     </div>' +
  '   </div>' +
  `   <div class="card-footer bg-body text-body">${lastUpdateTime}</div>` +
  ' </div>' +
  '</div>';
  return r;
}

function getProjectDetails(description, summary) {
  const r = {};
  // release
  let releaseName = 'n/a';
  let releaseDate = 'n/a';
  let releaseFeatures = 'n/a';
  if (summary.timeline.length) {
    releaseName = summary.timeline[0].name;
    releaseDate = summary.timeline[0].date;
    releaseFeatures = summary.timeline[0].features;
  }
  r.html = '' +
  '<div class="col pb-4">' +
  ' <div class="px-2 pb-4">' +
  `   <h5>${description}</h5>` +
  ' </div>' +
  ' <ul class="list-group">' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">Release</li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">name</span><span class="badge text-bg-secondary rounded-pill">${releaseName}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">date</span><span class="badge text-bg-secondary rounded-pill">${releaseDate}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">features</span><span class="badge text-bg-secondary rounded-pill">${releaseFeatures}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">Workload & Bandwidth</li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">team size</span><span class="badge text-bg-secondary rounded-pill">${Object.keys(summary.team).length}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">Tasks</li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">todo</span><span class="badge text-bg-info rounded-pill">${summary.tasks.todo}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">in development</span><span class="badge text-bg-info rounded-pill">${summary.tasks.indev}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">tbd</span><span class="badge text-bg-info rounded-pill">${summary.tasks.tbd}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">blocked</span><span class="badge text-bg-info rounded-pill">${summary.tasks.blocked}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">done</span><span class="badge text-bg-info rounded-pill">${summary.tasks.done}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">dropped</span><span class="badge text-bg-info rounded-pill">${summary.tasks.dropped}</span>` +
  '   </li>' +
  ' </ul>' +
  '</div>';
  return r;
}

function initDashboard() {
  $.getJSON("projects", function(res, status){
    if (res.success) {
      var list = $('#dashboard_project_list');
      list.empty();
      projects = res.data.projects;
      if (projects) {
        projects.forEach(function(p) {
          const proj = getProject(p.id, p.name, p.summary);
          list.append(proj.html);
          const details = getProjectDetails(p.description, p.summary);
          list.append(details.html);
          //
          const plugin = {
            id: 'emptyDoughnut',
            afterDraw(chart, args, options) {
              const {datasets} = chart.data;
              const {color, width, radiusDecrease} = options;
              let hasData = false;
          
              for (let i = 0; i < datasets.length; i += 1) {
                const dataset = datasets[i];
                hasData |= dataset.data.length > 0;
              }
          
              if (!hasData) {
                const {chartArea: {left, top, right, bottom}, ctx} = chart;
                const centerX = (left + right) / 2;
                const centerY = (top + bottom) / 2;
                const r = Math.min(right - left, bottom - top) / 2;
          
                ctx.beginPath();
                ctx.lineWidth = width || 2;
                ctx.strokeStyle = color || 'rgba(255, 128, 0, 0.5)';
                ctx.arc(centerX, centerY, (r - radiusDecrease || 0), 0, 2 * Math.PI);
                ctx.stroke();
              }
            }
          };
          //
          const tasksCanvas = document.getElementById(proj.ids.tasks);
          const tasksChart = new Chart(tasksCanvas, {
            type: 'doughnut',
            data: {
              datasets: [
                {
                  // backgroundColor: ["#3cba9f", "#3e95cd", "#8e5ea2"],
                  backgroundColor: [colorsRAG.green, colorsRAG.amber, colorsRAG.red],
                  data: [p.summary.tasks.indev,p.summary.tasks.todo,p.summary.tasks.tbd+p.summary.tasks.blocked]
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: 'Tasks\' statuses'
              },              
              plugins: {
                textInCenter: {
                  text: p.summary.tasks.done+p.summary.tasks.dropped,
                  color: '#000',
                  font: '30px Arial'
                },
                emptyDoughnut: {
                  color: 'rgba(255, 128, 0, 0.5)',
                  width: 2,
                  radiusDecrease: 20
                }                
              }              
            },
            plugins: [plugin, {
              id: 'textInCenter',
              afterDraw: function (chart, args, options) {
                const canvasBounds = tasksCanvas.getBoundingClientRect();
                const fontSz = Math.floor( canvasBounds.height * 0.15 ) ;
                chart.ctx.textBaseline = 'middle';
                chart.ctx.textAlign = 'center';
                chart.ctx.font = fontSz+'px Arial';
                chart.ctx.fillText(options.text, canvasBounds.width/2, canvasBounds.height*0.54 )
              }
            }]
          });
          const worloadChart = new Chart(document.getElementById(proj.ids.workload), {
            type: 'bar',
            data: {
              labels: ["1900", "1950", "1999", "2050"],
              datasets: [
                {
                  backgroundColor: "#3e95cd",
                  data: [133,221,783,2478]
                }, {
                  backgroundColor: "#8e5ea2",
                  data: [408,547,675,734]
                }
              ]
            },
            options: {
              aspectRatio: 1,
              //maintainAspectRatio: false,
              plugins: {
                legend: {
                    display: false
                }
              }              
            }
          });
          p.charts = [tasksChart, worloadChart];
        });
      } 
    }
  });  
}

function updateDashboard() {
  projects.forEach(function(p) {
    p.charts.forEach(function(c) {
      c.update();
    });
  });
}

//-----------------------------------------------------------------------------
// Timeline
$("#timeline-tab").click(function(){
  updateTimeline();
});
var ganttChart = null;

function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}
function drawChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Task ID');
  data.addColumn('string', 'Task Name');
  data.addColumn('date', 'Start Date');
  data.addColumn('date', 'End Date');
  data.addColumn('number', 'Duration');
  data.addColumn('number', 'Percent Complete');
  data.addColumn('string', 'Dependencies');

  data.addRows([
    ['Research', 'Find sources',
     new Date(2015, 0, 1), new Date(2015, 0, 5), null,  100,  null],
    ['Write', 'Write paper',
     null, new Date(2015, 0, 9), daysToMilliseconds(3), 25, 'Research,Outline'],
    ['Cite', 'Create bibliography',
     null, new Date(2015, 0, 7), daysToMilliseconds(1), 20, 'Research'],
    ['Complete', 'Hand in paper',
     null, new Date(2015, 0, 10), daysToMilliseconds(1), 0, 'Cite,Write'],
    ['Outline', 'Outline paper',
     null, new Date(2015, 0, 6), daysToMilliseconds(1), 100, 'Research']
  ]);

  var options = {
    height: 512,
    gantt: {
      labelStyle: {
        fontName: 'Roboto',
        fontSize: 16,
        color: '#000'
      }
    }
  };

  if (!ganttChart) {
    ganttChart = new google.visualization.Gantt(document.getElementById('timeline_gantt_chart'));
  }
  ganttChart.draw(data, options);
}

function updateTimeline() {
  drawChart();
}
//-----------------------------------------------------------------------------
// Team
function getMember(id, name, email) {
  return '<tr>' +
  ` <th scope="row">${id}</th>` +
  ` <td>${name}</td>` +
  ' <td class="align-middle">' +
  '  <div class="progress-stacked">' +
  '    <div class="progress" role="progressbar" aria-label="Segment one" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 20%">' +
  '      <div class="progress-bar bg-success">15</div>' +
  '    </div>' +
  '    <div class="progress" role="progressbar" aria-label="Segment two" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100" style="width: 30%">' +
  '      <div class="progress-bar bg-danger">30</div>' +
  '    </div>' +
  '    <div class="progress" role="progressbar" aria-label="Segment three" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width: 50%">' +
  '      <div class="progress-bar bg-warning">50</div>' +
  '    </div>' +
  '  </div>' +
  ' </td>' +
  '</tr>';
}

function initTeam() {
  $.getJSON("teams", function(res, status){
    if (res.success) {
      teams = res.data;
      var list = $('#dashboard_team_list');
      list.empty();
      Object.keys(teams).forEach(function(v){
        list.append(getMember(v, teams[v].name, teams[v].email));
      });
    }
  });  
}

function updateTeam() {
}
