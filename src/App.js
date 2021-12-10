import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Predict from './components/Predict';

import './App.css';

const App = () => {
    return (
        <Router>
            <Routes>
              <Route exact path="/" element={ <Predict /> } /> 
            </Routes>
        </Router>
    )
}

export default App;