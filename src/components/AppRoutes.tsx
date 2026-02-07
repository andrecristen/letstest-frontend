import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Others
import { InvolvementTypeEnum } from '../models/InvolvementData';
// Views
import UserFormLogin from "../pages/user/UserFormLogin";
import ProjectOwnerList from "../pages/projects/ProjectOwnerList";
import UserFormRegister from "../pages/user/UserFormRegister";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ProjectPageView from "../pages/projects/ProjectPageView";
import InvolvementOwnerList from "../pages/involvement/InvolvementOwnerList";
import TemplateForm from "../pages/templates/TemplateForm";
import TemplateList from "../pages/templates/TemplateList";
import TestCaseProjectOwnerList from "../pages/testCase/TestCaseOwnerList";
import TestCaseForm from "../pages/testCase/TestCaseForm";
import ProjectTesterList from "../pages/projects/ProjectTesterList";
import TestCaseProjectTesterList from "../pages/testCase/TestCaseTesterList";
import TestExecutionForm from "../pages/testExecution/TestExecutionForm";
import TestExecutionList from "../pages/testExecution/TestExecutionList";
import TestExecutionSession from "../pages/testExecution/TestExecutionSession";
import UserFormProfileEdit from "../pages/user/UserFormProfileEdit";
import DeviceUserView from "../pages/devices/DeviceUserView";
import HabilityUserView from "../pages/habilities/HabilityUserView";
import UserFormProfileView from "../pages/user/UserFormProfileView";
import EnvironmentList from "../pages/environment/EnvironmentList";
import ReportList from "../pages/reports/ReportList";
import TagList from "../pages/tags/TagList";
import TagForm from "../pages/tags/TagForm";
import TestScenarioList from "../pages/testScenario/TestScenarioList";
import TestScenarioForm from "../pages/testScenario/TestScenarioForm";
import ProjectOverView from "../pages/projects/ProjectOverView";
import ProjectDashboard from "../pages/dashboard/ProjectDashboard";
import ProjectNotificationSettings from "../pages/notifications/ProjectNotificationSettings";
import NotificationList from "../pages/notifications/NotificationList";
import OrganizationSettings from "../pages/organization/OrganizationSettings";
import OrganizationMembers from "../pages/organization/OrganizationMembers";
import MyInvites from "../pages/organization/MyInvites";
import OrganizationList from "../pages/organization/OrganizationList";
import ApiKeyManagement from "../pages/organization/ApiKeyManagement";
import WebhookManagement from "../pages/organization/WebhookManagement";
import BillingOverview from "../pages/billing/BillingOverview";
import PlanSelection from "../pages/billing/PlanSelection";
import BillingSuccess from "../pages/billing/BillingSuccess";
import BillingPlanManagement from "../pages/admin/BillingPlanManagement";
import SubscriptionManagement from "../pages/admin/SubscriptionManagement";
import OnboardingOrgSetup from "../pages/onboarding/OnboardingOrgSetup";
import OnboardingInviteTeam from "../pages/onboarding/OnboardingInviteTeam";
import OnboardingFirstProject from "../pages/onboarding/OnboardingFirstProject";
import UpgradeModal from "./UpgradeModal";
import { OrganizationProvider, useOrganization } from "../contexts/OrganizationContext";
import { ConfigProvider } from "../contexts/ConfigContext";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { PageLoadingProvider } from "../contexts/PageLoadingContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import PageLoadingOverlay from "./PageLoadingOverlay";
import ConfirmOverlay from "./ConfirmOverlay";
import tokenProvider from "../infra/tokenProvider";

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const accessLevel = tokenProvider.getAccessLevel();
    if (!accessLevel || accessLevel < 99) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

const BillingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isOwner } = useOrganization();
    if (!isOwner) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

const AppRoutes = () => {
    const { t } = useTranslation();

    return (
        <ThemeProvider>
        <ConfigProvider>
        <OrganizationProvider>
        <PageLoadingProvider>
        <UpgradeModal />
        <PageLoadingOverlay />
        <ConfirmOverlay />
        <Router>
            <Routes>
                {/* Public Access */}
                <Route path="/" element={<UserFormLogin />}></Route>
                <Route path="/login" element={<UserFormLogin />}></Route>
                <Route path="/register" element={<UserFormRegister />}></Route>
                <Route path="/forgot-password" element={<ForgotPassword />}></Route>
                <Route path="/reset-password" element={<ResetPassword />}></Route>
                <Route path="/onboarding/org-setup" element={<OnboardingOrgSetup />}></Route>
                <Route path="/onboarding/invite-team" element={<OnboardingInviteTeam />}></Route>
                <Route path="/onboarding/first-project" element={<OnboardingFirstProject />}></Route>
                {/* Private Access */}
                {/* Manager */}
                <Route path="/dashboard" element={<ProjectDashboard />}></Route>
                <Route path="/my-owner-projects" element={<ProjectOwnerList />}></Route>
                <Route path="/project/detail/:projectId" element={<ProjectPageView />}></Route>
                <Route path="/project/testers/:projectId" element={<InvolvementOwnerList title={t("projects.testersLabel")} type={InvolvementTypeEnum.Tester} />}></Route>
                <Route path="/project/managers/:projectId" element={<InvolvementOwnerList title={t("projects.managersLabel")} type={InvolvementTypeEnum.Manager} />}></Route>
                <Route path="/project/overview/:projectId" element={<ProjectOverView />}></Route>
                <Route path="/project/notifications/:projectId" element={<ProjectNotificationSettings />}></Route>
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
                <Route path="/test-executions/session/:projectId/:testCaseId" element={<TestExecutionSession />}></Route>
                <Route path="/test-executions/test/:projectId/:testCaseId" element={<TestExecutionForm />}></Route>
                <Route path="/test-executions/:testCaseId/my" element={<TestExecutionList />}></Route>
                {/* Shared */}
                <Route path="/profile" element={<UserFormProfileEdit />}></Route>
                <Route path="/profile/:userId" element={<UserFormProfileView />}></Route>
                <Route path="/devices" element={<DeviceUserView />}></Route>
                <Route path="/habilities" element={<HabilityUserView />}></Route>
                <Route path="/notifications" element={<NotificationList />}></Route>
                <Route path="/reports/test-execution/:testExecutionId" element={<ReportList />}></Route>
                {/* Organization */}
                <Route path="/my-organizations" element={<OrganizationList />}></Route>
                <Route path="/organization/settings" element={<OrganizationSettings />}></Route>
                <Route path="/organization/members" element={<OrganizationMembers />}></Route>
                <Route path="/my-invites" element={<MyInvites />}></Route>
                <Route path="/invite/accept" element={<MyInvites />}></Route>
                <Route path="/organization/api-keys" element={<BillingGuard><ApiKeyManagement /></BillingGuard>}></Route>
                <Route path="/organization/webhooks" element={<BillingGuard><WebhookManagement /></BillingGuard>}></Route>
                {/* Billing */}
                <Route path="/billing" element={<BillingGuard><BillingOverview /></BillingGuard>}></Route>
                <Route path="/billing/plans" element={<BillingGuard><PlanSelection /></BillingGuard>}></Route>
                <Route path="/billing/success" element={<BillingGuard><BillingSuccess /></BillingGuard>}></Route>
                {/* Admin */}
                <Route path="/admin/billing-plans" element={<AdminGuard><BillingPlanManagement /></AdminGuard>}></Route>
                <Route path="/admin/subscriptions" element={<AdminGuard><SubscriptionManagement /></AdminGuard>}></Route>
            </Routes>
        </Router>
        </PageLoadingProvider>
        </OrganizationProvider>
        </ConfigProvider>
        </ThemeProvider>
    );
}

export default AppRoutes;
