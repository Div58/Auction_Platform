import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SideDrawer from './Layout/SideDrawer';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <Router>
      <SideDrawer />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <ToastContainer position="top-right" />
    </Router>
  );
};
export default App;