import { Typography, Container } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";

function UnderConstruction() {
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
      <BuildIcon sx={{ fontSize: 32, color: "primary.main", mb: 2 }} />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Under Construction
      </Typography>
      <Typography variant="h7" color="text.secondary" mb={3}>
        We&apos;re working on something great. Stay tuned!
      </Typography>
    </Container>
  );
}
export default UnderConstruction;