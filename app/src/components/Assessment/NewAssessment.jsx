import { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function NewAssessment({addDisabled}) {
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [description, setDescription] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreate = () => {
    console.log('Create clicked', selectedTags, description);
    // Handle create logic here
    handleClose();
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', pr: 0.5}}>
        <Fab size="small" color="secondary"  onClick={handleOpen} disabled={addDisabled}>
          <AddIcon />
        </Fab>
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6">New Assessment</Typography>

          <TextField
            disabled
            label="Assessment date"
            value={new Date().toLocaleDateString()}
          />

          <TextField
            disabled
            label="Assessor"
            value='vlad.k (Vlad K)'
          />

          <TextField
            label="Comments"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default NewAssessment;