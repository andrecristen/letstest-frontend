import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Views
import Login from "./user/Login";
import Dashboard from "./Dashboard";
import ProjectsOwnerList from "./projects/OwnerList";
import Register from "./user/Register";
import ProjectsDetailView from "./projects/DetailView";
import InvolvementManagementList from "./involvement/ManagementList";
import ProjectsPublicList from "./projects/PublicList";
import TemplateEditor from "./templates/TemplateEditor";
import TemplateManagementList from "./templates/ManagementList";
import TestCaseProjectOwnerList from "./testCase/OwnerList";
// Others
import { InvolvementTypeEnum } from '../types/InvolvementData';
import TestCaseForm from "./testCase/Form";
import ProjectsTestList from "./projects/TestList";
import TestCaseProjectTestList from "./testCase/TestList";
import TestExecutionForm from "./testExecution/Form";
import TestExecutionTestCaseOwnerList from "./testExecution/OwnerList";
import ProfileEdit from "./user/ProfileEdit";
import DeviceUser from "./devices/DeviceUser";
import HabilityUser from "./habilities/HabilityUser";

const AppRoutes = () => {

    return (
        <Router>
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<Login />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={<Register />}></Route>
                {/* Private Access */}
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/my-owner-projects" element={<ProjectsOwnerList />}></Route>
                <Route path="/my-test-projects" element={<ProjectsTestList />}></Route>
                <Route path="/project/detail/:projectId" element={<ProjectsDetailView />}></Route>
                <Route path="/project/testers/:projectId" element={<InvolvementManagementList title="Testadores" type={InvolvementTypeEnum.Testador} />}></Route>
                <Route path="/project/managers/:projectId" element={<InvolvementManagementList title="Gerentes" type={InvolvementTypeEnum.Gerente} />}></Route>
                <Route path="/project/templates/:projectId" element={<TemplateManagementList />}></Route>
                <Route path="/project/templates/:projectId/add" element={<TemplateEditor />}></Route>
                <Route path="/project/templates/:projectId/copy/:templateIdCopy" element={<TemplateEditor />}></Route>
                <Route path="/project/templates/:projectId/view/:templateIdCopy" element={<TemplateEditor />}></Route>
                <Route path="/project/test-cases/:projectId" element={<TestCaseProjectOwnerList />}></Route>
                <Route path="/project/test/:projectId" element={<TestCaseProjectTestList />}></Route>
                <Route path="/test-case/:projectId/add" element={<TestCaseForm />}></Route>
                <Route path="/test-case/:testCaseId/edit" element={<TestCaseForm />}></Route>
                <Route path="/test-case/:testCaseId/view" element={<TestCaseForm />}></Route>
                <Route path="/find-new-projects" element={<ProjectsPublicList />}></Route>
                <Route path="/test-executions/test/:projectId/:testCaseId" element={<TestExecutionForm />}></Route>
                <Route path="/test-executions/:testCaseId" element={<TestExecutionTestCaseOwnerList />}></Route>
                <Route path="/profile" element={<ProfileEdit />}></Route>
                <Route path="/profile/:id" element={<ProfileEdit />}></Route>
                <Route path="/devices" element={<DeviceUser />}></Route>
                <Route path="/habilities" element={<HabilityUser />}></Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;