import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Others
import { InvolvementTypeEnum } from '../models/InvolvementData';
// Views
import UserFormLogin from "../pages/user/UserFormLogin";
import ProjectOwnerList from "../pages/projects/ProjectOwnerList";
import UserFormRegister from "../pages/user/UserFormRegister";
import ProjectPageView from "../pages/projects/ProjectPageView";
import InvolvementOwnerList from "../pages/involvement/InvolvementOwnerList";
import ProjectPublicList from "../pages/projects/ProjectPublicList";
import TemplateForm from "../pages/templates/TemplateForm";
import TemplateList from "../pages/templates/TemplateList";
import TestCaseProjectOwnerList from "../pages/testCase/TestCaseOwnerList";
import TestCaseForm from "../pages/testCase/TestCaseForm";
import ProjectTesterList from "../pages/projects/ProjectTesterList";
import TestCaseProjectTesterList from "../pages/testCase/TestCaseTesterList";
import TestExecutionForm from "../pages/testExecution/TestExecutionForm";
import TestExecutionList from "../pages/testExecution/TestExecutionList";
import UserFormProfileEdit from "../pages/user/UserFormProfileEdit";
import DeviceUserView from "../pages/devices/DeviceUserView";
import HabilityUserView from "../pages/habilities/HabilityUserView";
import UserFormProfileView from "../pages/user/UserFormProfileView";
import EnvironmentList from "../pages/environment/EnvironmentList";
import ReportList from "../pages/reports/ReportList";
import InvolvementPendingView from "../pages/involvement/InvolvementPendingView";
import InvolvementInvitationsView from "../pages/involvement/InvolvementInvitationsView";
import InvolvementRequestsView from "../pages/involvement/InvolvementRequestsView";
import TagList from "../pages/tags/TagList";
import TagForm from "../pages/tags/TagForm";
import TestScenarioList from "../pages/testScenario/TestScenarioList";
import TestScenarioForm from "../pages/testScenario/TestScenarioForm";
import ProjectOverView from "../pages/projects/ProjectOverView";
import { useTranslation } from "react-i18next";

const AppRoutes = () => {
    const { t } = useTranslation();

    return (
        <Router>
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<UserFormLogin />}></Route>
                <Route path="/login" element={<UserFormLogin />}></Route>
                <Route path="/register" element={<UserFormRegister />}></Route>
                {/* Private Access */}
                {/* Manager */}
                <Route path="/my-owner-projects" element={<ProjectOwnerList />}></Route>
                <Route path="/project/detail/:projectId" element={<ProjectPageView />}></Route>
                <Route path="/project/testers/:projectId" element={<InvolvementOwnerList title={t("projects.testersLabel")} type={InvolvementTypeEnum.Tester} />}></Route>
                <Route path="/project/managers/:projectId" element={<InvolvementOwnerList title={t("projects.managersLabel")} type={InvolvementTypeEnum.Manager} />}></Route>
                <Route path="/project/overview/:projectId" element={<ProjectOverView />}></Route>
                <Route path="/project/templates/:projectId" element={<TemplateList />}></Route>
                <Route path="/project/templates/:projectId/add" element={<TemplateForm />}></Route>
                <Route path="/project/templates/:projectId/copy/:templateIdCopy" element={<TemplateForm />}></Route>
                <Route path="/project/templates/:projectId/view/:templateIdCopy" element={<TemplateForm />}></Route>
                <Route path="/project/test-scenarios/:projectId" element={<TestScenarioList />}></Route>
                <Route path="/project/test-cases/:projectId" element={<TestCaseProjectOwnerList />}></Route>
                <Route path="/project/environments/:projectId" element={<EnvironmentList />}></Route>
                <Route path="/project/tags/:projectId" element={<TagList />}></Route>
                <Route path="/project/tags/:projectId/add" element={<TagForm />}></Route>
                <Route path="/project/tags/:projectId/view/:tagId" element={<TagForm />}></Route>
                <Route path="/project/tags/:projectId/edit/:tagId" element={<TagForm />}></Route>
                <Route path="/test-case/:projectId/add" element={<TestCaseForm />}></Route>
                <Route path="/test-case/:testCaseId/edit" element={<TestCaseForm />}></Route>
                <Route path="/test-case/:testCaseId/view" element={<TestCaseForm />}></Route>
                <Route path="/test-scenario/:projectId/add" element={<TestScenarioForm />}></Route>
                <Route path="/test-scenario/:testScenarioId/edit" element={<TestScenarioForm />}></Route>
                <Route path="/test-scenario/:testScenarioId/view" element={<TestScenarioForm />}></Route>
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
                <Route path="/involvements" element={<InvolvementInvitationsView />}></Route>
                <Route path="/involvements/invitations" element={<InvolvementInvitationsView />}></Route>
                <Route path="/involvements/requests" element={<InvolvementRequestsView />}></Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;
