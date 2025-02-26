import { Box } from "@mui/material";

const Utilization = ({ fte }) => {
  // Generate the CSS linear-gradient string dynamically
  const gradientStyle = `linear-gradient(90deg, ${fte.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`;
  return (
    <Box
      sx={{
        width: "100%",
        height: "24px",
        background: gradientStyle,
        transition: "background 0.3s ease-in-out",
      }}
    />
  );
};

export default Utilization;