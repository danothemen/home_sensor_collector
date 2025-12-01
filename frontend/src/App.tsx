import { Box, AppBar, Toolbar, Button } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WaterTempChart from "./components/WaterTempChart";
import FishCam from "./components/FishCam";

function App() {
  return (
    <Router>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" component={Link} to="/">
              Water Temperature
            </Button>
            <Button color="inherit" component={Link} to="/fish">
              Fish Cam
            </Button>
          </Toolbar>
        </AppBar>
        <Box p={3}>
          <Routes>
            <Route path="/" element={<WaterTempChart />} />
            <Route path="/fish" element={<FishCam />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
