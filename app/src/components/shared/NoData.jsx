import { Typography, Container } from "@mui/material";
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';      

function NoData({ details }) {
  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
        textAlign: "center",
      }}
    >
      <CancelPresentationIcon sx={{ fontSize: 32, color: "primary.main", mb: 2 }} />
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        No data available
      </Typography>
      {details && (
        <Typography variant="h7" color="text.secondary">
          {details}
        </Typography>
      )}
    </Container>
  );
}
export default NoData;