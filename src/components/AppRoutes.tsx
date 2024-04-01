import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "./user/Login";
import Dashboard from "./Dashboard";
import ProjectsOwnerList from "./projects/OwnerList";

const AppRoutes = () => {

    return (
        <Router>
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<Home />}></Route>
                <Route path="/login" element={<Login />}></Route>
                {/* Private Access */}
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/my-owner-projects" element={<ProjectsOwnerList />}></Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;