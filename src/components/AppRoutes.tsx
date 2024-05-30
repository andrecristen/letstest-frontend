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
import TestExecutionForm from "./testExecution/TestExecutionForm";
import TestExecutionList from "./testExecution/TestExecutionList";
import ProfileEdit from "./user/ProfileEdit";
import DeviceUser from "./devices/DeviceUser";
import HabilityUser from "./habilities/HabilityUser";
import ProfileView from "./user/ProfileView";
import EnvironmentList from "./environment/EnvironmentList";
import ReportList from "./reports/ReportList";

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
                {/* Manager */}
                <Route path="/my-owner-projects" element={<ProjectsOwnerList />}></Route>
                <Route path="/project/detail/:projectId" element={<ProjectsDetailView />}></Route>
                <Route path="/project/testers/:projectId" element={<InvolvementManagementList title="Testadores" type={InvolvementTypeEnum.Testador} />}></Route>
                <Route path="/project/managers/:projectId" element={<InvolvementManagementList title="Gerentes" type={InvolvementTypeEnum.Gerente} />}></Route>
                <Route path="/project/templates/:projectId" element={<TemplateManagementList />}></Route>
                <Route path="/project/templates/:projectId/add" element={<TemplateEditor />}></Route>
                <Route path="/project/templates/:projectId/copy/:templateIdCopy" element={<TemplateEditor />}></Route>
                <Route path="/project/templates/:projectId/view/:templateIdCopy" element={<TemplateEditor />}></Route>
                <Route path="/project/test-cases/:projectId" element={<TestCaseProjectOwnerList />}></Route>
                <Route path="/project/environments/:projectId" element={<EnvironmentList />}></Route>
                <Route path="/test-case/:projectId/add" element={<TestCaseForm />}></Route>
                <Route path="/test-case/:testCaseId/edit" element={<TestCaseForm />}></Route>
                <Route path="/test-case/:testCaseId/view" element={<TestCaseForm />}></Route>
                <Route path="/test-executions/:testCaseId" element={<TestExecutionList />}></Route>
                {/* Tester */}
                <Route path="/my-test-projects" element={<ProjectsTestList />}></Route>
                <Route path="/project/test/:projectId" element={<TestCaseProjectTestList />}></Route>
                <Route path="/test-executions/test/:projectId/:testCaseId" element={<TestExecutionForm />}></Route>
                <Route path="/test-executions/:testCaseId/my" element={<TestExecutionList />}></Route>
                {/* Shared */}
                <Route path="/find-new-projects" element={<ProjectsPublicList />}></Route>
                <Route path="/profile" element={<ProfileEdit />}></Route>
                <Route path="/profile/:userId" element={<ProfileView />}></Route>
                <Route path="/devices" element={<DeviceUser />}></Route>
                <Route path="/habilities" element={<HabilityUser />}></Route>
                <Route path="/reports/test-execution/:testExecutionId" element={<ReportList />}></Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;