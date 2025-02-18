import { createTheme } from '@mui/material/styles';
import { grey, blue } from '@mui/material/colors';

/*
0: #5470c6
1: #91cc75
2: #fac858
3: #ee6666
4: #73c0de
5: #3ba272
6: #fc8452
7: #9a60b4
8: #ea7ccc
*/

const theme = createTheme({
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: {
      main: blue[500],
    },
  },
  tasks: {
    todo: {
      backgroundColor: '#fac858',
      color: 'black',
    },
    dev: {
      backgroundColor: '#5470c6',
      color: 'white',
    },
    blocked: {
      backgroundColor: '#ee6666',
      color: 'black',
    },
    done: {
      backgroundColor: '#28A745',
      color: 'black',
    },
  },
  error: {
    backgroundColor: '#ee6666',
    color: 'black',
  },
});

export { theme };
