import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Others
import { InvolvementTypeEnum } from '../types/InvolvementData';
// Views
import UserFormLogin from "./user/UserFormLogin";
import Dashboard from "./Dashboard";
import ProjectOwnerList from "./projects/ProjectOwnerList";
import UserFormRegister from "./user/UserFormRegister";
import ProjectPageView from "./projects/ProjectPageView";
import InvolvementList from "./involvement/InvolvementList";
import ProjectPublicList from "./projects/ProjectPublicList";
import TemplateEditor from "./templates/TemplateEditor";
import TemplateManagementList from "./templates/ManagementList";
import TestCaseProjectOwnerList from "./testCase/TestCaseOwnerList";
import TestCaseForm from "./testCase/TestCaseForm";
import ProjectTesterList from "./projects/ProjectTesterList";
import TestCaseProjectTesterList from "./testCase/TestCaseTesterList";
import TestExecutionForm from "./testExecution/TestExecutionForm";
import TestExecutionList from "./testExecution/TestExecutionList";
import UserFormProfileEdit from "./user/UserFormProfileEdit";
import DeviceUserView from "./devices/DeviceUserView";
import HabilityUserView from "./habilities/HabilityUserView";
import UserFormProfileView from "./user/UserFormProfileView";
import EnvironmentList from "./environment/EnvironmentList";
import ReportList from "./reports/ReportList";

const AppRoutes = () => {

    return (
        <Router>
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<UserFormLogin />}></Route>
                <Route path="/login" element={<UserFormLogin />}></Route>
                <Route path="/register" element={<UserFormRegister />}></Route>
                {/* Private Access */}
                <Route path="/dashboard" element={<Dashboard />}></Route>
                {/* Manager */}
                <Route path="/my-owner-projects" element={<ProjectOwnerList />}></Route>
                <Route path="/project/detail/:projectId" element={<ProjectPageView />}></Route>
                <Route path="/project/testers/:projectId" element={<InvolvementList title="Testadores" type={InvolvementTypeEnum.Testador} />}></Route>
                <Route path="/project/managers/:projectId" element={<InvolvementList title="Gerentes" type={InvolvementTypeEnum.Gerente} />}></Route>
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
                <Route path="/my-test-projects" element={<ProjectTesterList />}></Route>
                <Route path="/project/test/:projectId" element={<TestCaseProjectTesterList />}></Route>
                <Route path="/test-executions/test/:projectId/:testCaseId" element={<TestExecutionForm />}></Route>
                <Route path="/test-executions/:testCaseId/my" element={<TestExecutionList />}></Route>
                {/* Shared */}
                <Route path="/find-new-projects" element={<ProjectPublicList />}></Route>
                <Route path="/profile" element={<UserFormProfileEdit />}></Route>
                <Route path="/profile/:userId" element={<UserFormProfileView />}></Route>
                <Route path="/devices" element={<DeviceUserView />}></Route>
                <Route path="/habilities" element={<HabilityUserView />}></Route>
                <Route path="/reports/test-execution/:testExecutionId" element={<ReportList />}></Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;