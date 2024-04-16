import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "./user/Login";
import Dashboard from "./Dashboard";
import ProjectsOwnerList from "./projects/OwnerList";
import Register from "./user/Register";
import ProjectsDetailView from "./projects/DetailView";
import { InvolvementManagementList } from "./involvement/ManagementList";
import { InvolvementTypeEnum } from '../types/InvolvementData';

const AppRoutes = () => {

    return (
        <Router>
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<Home />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={<Register />}></Route>
                {/* Private Access */}
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/my-owner-projects" element={<ProjectsOwnerList />}></Route>
                <Route path="/project/detail/:projectId" element={<ProjectsDetailView />}></Route>
                <Route path="/project/testers/:projectId" element={<InvolvementManagementList title="Testadores" type={InvolvementTypeEnum.Testador}/>}></Route>
                <Route path="/project/managers/:projectId" element={<InvolvementManagementList title="Gerentes" type={InvolvementTypeEnum.Gerente}/>}></Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;