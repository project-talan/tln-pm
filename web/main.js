//-----------------------------------------------------------------------------
// Global variables
//google.charts.setOnLoadCallback(drawChart);

let projects = [];
let timeline = {};
let team = {};
let tasks = {};
let srs = {};
let topics = {};

const colors = {
  rag: {
    red: '#c45850', //'#dc3545',
    amber: '#e8c3b9', //'#ffc107',
    green: '#3cba9f' //'#28a745'
  },
  timeline: {
    component: 'gray',
    group: '#20C997',
    todo: '#FFA500',
    dev: '#007BFF',
    blocked: '#DC3545',
    done: '#28A745'
  }
};

const state = {
  ui: {
    dashboard: {
      showGraph: true,
      showList: true,
      showClosest: true
    },
    timeline: {
    },
    team: {
    },
    srs: {
    }
  }
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
  initDashboard();
  initTeam();
  initTimeline();
  initSrs(); updateSrs();
});

//-----------------------------------------------------------------------------
// Utils

function getStringFromInterval(interval) {
  let diff = '?';
  if (interval) {
    if (interval.years) {
      diff = `${interval.years} yr`;
    } else if (interval.months) {
      diff = `${interval.months} mo`;
    } else if (interval.days) {
      diff = `${interval.days} d`;
    } else if (interval.hours) {
      diff = `${interval.hours} h`;
    } else if (interval.minutes) {
      diff = `${interval.minutes} min`;
    } else if (interval.seconds) {
      diff = `${interval.seconds} s`;
    }
  }
  return diff;
}

function getDeadlineDate(deadline) {
  //console.log(projects);
  let result = new Date();
  projects.forEach(
    function(p) {
      p.summary.timeline.forEach(function(t) {
        if (t.id === deadline){
          result = new Date(t.deadline);
        }
      })
    }
  );
  return result;
}

function getMillisecondsFromDuration(duraction) {
  if (duraction) {
    const tb = { 'years': 31536000000, 'months': 2592000000, 'days': 86400000, 'hours': 3600000, 'minutes': 60000, 'seconds': 1000};
    return Object.keys(tb).reduce(
      function(acc, key){
        if (duraction[key]) {
          return acc + tb[key] * duraction[key];
        }
        return acc;
      },
      0
    );
  }
}
function formatDuration(duration) {
  return Object.keys(duration).map(
    function(key){
      if (duration[key]) {
        return `${duration[key]} ${key[0]}`;
      }
    }
  ).slice(0, 2).join(' ');
} 
function getLocalISOString(date) {
  if (date != 'n/a') {
    const offset = date.getTimezoneOffset()
    const offsetAbs = Math.abs(offset)
    const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString()
    return `${isoString.slice(0, -1)}${offset > 0 ? '-' : '+'}${String(Math.floor(offsetAbs / 60)).padStart(2, '0')}:${String(offsetAbs % 60).padStart(2, '0')}`
  }
  return date;
}

function getClosestRelease(timeline, format = ['years', 'months', 'days', 'hours']) {
  let releaseName = 'n/a';
  let releaseDate = 'n/a';
  let timeToRelease = 'n/a';
  let releaseFeatures = 'n/a';
  if (timeline.length) {
    let minDuration = Number.MAX_SAFE_INTEGER;
    const currentDateTime = new Date();
    timeline.forEach(function(t) {
      const deadline = new Date(t.deadline);
      const duration = dateFns.fp.intervalToDuration({start: currentDateTime, end: deadline});
      const ms = getMillisecondsFromDuration(duration);
      if (ms > 0 && ms < minDuration) {
        minDuration = ms;
        releaseName = t.id;
        releaseDate = deadline;
        timeToRelease = formatDuration(duration);
        //timeToRelease = dateFns.fp.formatDuration(duration, { format, delimiter: ', ', zero: false });
        releaseFeatures = t.features;
      }
    });
  }
  return {releaseName, releaseDate, timeToRelease, releaseFeatures};

};
//-----------------------------------------------------------------------------
// Toolbar
$("#dashboard-tab").click(function(){
  updateDashboard();
  updateToolbar();
});

$("#toolbar_full").click(function(){
  state.ui.dashboard.showGraph = true;
  state.ui.dashboard.showList = true;
  updateToolbar();
});
$("#toolbar_graph").click(function(){
  state.ui.dashboard.showGraph = true;
  state.ui.dashboard.showList = false;
  updateToolbar();
});
$("#toolbar_list").click(function(){
  state.ui.dashboard.showGraph = false;
  state.ui.dashboard.showList = true;
  updateToolbar();
});

function updateToolbar() {
  console.log(state);
  // update dashboard
  state.ui.dashboard.showGraph ? $('.project-graph').show() : $('.project-graph').hide();
  state.ui.dashboard.showList ? $('.project-list').show() : $('.project-list').hide();
  // update timeline
  // update team
  // update srs
}

//-----------------------------------------------------------------------------
// Dashboard
$("#dashboard-tab").click(function(){
  updateDashboard();
  updateToolbar();
});

function getProject(id, name, summary) {
  const r = { ids: { tasks: `project-${id}-tasks`, workload: `project-${id}-workload` } };
  const lut = dateFns.fp.intervalToDuration({start: new Date(summary.lastCommit), end: new Date() });
  const diff = getStringFromInterval(lut);
  const lastUpdateTime = `Updated ${diff} ago`;
  //
  const { releaseName, timeToRelease } = getClosestRelease(summary.timeline);

  // const rd = dateFns.fp.intervalToDuration({start: new Date(summary.release.date), end: new Date() });
  // console.log(rd);

  r.html = '' +
  '<div class="col pb-4 project-graph">' +
  ' <div class="card">' +
  '   <div class="card-header">' +
  `     <span class="badge float-end rounded-pill text-bg-warning">${releaseName} in ${timeToRelease}</span>` +
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
  `   <div class="card-footer">${lastUpdateTime}</div>` +
  ' </div>' +
  '</div>';
  return r;
}

function getProjectDetails(description, summary) {
  const r = {};
  // release
  const { releaseName, releaseDate, releaseFeatures } = getClosestRelease(summary.timeline);
  const ts = summary.team.reduce((acc, member) => acc + (member.bandwidth[0].fte > 0 ? 1 : 0), 0);
  const tst = summary.team.length;
  const teamSizeTitle = ts === tst ? `team size` : `team size (total)`;
  const teamSize = ts === tst ? `${ts}` : `${ts}/${tst}`;
  //
  r.html = '' +
  '<div class="col pb-4 project-list">' +
  ' <div class="px-2 pb-4">' +
  `   <h5>${description}</h5>` +
  ' </div>' +
  ' <ul class="list-group">' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">' +
  `     <span class="fst-italic">Release</span><span class="badge text-bg-secondary rounded-pill">${getLocalISOString(releaseDate)}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">name</span><span class="badge text-bg-secondary rounded-pill">${releaseName}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">features</span><span class="badge text-bg-secondary rounded-pill">${releaseFeatures}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">Workload & Bandwidth</li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">${teamSizeTitle}</span><span class="badge text-bg-secondary rounded-pill">${teamSize}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center py-0 bg-secondary-subtle fw-bold">Tasks</li>' +
  `   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">` +
  `     <span class="fst-italic">todo</span><span class="badge text-dark rounded-pill" style="background-color: ${colors.timeline.todo}">${summary.tasks.todo}</span>` +
  '   </li>' +
  `   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">` +
  `     <div class="fst-italic">dev</div><span class="badge text-white rounded-pill" style="background-color: ${colors.timeline.dev}">${summary.tasks.dev}</span>` +
  '   </li>' +
  `   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">` +
  `     <span class="fst-italic">blocked</span><span class="badge text-white rounded-pill" style="background-color: ${colors.timeline.blocked}">${summary.tasks.blocked}</span>` +
  '   </li>' +
  '   <li class="list-group-item d-flex justify-content-between align-items-center ps-4">' +
  `     <span class="fst-italic">done</span><span class="badge text-white rounded-pill" style="background-color: ${colors.timeline.done}">${summary.tasks.done}</span>` +
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
                  backgroundColor: [colors.timeline.todo, colors.timeline.dev, colors.timeline.blocked],
                  data: [p.summary.tasks.todo, p.summary.tasks.dev, p.summary.tasks.blocked]
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
                  text: p.summary.tasks.done,
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

          const numberofDays = 14;
          const base = 0.5 * (Math.random() + 1);
          const diff = (1 - base) * p.summary.totalFte;
          const worloadChart = new Chart(document.getElementById(proj.ids.workload), {
            type: 'line',
            data: {
              labels: Array(numberofDays).fill(""),
              datasets: [{ 
                  data: Array(numberofDays).fill(p.summary.totalFte),
                  label: "Total",
                  borderColor: "#3cba9f",
                  fill: false
                }, { 
                  data: Array(numberofDays).fill(0).map( (v) =>  p.summary.totalFte * base + (Math.random() * 2 * diff - diff)),
                  label: "Actual",
                  borderColor: "#3e95cd",
                  fill: false
                }
              ]
            },
            options: {
              aspectRatio: 1,
              plugins: {
                legend: {
                    display: false
                }
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true
                  }
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Value'
                  },
                  suggestedMin: 0,
                  suggestedMax: p.summary.totalFte * 1.1
                }
              }              
            }
          });
          p.charts = [tasksChart, worloadChart];
        });
        updateDashboard();
      } 
    }
  });
}

function updateDashboard() {
  if (projects) {
    projects.forEach(function(p) {
      p.charts.forEach(function(c) {
        c.update();
      });
    });
  }
}

//-----------------------------------------------------------------------------
// Timeline
let ganttChart = null;

$("#timeline-tab").click(function(){
  updateTimeline();
});

function initTimeline() {
  $.getJSON("tasks", function(res, status){
    if (res.success) {
      tasks = res.data;
      //
      ganttChart = Highcharts.ganttChart('gantt', {
        time: {
          useUTC: false
        },
        chart: {
          backgroundColor: "#F8F9FA",
        },
        // title: {
        //     text: 'Talan PM',
        //     margin: 2
        // },
        xAxis: [{
          grid: {
            enabled: true,
            borderWidth: 0,
            labels: {
              indentation: 0,
              distance: 0,
              enabled: false
            }
          }
        }],
        yAxis: [{
          grid: {
            enabled: true,
            borderWidth: 0,
            labels: {
              indentation: 0,
              distance: 0,
              enabled: false
            },
          },
          staticScale: 30
        }],
        series: [{}]
      });
      //
      updateTimeline();
    }
  });  

}

function updateTimeline() {
  let data = [];
  // console.log(Date.UTC(2024, 10, 26));
  // console.log((new Date("2024-11-26 16:00:00 UTC+0200")).getTime());
  //
  const updateInterval = function(cInterval, newInterval) {
    const result = {start: null, end: null};
    // if (cInterval.start === null) {
    //   result.start = new Date(newInterval.start);
    // } else {
    //   result.start = new Date( cInterval.start > newInterval.start ? newInterval.start : cInterval.start);
    // }
    // if (cInterval.end === null) {
    //   cInterval.end = new Date(newInterval.end);
    // } else {
    //   result.end = new Date( cInterval.end < newInterval.end ? newInterval.end : cInterval.end);
    // }
    return result;
  }
  //
  const processComponent = function(component, parentId) {
    const id = component.relativePath ? component.relativePath : component.id;
    let cInterval = {start: null, end: null};
    const cIndex = data.push({
      id: id,
      name: component.name.toUpperCase(),
      start: (new Date("2024-11-26 9:00:00 UTC+0200")).getTime(),
      end: (new Date("2024-11-28 16:00:00 UTC+0200")).getTime(),
      color: colors.timeline.component,
      parent: parentId
    });
    //
    const processTasks = function(tasks, parentId, interval) {
      let index = 0;
      const tData = []
      for (let i = tasks.length; i--; ){
        index++;
        const t = tasks[i];
      // for (const t of tasks){
        if (t.deadline) {
          //console.log(t.id, t.deadline, getDeadlineDate(t.deadline));
        }
        const tId = parentId + '/' + (t.id ? t.id : index);
        //
        let tColor = colors.timeline.group;
        if (t.tasks.length === 0) {
          tColor = ({
            '-': colors.timeline.todo,
            '>': colors.timeline.dev,
            '!': colors.timeline.blocked,
            '+': colors.timeline.done,
          })[t.status];
        }
        tData.push({
          id: tId,
          name: t.title,
          start: (new Date("2024-11-26 16:00:00 UTC+0200")).getTime(),
          end: (new Date("2024-11-27 16:00:00 UTC+0200")).getTime(),
          color: tColor,
          parent: parentId
        });
        processTasks(t.tasks, tId);
      }
      data.push( ...tData.reverse() );
    }
    cInterval = updateInterval(cInterval, processTasks(component.tasks, id));
    //
    for (const c of component.components) {
      cInterval = updateInterval(cInterval, processComponent(c, id));
    }
    //
    return cInterval;
  }
  processComponent(tasks);
  ganttChart.series[0].update({
    name: 'Project 1',
    data
  }, true);
}

//-----------------------------------------------------------------------------
// Team
$("#team-tab").click(function(){
  updateTeam();
});

function getMember(member, showZeroFte = false) {
  const emails = member.bandwidth.length > 1 ? 
    member.bandwidth.map( b => `<small>${b.email} (${b.fte})</small>`).join('<br/>')
    :
    `<small>${member.bandwidth[0].email}</small>`
  ;
  const fte = member.bandwidth.reduce((acc, b) => acc + b.fte, 0);
  if (fte || showZeroFte) {
    const total = member.summary.todo + member.summary.dev + member.summary.blocked;
  return '<tr class="p-0">' +
    ` <th scope="row">${member.id}</th>` +
    ` <td class="">${member.name}<br/>${emails}</td>` +
    ` <td class="align-middle">${fte}</td>` +
    ` <td class="align-middle">${member.summary.done}</td>` +
    ` <td class="align-middle">${member.summary.total}</td>` +
    ' <td class="align-middle">' +
    '  <div class="progress-stacked">' +
    [
      [member.summary.todo, colors.timeline.todo, 'text-dark'],
      [member.summary.dev, colors.timeline.dev, 'text-white'],
      [member.summary.blocked, colors.timeline.blocked, 'text-white'],
    ].map( t => {
      const v = t[0];
      const p = total ? 100 * v / total : 0;
      const c = t[1];
      const ct = t[2];
      return '' +
      `    <div class="progress" role="progressbar" aria-label="Segment one" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: ${p}%">` +
      `      <div class="progress-bar ${ct}" style="background-color: ${c}">${v}</div>` +
      '    </div>';
    }).join('\n') +
    '  </div>' +
    ' </td>' +
    '</tr>';
  }
  return '';
}

function initTeam() {
  $.getJSON("team", function(res, status){
    if (res.success) {
      team = res.data.team;
      updateTeam();
    }
  });  
}

function updateTeam() {
  var header = $('#dashboard_team_list_header');
  header.empty();
  header.append(
    [
      ['todo', 'text-dark'],
      ['dev', 'text-white'],
      ['blocked', 'text-white'],
    ].map(function(s){
      return `<span class="badge ${s[1]} rounded-pill" style="background-color: ${colors.timeline[s[0]]}">${s[0]}</span>`;
    }).join(' ')
  );
  //
  var list = $('#dashboard_team_list');
  list.empty();
  team.forEach(function(m){
    list.append(getMember(m));
  });
}

//-----------------------------------------------------------------------------
// SRS
$("#srs-tab").click(function(){
  updateSrs();
});

var md = null;

function getSrs(item, id ='srs') {
  const cid = `${id}-${item.id}`;
  let r = '';
  const srsKeys = Object.keys(item.srs);
  if (srsKeys.length || item.components.length) {
    r += '' +
      '<li class="my-2">' +
      ` <button type="button" class="btn d-inline-flex align-items-center border-0" data-bs-toggle="collapse" aria-expanded="true" data-bs-target="#${cid}" aria-controls="${cid}">${item.id}</button>` +
      ` <ul class="list-unstyled ps-3 collapse show" id="${cid}" style="">`
      ;
    if (srsKeys.length) {
      r += '' +
       '<li class="my-2">' +
        ' <ul class="list-unstyled ps-0 collapse show" style="">' +
        srsKeys.map(function(v) {
          const tid = `${cid}-${v}`;
          topics[tid] = item.srs[v];
          return `<li><a class="d-inline-flex align-items-center rounded text-decoration-none srs-topic" id="${tid}" href="#">${v}</a></li>`;
        }).join('') +
        ' </ul>' +
        '</li>'
      ;
    }
    if (item.components.length) {
      r += '' +
        item.components.map(function(v) {
          return getSrs(v, cid);
        }).join('')
      ;
    }
    r += '' +
      ' </ul>' +
      '</li>'
    ;
  }
  return r;
}

function initSrs() {
  md = window.markdownit({
    breaks: true,
  });
  $.getJSON("srs", function(res, status){
    if (res.success) {
      srs = res.data.srs;
      var toc = $('#srs-toc');
      if (srs) {
        toc.empty();
        toc.append(getSrs(srs));
      }
      //
      var mdPane = $('#srs-content');
      $(".srs-topic").on("click", function() {
        const id = $(this).attr("id");
        mdPane.empty();
        mdPane.append(md.render(topics[id]));
      });      
    }
  });  
}

function updateSrs() {
}
