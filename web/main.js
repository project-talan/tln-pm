//-----------------------------------------------------------------------------
// Global variables
google.charts.setOnLoadCallback(drawChart);

let projects = [];
let timeline = {};
let team = {};
//-----------------------------------------------------------------------------
// Initialisation
$(document).ready(function(){
  updateTeam();
  //updateTimeline();
  initDashboard();
  updateDashboard();
  //
});


//-----------------------------------------------------------------------------
// Dashboard
$("#dashboard-tab").click(function(){
  updateDashboard();
});

function getProject(id, name, description) {
  const r = { ids: { tasks: `project-${id}-tasks`, workload: `project-${id}-workload` } };
  r.html = '' +
  '<div class="col pb-4">' +
  ' <div class="card">' +
  '   <div class="card-header bg-body text-body">' +
  `     <span class="badge float-end rounded-pill text-bg-danger">24.10.0 in 15d</span>` +
  `     <div class="card-title d-inline"><span class="fw-bold">${name}</span> (${id})</div>` +
  '   </div>' +
  '   <div class="card-body">' +
  `     <div class="container-fluid">` +
  `       <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2">` +
  '         <div class="col">' +
  `           <canvas id="${r.ids.tasks}"></canvas>` +
  '         </div>' +
  '         <div class="col">' +
  `           <canvas id="${r.ids.workload}"></canvas>` +
  '         </div>' +
  '       </div>' +
  '     </div>' +
  '   </div>' +
  '   <div class="card-footer bg-body text-body">' +
  '     Last updated 1 min ago' +
  '   </div>' +
  ' </div>' +
  '</div>';
  return r;
}



function getProjectDetails(description, summary) {
  const r = {};
  console.log(summary.lastCommit);
  console.log(dateFns.fp.intervalToDuration({
    start: new Date(summary.lastCommit.year-1, summary.lastCommit.month, summary.lastCommit.day-1, summary.lastCommit.hour, summary.lastCommit.minute, summary.lastCommit.second),
    end: new Date()
  }));

  r.html = '' +
  '<div class="col pb-4">' +
  ' <div class="px-2 pb-4 bg-body-tertiary1 border1 rounded-3">' +
  `   <h5>${description}</h5>` +
  ' </div>' +
  ' <ul class="list-group">' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">Release</li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  '     <span class="fst-italic">name</span><span class="badge text-bg-secondary rounded-pill">24.10.0</span>' +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  '     <span class="fst-italic">date</span><span class="badge text-bg-secondary rounded-pill">24.10.27</span>' +
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
          const proj = getProject(p.id, p.name, p.description);
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
                  backgroundColor: ["#3cba9f", "#3e95cd", "#8e5ea2"],
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

  var chart = new google.visualization.Gantt(document.getElementById('chart_div'));

  chart.draw(data, options);
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

function updateTeam() {
  $.getJSON("teams", function(res, status){
    if (res.success) {
      var list = $('#dashboard_team_list');
      list.empty();
      Object.keys(res.data).forEach(function(v){
        list.append(getMember(v, res.data[v].name, res.data[v].email));
      });
    }
  });  
}
