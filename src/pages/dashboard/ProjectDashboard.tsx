import React, { useCallback, useEffect, useMemo, useState } from "react";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import { Badge, Button, Card, Field, Input, Select } from "../../ui";
import { useTranslation } from "react-i18next";
import { getMyProjects, getOverviewProject, getTestProjects } from "../../services/projectService";
import { InvolvementTypeEnum } from "../../models/InvolvementData";
import { ProjectData } from "../../models/ProjectData";
import { ReportType } from "../../models/ReportData";
import { TestExecutionData } from "../../models/TestExecutionData";
import tokenProvider from "../../infra/tokenProvider";
import { FiFilter, FiXCircle } from "react-icons/fi";

type ExecutionEntry = TestExecutionData & {
  scenarioId?: number;
  scenarioName?: string;
  testCaseId?: number;
  testCaseName?: string;
};

const ProjectDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [managerProjects, setManagerProjects] = useState<ProjectData[]>([]);
  const [testerProjects, setTesterProjects] = useState<ProjectData[]>([]);
  const [activeScope, setActiveScope] = useState<"manager" | "tester">("manager");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectOverview, setProjectOverview] = useState<ProjectData | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [scenarioFilter, setScenarioFilter] = useState<number | "all">("all");
  const [testerFilter, setTesterFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportType>("all");
  const [filterDraft, setFilterDraft] = useState({
    scenario: "all" as number | "all",
    tester: "all" as number | "all",
    status: "all" as "all" | ReportType,
  });
  const [chartRangeDays, setChartRangeDays] = useState<number>(7);
  const [chartRangeMode, setChartRangeMode] = useState<"preset" | "custom">("preset");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [customStartDraft, setCustomStartDraft] = useState<string>("");
  const [customEndDraft, setCustomEndDraft] = useState<string>("");
  const currentUserId = tokenProvider.getSessionUserId();

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const [ownerResponse, testerResponse] = await Promise.all([
        getMyProjects(1, 200),
        getTestProjects(1, 200),
      ]);
      const ownerProjects = ownerResponse?.data?.data ?? [];
      const testerProjects = testerResponse?.data?.data ?? [];
      setManagerProjects(ownerProjects);
      setTesterProjects(testerProjects);

      const hasManagerProjects = ownerProjects.length > 0;
      setActiveScope(hasManagerProjects ? "manager" : "tester");

      if (!selectedProjectId) {
        const defaultProject = (hasManagerProjects ? ownerProjects : testerProjects)[0];
        setSelectedProjectId(defaultProject?.id ?? null);
      }
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedProjectId]);

  const loadOverview = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoadingOverview(true);
    try {
      const response = await getOverviewProject(selectedProjectId);
      setProjectOverview(response?.data ?? null);
      if (response?.data?.createdAt) {
        console.log("[dashboard] project createdAt:", response.data.createdAt);
      } else {
        console.log("[dashboard] project createdAt: (missing)");
      }
      setScenarioFilter("all");
      setTesterFilter("all");
      setStatusFilter("all");
      setFilterDraft({ scenario: "all", tester: "all", status: "all" });
    } finally {
      setLoadingOverview(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const projectStartDate = useMemo(() => {
    if (!projectOverview?.createdAt) return "";
    const createdAt = new Date(projectOverview.createdAt);
    if (Number.isNaN(createdAt.getTime())) return "";
    return createdAt.toISOString().split("T")[0];
  }, [projectOverview?.createdAt]);

  const isStartBeforeProject = useMemo(() => {
    if (!projectStartDate) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(customStartDraft)) return false;
    const start = new Date(`${customStartDraft}T00:00:00`);
    const projectStart = new Date(`${projectStartDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(projectStart.getTime())) return false;
    return start < projectStart;
  }, [customStartDraft, projectStartDate]);

  useEffect(() => {
    if (chartRangeMode !== "custom") return;
    const timeout = window.setTimeout(() => {
      const clampDate = (value: string, min?: string, max?: string) => {
        if (!value) return "";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
        const year = Number(value.slice(0, 4));
        if (!Number.isFinite(year) || year < 1000) return "";
        const date = new Date(`${value}T00:00:00`);
        if (Number.isNaN(date.getTime())) return "";
        if (min) {
          const minDate = new Date(`${min}T00:00:00`);
          if (!Number.isNaN(minDate.getTime()) && date < minDate) return min;
        }
        if (max) {
          const maxDate = new Date(`${max}T00:00:00`);
          if (!Number.isNaN(maxDate.getTime()) && date > maxDate) return max;
        }
        return value;
      };

      const nextStart = clampDate(customStartDraft, projectStartDate || undefined, customEndDraft || undefined);
      const nextEnd = clampDate(customEndDraft, nextStart || projectStartDate || undefined);

      if (nextStart) setCustomStartDate(nextStart);
      if (nextEnd) setCustomEndDate(nextEnd);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [customStartDraft, customEndDraft, chartRangeMode, projectStartDate]);

  const scenarios = useMemo(() => projectOverview?.testScenarios ?? [], [projectOverview]);

  const scopedProjects = useMemo(() => {
    return activeScope === "manager" ? managerProjects : testerProjects;
  }, [activeScope, managerProjects, testerProjects]);

  const executionEntries = useMemo<ExecutionEntry[]>(() => {
    return scenarios.flatMap((scenario) => {
      const testCases = scenario.testCases ?? [];
      return testCases.flatMap((testCase) => {
        const executions = (testCase as any).testExecutions ?? [];
        return executions.map((execution: TestExecutionData) => ({
          ...execution,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          testCaseId: testCase.id,
          testCaseName: testCase.name,
        }));
      });
    });
  }, [scenarios]);

  const baseExecutions = useMemo(() => {
    if (activeScope !== "tester") return executionEntries;
    return executionEntries.filter((execution) => execution.user?.id === currentUserId);
  }, [activeScope, executionEntries, currentUserId]);

  const filteredExecutions = useMemo(() => {
    return baseExecutions.filter((execution) => {
      if (scenarioFilter !== "all" && execution.scenarioId !== scenarioFilter) return false;
      if (activeScope !== "tester" && testerFilter !== "all" && execution.user?.id !== testerFilter) return false;
      if (statusFilter !== "all") {
        const reports = execution.reports ?? [];
        if (!reports.length) return false;
        return reports.some((report) => report.type === statusFilter);
      }
      return true;
    });
  }, [baseExecutions, scenarioFilter, testerFilter, statusFilter, activeScope]);

  const reports = useMemo(() => {
    return filteredExecutions.flatMap((execution) => execution.reports ?? []);
  }, [filteredExecutions]);

  const caseSummary = useMemo(() => {
    const testCases = scenarios.flatMap((scenario) => scenario.testCases ?? []);
    const executedCaseIds = new Set<number>();
    baseExecutions.forEach((execution) => {
      if (execution.testCaseId) executedCaseIds.add(execution.testCaseId);
    });

    const executedCases = executedCaseIds.size;
    const totalCases = testCases.length;
    const coverageRate = totalCases ? Math.round((executedCases / totalCases) * 100) : 0;
    const pendingReports = baseExecutions.filter((execution) => (execution.reports ?? []).length === 0).length;

    const lastReported = baseExecutions
      .filter((execution) => execution.reported)
      .map((execution) => new Date(execution.reported as string))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalCases,
      executedCases,
      coverageRate,
      pendingReports,
      lastReported,
    };
  }, [baseExecutions, scenarios]);

  const summary = useMemo(() => {
    const testCases = scenarios.flatMap((scenario) => scenario.testCases ?? []);
    const totalExecutions = filteredExecutions.length;
    const approved = reports.filter((report) => report.type === ReportType.Approved).length;
    const rejected = reports.filter((report) => report.type === ReportType.Rejected).length;
    const approvalRate = approved + rejected > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;

    return {
      scenarios: scenarios.length,
      cases: testCases.length,
      executions: totalExecutions,
      reports: reports.length,
      approved,
      rejected,
      approvalRate,
    };
  }, [filteredExecutions.length, reports, scenarios]);

  const qualitySignal = useMemo(() => {
    const totalReviews = summary.approved + summary.rejected;
    const rejectionRate = totalReviews ? summary.rejected / totalReviews : 0;

    if (rejectionRate >= 0.4) return { level: "high", value: Math.round(rejectionRate * 100) };
    if (rejectionRate >= 0.2) return { level: "medium", value: Math.round(rejectionRate * 100) };
    return { level: "low", value: Math.round(rejectionRate * 100) };
  }, [summary.approved, summary.rejected]);

  const involvementSummary = useMemo(() => {
    const involvements = projectOverview?.involvements ?? [];
    const managerIds = new Set<number>();
    const testerIds = new Set<number>();

    if (projectOverview?.creator?.id) {
      managerIds.add(projectOverview.creator.id);
    }

    involvements.forEach((involvement) => {
      if (involvement.type === InvolvementTypeEnum.Manager) {
        if (involvement.userId) managerIds.add(involvement.userId);
      }
      if (involvement.type === InvolvementTypeEnum.Tester) {
        if (involvement.userId) testerIds.add(involvement.userId);
      }
    });

    return {
      managers: managerIds.size,
      testers: testerIds.size,
    };
  }, [projectOverview]);

  const testerRanking = useMemo(() => {
    if (activeScope === "tester") return [];
    const map = new Map<number, { name: string; email?: string; executions: number; approved: number; rejected: number; score: number }>();
    filteredExecutions.forEach((execution) => {
      const user = execution.user;
      if (!user?.id) return;
      const reportsForExecution = execution.reports ?? [];
      const approved = reportsForExecution.filter((report) => report.type === ReportType.Approved).length;
      const rejected = reportsForExecution.filter((report) => report.type === ReportType.Rejected).length;
      const scoreSum = reportsForExecution.reduce((sum, report) => sum + (report.score ?? 0), 0);

      const current = map.get(user.id) ?? {
        name: user.name ?? t("dashboard.unknownTester"),
        email: user.email,
        executions: 0,
        approved: 0,
        rejected: 0,
        score: 0,
      };

      current.executions += 1;
      current.approved += approved;
      current.rejected += rejected;
      current.score += scoreSum;

      map.set(user.id, current);
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        averageScore: entry.executions ? Math.round(entry.score / entry.executions) : 0,
      }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 5);
  }, [filteredExecutions, t, activeScope]);

  const scenarioFailureRates = useMemo(() => {
    return scenarios
      .filter((scenario) => scenarioFilter === "all" || scenario.id === scenarioFilter)
      .map((scenario) => {
        const scenarioExecutions = filteredExecutions.filter(
          (execution) => execution.scenarioId === scenario.id
        );
        const scenarioReports = scenarioExecutions.flatMap((execution) => execution.reports ?? []);
        const rejected = scenarioReports.filter((report) => report.type === ReportType.Rejected).length;
        const total = scenarioReports.length;
        const rate = total ? Math.round((rejected / total) * 100) : 0;
        return { id: scenario.id, name: scenario.name, rejected, total, rate };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [filteredExecutions, scenarioFilter, scenarios]);

  const topFailure = scenarioFailureRates[0];

  const actionItems = useMemo(() => {
    const items: string[] = [];

    if (baseExecutions.length === 0) {
      items.push(t("dashboard.actionNoExecutions"));
      return items;
    }

    if (caseSummary.pendingReports > 0) {
      items.push(t("dashboard.actionPendingReports", { count: caseSummary.pendingReports }));
    }

    if (caseSummary.totalCases > 0 && caseSummary.coverageRate < 60) {
      items.push(t("dashboard.actionLowCoverage", { rate: caseSummary.coverageRate }));
    }

    if (topFailure && topFailure.total > 0 && topFailure.rate >= 30) {
      items.push(t("dashboard.actionHotspot", { name: topFailure.name, rate: topFailure.rate }));
    }

    if ((summary.approved + summary.rejected) === 0) {
      items.push(t("dashboard.actionNoReviews"));
    }

    return items;
  }, [baseExecutions.length, caseSummary.coverageRate, caseSummary.pendingReports, caseSummary.totalCases, summary.approved, summary.rejected, topFailure, t]);

  const executionChartData = useMemo(() => {
    const days: { date: Date; label: string; key: string; count: number }[] = [];

    if (chartRangeMode === "custom" && customStartDate && customEndDate) {
      const start = new Date(`${customStartDate}T00:00:00`);
      const end = new Date(`${customEndDate}T00:00:00`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
      if (start > end) return [];

      const cursor = new Date(start);
      while (cursor <= end) {
        const key = cursor.toISOString().split("T")[0];
        days.push({
          date: new Date(cursor),
          key,
          label: `${cursor.getDate().toString().padStart(2, "0")}/${(cursor.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`,
          count: 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    } else {
      const now = new Date();
      for (let i = chartRangeDays - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const key = date.toISOString().split("T")[0];
        days.push({
          date,
          key,
          label: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`,
          count: 0,
        });
      }
    }

    filteredExecutions.forEach((execution) => {
      if (!execution.reported) return;
      const reportedKey = new Date(execution.reported).toISOString().split("T")[0];
      const day = days.find((item) => item.key === reportedKey);
      if (day) day.count += 1;
    });

    return days;
  }, [filteredExecutions, chartRangeDays, chartRangeMode, customStartDate, customEndDate]);

  const maxExecutions = useMemo(() => {
    return executionChartData.reduce((max, item) => Math.max(max, item.count), 0) || 1;
  }, [executionChartData]);

  const testerOptions = useMemo(() => {
    if (activeScope === "tester") return [];
    const byId = new Map<number, { id: number; name: string }>();
    executionEntries.forEach((execution) => {
      if (execution.user?.id) {
        byId.set(execution.user.id, {
          id: execution.user.id,
          name: execution.user.name ?? t("dashboard.unknownTester"),
        });
      }
    });
    return Array.from(byId.values());
  }, [executionEntries, t, activeScope]);

  const myPerformance = useMemo(() => {
    const myExecutions = filteredExecutions;
    const myReports = myExecutions.flatMap((execution) => execution.reports ?? []);
    const approved = myReports.filter((report) => report.type === ReportType.Approved).length;
    const rejected = myReports.filter((report) => report.type === ReportType.Rejected).length;
    const averageScore = myReports.length
      ? Math.round(myReports.reduce((sum, report) => sum + (report.score ?? 0), 0) / myReports.length)
      : 0;

    return {
      executions: myExecutions.length,
      approved,
      rejected,
      averageScore,
    };
  }, [filteredExecutions]);

  const chartDayCount = executionChartData.length || 1;
  const projectAgeDays = useMemo(() => {
    if (projectOverview?.createdAt) {
      const createdAt = new Date(projectOverview.createdAt);
      if (!Number.isNaN(createdAt.getTime())) {
        const diff = Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
      }
    }

    const firstReported = baseExecutions
      .filter((execution) => execution.reported)
      .map((execution) => new Date(execution.reported as string))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    if (firstReported) {
      const diff = Math.ceil((Date.now() - firstReported.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    }

    return chartDayCount;
  }, [projectOverview?.createdAt, baseExecutions, chartDayCount]);

  const isInvalidCustomRange =
    chartRangeMode === "custom" &&
    customStartDate &&
    customEndDate &&
    new Date(`${customStartDate}T00:00:00`) > new Date(`${customEndDate}T00:00:00`);

  const applyFilters = () => {
    setScenarioFilter(filterDraft.scenario);
    setTesterFilter(filterDraft.tester);
    setStatusFilter(filterDraft.status);
  };

  const clearFilters = () => {
    const reset = { scenario: "all" as const, tester: "all" as const, status: "all" as const };
    setFilterDraft(reset);
    setScenarioFilter(reset.scenario);
    setTesterFilter(reset.tester);
    setStatusFilter(reset.status);
  };

  return (
    <PainelContainer>
      <div className="space-y-6">
        <TitleContainer title={t("dashboard.pageTitle")} />
        <LoadingOverlay show={loadingProjects || loadingOverview} />

        <Card className="space-y-4 bg-paper/95 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.filtersTitle")}</p>
              <h2 className="text-lg font-semibold text-ink">{t("dashboard.filtersSubtitle")}</h2>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {managerProjects.length > 0 && (
                <Button
                  variant={activeScope === "manager" ? "primary" : "outline"}
                  onClick={() => {
                    setActiveScope("manager");
                    if (managerProjects.length) {
                      setSelectedProjectId(managerProjects[0].id ?? null);
                    }
                  }}
                >
                  {t("dashboard.managerProjects")}
                </Button>
              )}
              {testerProjects.length > 0 && (
                <Button
                  variant={activeScope === "tester" ? "primary" : "outline"}
                  onClick={() => {
                    setActiveScope("tester");
                    if (testerProjects.length) {
                      setSelectedProjectId(testerProjects[0].id ?? null);
                    }
                  }}
                >
                  {t("dashboard.testerProjects")}
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label={t("dashboard.projectLabel")}>
              <Select
                value={selectedProjectId ?? ""}
                onChange={(event) => setSelectedProjectId(Number(event.target.value))}
              >
                {scopedProjects.length === 0 && <option value="">{t("dashboard.emptyProjects")}</option>}
                {scopedProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("dashboard.scenarioLabel")}>
              <Select
                value={filterDraft.scenario}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    scenario: event.target.value === "all" ? "all" : Number(event.target.value),
                  }))
                }
                disabled={!scenarios.length}
              >
                <option value="all">{t("common.all")}</option>
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </Select>
            </Field>
            {activeScope !== "tester" && (
              <Field label={t("dashboard.testerLabel")}>
                <Select
                  value={filterDraft.tester}
                  onChange={(event) =>
                    setFilterDraft((prev) => ({
                      ...prev,
                      tester: event.target.value === "all" ? "all" : Number(event.target.value),
                    }))
                  }
                  disabled={!testerOptions.length}
                >
                  <option value="all">{t("common.all")}</option>
                  {testerOptions.map((tester) => (
                    <option key={tester.id} value={tester.id}>
                      {tester.name}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label={t("dashboard.statusLabel")}>
              <Select
                value={filterDraft.status}
                onChange={(event) =>
                  setFilterDraft((prev) => ({
                    ...prev,
                    status: event.target.value === "all" ? "all" : (Number(event.target.value) as ReportType),
                  }))
                }
              >
                <option value="all">{t("common.all")}</option>
                <option value={ReportType.Approved}>{t("dashboard.statusApproved")}</option>
                <option value={ReportType.Rejected}>{t("dashboard.statusRejected")}</option>
              </Select>
            </Field>
          </div>
          <div className="flex w-full justify-end gap-2 pt-2">
            <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
              {t("common.confirm")}
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
              {t("common.clearFilters")}
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.keyMetricsTitle")}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-ink/10 bg-sand/60 p-3">
                <p className="text-xs text-ink/50">{t("dashboard.executedCases")}</p>
                <p className="text-lg font-semibold text-ink">
                  {caseSummary.executedCases}/{caseSummary.totalCases}
                </p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-sand/60 p-3">
                <p className="text-xs text-ink/50">{t("dashboard.coverageRate")}</p>
                <p className="text-lg font-semibold text-ink">{caseSummary.coverageRate}%</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-sand/60 p-3">
                <p className="text-xs text-ink/50">{t("dashboard.pendingReports")}</p>
                <p className="text-lg font-semibold text-ink">{caseSummary.pendingReports}</p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-sand/60 p-3">
                <p className="text-xs text-ink/50">{t("dashboard.lastActivity")}</p>
                <p className="text-sm font-semibold text-ink">
                  {caseSummary.lastReported ? caseSummary.lastReported.toLocaleDateString() : t("dashboard.lastActivityEmpty")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.qualitySignalTitle")}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.qualitySignalLabel")}</span>
                <Badge variant={qualitySignal.level === "high" ? "danger" : qualitySignal.level === "medium" ? "accent" : "success"}>
                  {t(`dashboard.qualitySignal.${qualitySignal.level}`)}
                </Badge>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                <div
                  className={qualitySignal.level === "high" ? "h-full rounded-full bg-red-500" : qualitySignal.level === "medium" ? "h-full rounded-full bg-ember" : "h-full rounded-full bg-pine"}
                  style={{ width: `${qualitySignal.value}%` }}
                />
              </div>
              <p className="text-xs text-ink/60">
                {t("dashboard.qualitySignalValue", { value: qualitySignal.value })}
              </p>
            </div>
          </Card>

          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.actionItemsTitle")}</p>
            {actionItems.length === 0 ? (
              <p className="text-sm text-ink/60">{t("dashboard.actionItemsEmpty")}</p>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink/70">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
              {activeScope === "tester" ? t("dashboard.myOverviewTitle") : t("dashboard.overviewTitle")}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalScenarios")}</span>
                <span className="font-semibold text-ink">{summary.scenarios}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalManagers")}</span>
                <span className="font-semibold text-ink">{involvementSummary.managers}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalTesters")}</span>
                <span className="font-semibold text-ink">{involvementSummary.testers}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalCases")}</span>
                <span className="font-semibold text-ink">{summary.cases}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalExecutions")}</span>
                <span className="font-semibold text-ink">{summary.executions}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalReports")}</span>
                <span className="font-semibold text-ink">{summary.reports}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.approvalRate")}</span>
                <span className="font-semibold text-ink">{summary.approvalRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.rejections")}</span>
                <Badge variant="danger">{summary.rejected}</Badge>
              </div>
            </div>
          </Card>

          {activeScope === "tester" ? (
            <Card className="space-y-4 bg-paper/95 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.myPerformanceTitle")}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-ink/70">
                  <span>{t("dashboard.myExecutions")}</span>
                  <span className="font-semibold text-ink">{myPerformance.executions}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-ink/70">
                  <span>{t("dashboard.myApprovals")}</span>
                  <Badge variant="success">{myPerformance.approved}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-ink/70">
                  <span>{t("dashboard.myRejections")}</span>
                  <Badge variant="danger">{myPerformance.rejected}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-ink/70">
                  <span>{t("dashboard.myAverageScore")}</span>
                  <span className="font-semibold text-ink">{myPerformance.averageScore}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="space-y-4 bg-paper/95 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.rankingTitle")}</p>
                <Badge variant="accent">{t("dashboard.topLabel")}</Badge>
              </div>
              {testerRanking.length === 0 ? (
                <p className="text-sm text-ink/60">{t("dashboard.emptyRanking")}</p>
              ) : (
                <div className="space-y-3">
                  {testerRanking.map((tester, index) => (
                    <div key={`${tester.name}-${index}`} className="rounded-2xl border border-ink/10 bg-sand/60 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink">{tester.name}</p>
                          <p className="text-xs text-ink/60">{tester.email}</p>
                        </div>
                        <Badge variant="neutral">{tester.executions}x</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                        <span>{t("dashboard.approvals")}: {tester.approved}</span>
                        <span>{t("dashboard.rejections")}: {tester.rejected}</span>
                        <span>{t("dashboard.averageScore")}: {tester.averageScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
              {activeScope === "tester" ? t("dashboard.failureRateMineTitle") : t("dashboard.failureRateTitle")}
            </p>
            {scenarioFailureRates.length === 0 ? (
              <p className="text-sm text-ink/60">{t("dashboard.emptyScenarios")}</p>
            ) : (
              <div className="space-y-3">
                {scenarioFailureRates.map((scenario) => (
                  <div key={scenario.id} className="space-y-2 rounded-2xl border border-ink/10 bg-sand/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{scenario.name}</span>
                      <span className="text-xs text-ink/60">
                        {scenario.rejected}/{scenario.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${scenario.rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-ink/60">{scenario.rate}% {t("dashboard.failureRateLabel")}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="space-y-6 bg-paper/95 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.dailyExecutionsTitle")}</p>
              <p className="text-sm text-ink/60">{t("dashboard.dailyExecutionsSubtitle")}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Field label={t("dashboard.periodLabel")} className="min-w-[200px]">
                <Select
                  value={chartRangeMode === "custom" ? "custom" : chartRangeDays}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "custom") {
                      setChartRangeMode("custom");
                      setCustomStartDraft(customStartDate || projectStartDate);
                      setCustomEndDraft(customEndDate);
                      return;
                    }
                    setChartRangeMode("preset");
                    setChartRangeDays(Number(value));
                  }}
                >
                  <option value={7}>{t("dashboard.lastDays", { count: 7 })}</option>
                  <option value={14}>{t("dashboard.lastDays", { count: 14 })}</option>
                  <option value={30}>{t("dashboard.lastDays", { count: 30 })}</option>
                  <option value={90}>{t("dashboard.lastDays", { count: 90 })}</option>
                  <option value={180}>{t("dashboard.lastDays", { count: 180 })}</option>
                  <option value="custom">{t("dashboard.customRange")}</option>
                </Select>
              </Field>
              {chartRangeMode === "custom" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label={t("dashboard.startDateLabel")}
                    error={
                      isStartBeforeProject
                        ? t("dashboard.startDateBeforeProject")
                        : isInvalidCustomRange
                        ? t("dashboard.invalidRange")
                        : undefined
                    }
                  >
                    <Input
                      type="date"
                      value={customStartDraft}
                      min={projectStartDate || undefined}
                      max={customEndDraft || undefined}
                      onChange={(event) => setCustomStartDraft(event.target.value)}
                    />
                  </Field>
                  <Field
                    label={t("dashboard.endDateLabel")}
                    error={isInvalidCustomRange ? t("dashboard.invalidRange") : undefined}
                  >
                    <Input
                      type="date"
                      value={customEndDraft}
                      min={customStartDraft || projectStartDate || undefined}
                      onChange={(event) => setCustomEndDraft(event.target.value)}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
            <div className="rounded-2xl border border-ink/10 bg-sand/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.chartSummary")}</p>
              <div className="mt-3 space-y-2 text-sm text-ink/70">
                <div className="flex items-center justify-between">
                  <span>{t("dashboard.totalExecutions")}</span>
                  <span className="font-semibold text-ink">{filteredExecutions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("dashboard.averagePerDayProject")}</span>
                  <span className="font-semibold text-ink">
                    {(filteredExecutions.length / projectAgeDays).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex min-w-[560px] items-end gap-3">
                {executionChartData.map((item) => (
                  <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end justify-center rounded-xl bg-sand/40 px-2">
                      <div
                        className="w-full rounded-full bg-ocean/80"
                        style={{ height: `${(item.count / maxExecutions) * 100}%` }}
                        title={`${item.count} ${t("dashboard.executionsLabel")}`}
                      />
                    </div>
                    <div className="text-xs font-semibold text-ink/70">{item.label}</div>
                    <div className="text-xs text-ink/50">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PainelContainer>
  );
};

export default ProjectDashboard;
