import { use, useState } from 'react';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';

import Context from './../../shared/Context';
import Status from './../shared/Status';

const columns = [
  { id: 'id', label: 'ID', minWidth: 96 },
  { id: 'name', label: 'Name/email', minWidth: 128 },
  { id: 'fte', label: 'FTE', minWidth: 32, align: 'right' },
  { id: 'done', label: 'Done', minWidth: 32, align: 'right' },
  { id: 'total', label: 'Total', minWidth: 32, align: 'right' },
  { id: 'status', label: 'Status (todo/dev/blocked)', minWidth: 220, align: 'center'},
];

function Team() {
  const team = use(Context).context.team;
  console.log('Team', team);

  const theme = useTheme();

  const [showZeroFte, setShowZeroFte] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const rows = team.map((m, index) => {
    const fte = 1;//m.bandwidth.reduce((acc, b) => acc + b.fte, 0.0);
    // const name = m.name;
    const total = m.status.todo + m.status.dev + m.status.blocked;
    //
    const status = [
      { id: 'todo', value: m.status.todo, percents: '0%', color: theme.tasks.todo.color, backgroundColor: theme.tasks.todo.backgroundColor},
      { id: 'dev', value: m.status.dev, percents: '0%', color: theme.tasks.dev.color, backgroundColor: theme.tasks.dev.backgroundColor},
      { id: 'blocked', value: m.status.blocked, percents: '0%', color: theme.tasks.blocked.color, backgroundColor: theme.tasks.blocked.backgroundColor},
    ].map((s) => ({ ...s, percents: total > 0 ? Math.round(100*s.value/total) + '%' : '0%' }));
  
    return ({
      id: m.id,
      name: (
        <div key={index}>{m.name}<br/>{
          m.bandwidth.length > 1 ? m.bandwidth.map((b, bi) => (<div key={"bw"+index + '-' + bi}>{b.project} ({b.email})<br/></div>)) : m.bandwidth[0].email
        }</div>
      ),
      fte,
      done: m.status.done,
      total: m.status.total,
      status: (<Status status={status} />)
    });
  });
  //
  // console.log('!Team');
  return (
    <Container maxWidth="xl" sx={{pt: 2}}>
      <Box sx={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: 'lightgrey1'}}>
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            <FormControlLabel
              value="end"
              control={<Switch checked={showZeroFte} size="small" color="primary" onChange={(event)=> setShowZeroFte(event.target.checked)} />}
              label={<Box component="div" fontSize={14}>Show 0 fte</Box>}
              labelPlacement="end"
            />
          </FormGroup>
        </FormControl>
      </Box>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 1024 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .filter((row) => (row.fte > 0) || showZeroFte)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={rows.filter((row) => (row.fte > 0) || showZeroFte).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}

export default Team;