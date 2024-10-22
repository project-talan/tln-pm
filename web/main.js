//-----------------------------------------------------------------------------
// Global variables
google.charts.setOnLoadCallback(drawChart);

//-----------------------------------------------------------------------------
// Initialisation
$(document).ready(function(){
  updateTeam();
  //updateTimeline();
  updateDashboard()
});


//-----------------------------------------------------------------------------
// Dashboard
$("#dashboard").click(function(){
});

function getProject(id, name, description) {
  return '' +
  '<div class="col">' +
  ' <div class="card">' +
  '   <div class="card-header">' +
  `     <span class="badge float-end rounded-pill text-bg-success">15d</span>` +
  `     <div class="card-title d-inline"><span class="fw-bold">${name}</span> (${id})</div>` +
  '   </div>' +
  '   <div class="card-body">' +
  `     <p class="card-text">${description}</p>` +
  '   </div>' +
  '   <div class="card-footer">' +
  '     Last updated 1 min ago' +
  '   </div>' +
  ' </div>' +
  '</div>';
}

function updateDashboard() {
  $.getJSON("dashboard", function(res, status){
    if (res.success) {
      var list = $('#dashboard_project_list');
      list.empty();
      if (res.data.project) {
        res.data.project.forEach(function(v) {
          list.append(getProject(v.id, v.name, v.description));
        });
      } 
    }
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
  $.getJSON("team", function(res, status){
    if (res.success) {
      var list = $('#dashboard_team_list');
      list.empty();
      Object.keys(res.data).forEach(function(v){
        list.append(getMember(v, res.data[v].name, res.data[v].email));
      });
    }
  });  
}
