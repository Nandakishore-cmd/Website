import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Humanizer from './pages/Humanizer';
import Detector from './pages/Detector';
import AgentDashboard from './pages/AgentDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/humanizer" element={<Humanizer />} />
          <Route path="/detector" element={<Detector />} />
          <Route path="/agents" element={<AgentDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
