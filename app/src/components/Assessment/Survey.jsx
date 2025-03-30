import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NearbyErrorIcon from '@mui/icons-material/NearbyError';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { useTheme } from '@mui/material/styles';

import Stages from './Stages';
import NFRs from './NFRs';
import Status from './Status';
import NoData from "../shared/NoData";


const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -8,
    top: 0,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    backgroundColor: 'lightgray',
    color: 'black',
  },
}));

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(14),
    border: '1px solid #dadde9',
  },
}));

function Survey() {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>NFRs/Subs</TableCell>
            <TableCell></TableCell>
            {Object.keys(Stages).map(
              (stage, i) => 
                <TableCell key={i} sx={{textAlign: 'center'}}>
                  {/*<HtmlTooltip title={<>{Stages[stage].desc}</>}>
                    <StyledBadge badgeContent={'?'} color="primary">*/}
                      {Stages[stage].name}
                    {/*</StyledBadge>
                  </HtmlTooltip>*/}
                </TableCell>
              )
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(NFRs).map(
            (nfr, i) => Object.keys(NFRs[nfr].subs).map(
              (sub, j) => 
                <TableRow key={100 * i + j} sx={{backgroundColor: i % 2 === 0 ? '#F0F0F0' : 'transparent' }}>
                  { j == 0 && 
                    <TableCell rowSpan={Object.keys(NFRs[nfr].subs).length} align="center" >
                      <HtmlTooltip title={<>{NFRs[nfr].desc}</>}>
                        <StyledBadge badgeContent={'?'} color="primary">
                          {NFRs[nfr].name}
                        </StyledBadge>
                      </HtmlTooltip>
                    </TableCell>
                  }
                  <TableCell>
                    <HtmlTooltip title={<>{NFRs[nfr].subs[sub].desc}</>}>
                      <StyledBadge badgeContent={'?'} color="primary">
                        {NFRs[nfr].subs[sub].name}
                      </StyledBadge>
                    </HtmlTooltip>
                  </TableCell>
                  {Object.keys(Stages).map(
                    (stage, k) => 
                      <TableCell key={k} sx={{p: 0}}>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                          <Button
                            id="basic-button"
                            aria-controls={open ? 'basic-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick}
                            >
                            { NFRs[nfr].subs[sub].stages[stage].requireents.length > 0 && <Status status={NFRs[nfr].subs[sub].stages[stage].requireents[0]}/> }
                         </Button>
                        </Box>
                      </TableCell>
                  )}
                </TableRow>
              )
            )
          }
        </TableBody>
      </Table>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
      <MenuList>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" sx={{ color: theme.rag.green.backgroundColor }}/>
          </ListItemIcon>
          <ListItemText>Fully Compliant</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <ErrorOutlineIcon fontSize="small" sx={{ color: theme.rag.amber.backgroundColor }}/>
          </ListItemIcon>
          <ListItemText>Partially Compliant</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <NearbyErrorIcon fontSize="small" sx={{ color: theme.rag.red.backgroundColor }}/>
          </ListItemIcon>
          <ListItemText>Critical Alert</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <NotInterestedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Not applicable</ListItemText>
        </MenuItem>
      </MenuList>
      </Menu>
    </TableContainer>
  );
}

export default Survey;
