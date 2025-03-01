import { Box } from "@mui/material";

const Utilization = ({ fte, width, height }) => {
  const w = width || '100%';
  const h = height || '20px';

  // Generate the CSS linear-gradient string dynamically
  const gradientStyle = `linear-gradient(90deg, ${fte.map((stop) => `${stop.color} ${stop.position}%`).join(", ")})`;
  return (
    <Box
      sx={{
        width: w,
        height: h,
        borderRadius: 4,
        background: gradientStyle,
        transition: "background 0.3s ease-in-out",
      }}
    />
  );
};

export default Utilization;