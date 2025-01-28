import * as React from 'react';
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

import StateContext from '../StateContext';


const columns = [
  { id: 'id', label: 'ID', minWidth: 96 },
  { id: 'name', label: 'Name/email', minWidth: 128 },
  { id: 'fte', label: 'FTE', minWidth: 32, align: 'right' },
  { id: 'done', label: 'Done', minWidth: 32, align: 'right' },
  { id: 'total', label: 'Total', minWidth: 32, align: 'right' },
  { id: 'status', label: 'Status (todo/dev/blocked)', minWidth: 220, align: 'center'},
];

function Team() {
  const { config } = React.useContext(StateContext);
  const theme = useTheme();
  const [showZeroFte, setShowZeroFte] = React.useState(false);
  const [, setTeam] = React.useState('');
  const [rows, setRows] = React.useState([]);
  //
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/teams`);
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        setTeam(data.data);
        setRows(data.data.team.map((m, index) => {
          const fte = m.bandwidth.reduce((acc, b) => acc + b.fte, 0.0);
          // const name = m.name;
          const total = m.summary.todo + m.summary.dev + m.summary.blocked;
          const persents = [m.summary.todo, m.summary.dev, m.summary.blocked].map((b) => {
            return total > 0 ? Math.round(100*b/total) + '%' : '0%';
          });
          return ({
            id: m.id,
            name: (
              <div key={index}>{m.name}<br/>{
                m.bandwidth.length > 1 ? m.bandwidth.map((b, bi) => (<div key={"bw"+index + '-' + bi}>{b.email} ({b.fte})<br/></div>)) : m.bandwidth[0].email
              }</div>
            ),
            fte,
            done: m.summary.done,
            total: m.summary.total,
            status: (
              <Box sx={{display: 'flex', flexDirection: 'row', color: 'white', backgroundColor: 'black', borderRadius: 4, overflow: 'hidden'}}> 
                <Box sx={{width: persents[0], backgroundColor: theme.tasks.todo.backgroundColor, color: theme.tasks.todo.color}}>{m.summary.todo}</Box>
                <Box sx={{width: persents[1], backgroundColor: theme.tasks.dev.backgroundColor, color: theme.tasks.dev.color}}>{m.summary.dev}</Box>
                <Box sx={{width: persents[2], backgroundColor: theme.tasks.blocked.backgroundColor, color: theme.tasks.blocked.color}}>{m.summary.blocked}</Box>
              </Box>
            )
          });
        }));
        // setLoading(false);
      } catch (error) {
        // setError(error.message);
        // setLoading(false);
      }
    };
    fetchData();
  }, [config.apiBaseUrl, theme]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
