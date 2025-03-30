import React from 'react';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NearbyErrorIcon from '@mui/icons-material/NearbyError';
import { useTheme } from '@mui/material/styles';

function Status(props) {
  const [status] = React.useState(props.status || '');
  const theme = useTheme();
  return (
    <>
      { status === 'green' && <CheckCircleIcon fontSize="small" sx={{ color: theme.rag.green.backgroundColor }}/> }
      { status === 'amber' && <ErrorOutlineIcon fontSize="small" sx={{ color: theme.rag.amber.backgroundColor }}/> }
      { status === 'red' && <NearbyErrorIcon fontSize="small" sx={{ color: theme.rag.red.backgroundColor }}/> }
      { status === 'skip' && <NotInterestedIcon fontSize="small" /> }
      { status === '' && <RadioButtonUncheckedIcon fontSize="small"/> }
    </>
  );
}

export default Status;

