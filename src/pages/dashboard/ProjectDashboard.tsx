import React, { useCallback, useEffect, useMemo, useState } from "react";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import { Badge, Button, Card, Field, Input, Select } from "../../ui";
import { useTranslation } from "react-i18next";
import { getMyProjects, getOverviewProject, getTestProjects } from "../../services/projectService";
import { ProjectData } from "../../models/ProjectData";
import { ReportType } from "../../models/ReportData";
import { TestExecutionData } from "../../models/TestExecutionData";

type ExecutionEntry = TestExecutionData & {
  scenarioId?: number;
  scenarioName?: string;
  testCaseId?: number;
  testCaseName?: string;
};

const ProjectDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectOverview, setProjectOverview] = useState<ProjectData | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [scenarioFilter, setScenarioFilter] = useState<number | "all">("all");
  const [testerFilter, setTesterFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportType>("all");
  const [chartRangeDays, setChartRangeDays] = useState<number>(7);
  const [chartRangeMode, setChartRangeMode] = useState<"preset" | "custom">("preset");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const [ownerResponse, testerResponse] = await Promise.all([
        getMyProjects(1, 200),
        getTestProjects(1, 200),
      ]);
      const ownerProjects = ownerResponse?.data?.data ?? [];
      const testerProjects = testerResponse?.data?.data ?? [];
      const byId = new Map<number, ProjectData>();
      [...ownerProjects, ...testerProjects].forEach((project: ProjectData) => {
        if (project?.id) {
          byId.set(project.id, project);
        }
      });
      const mergedProjects = Array.from(byId.values());
      setProjects(mergedProjects);
      if (!selectedProjectId && mergedProjects.length) {
        setSelectedProjectId(mergedProjects[0].id ?? null);
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
      setScenarioFilter("all");
      setTesterFilter("all");
      setStatusFilter("all");
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

  const scenarios = useMemo(() => projectOverview?.testScenarios ?? [], [projectOverview]);

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

  const filteredExecutions = useMemo(() => {
    return executionEntries.filter((execution) => {
      if (scenarioFilter !== "all" && execution.scenarioId !== scenarioFilter) return false;
      if (testerFilter !== "all" && execution.user?.id !== testerFilter) return false;
      if (statusFilter !== "all") {
        const reports = execution.reports ?? [];
        if (!reports.length) return false;
        return reports.some((report) => report.type === statusFilter);
      }
      return true;
    });
  }, [executionEntries, scenarioFilter, testerFilter, statusFilter]);

  const reports = useMemo(() => {
    return filteredExecutions.flatMap((execution) => execution.reports ?? []);
  }, [filteredExecutions]);

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

  const testerRanking = useMemo(() => {
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
  }, [filteredExecutions, t]);

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
  }, [executionEntries, t]);

  const chartDayCount = executionChartData.length || 1;

  const isInvalidCustomRange =
    chartRangeMode === "custom" &&
    customStartDate &&
    customEndDate &&
    new Date(`${customStartDate}T00:00:00`) > new Date(`${customEndDate}T00:00:00`);

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
            <Button
              variant="outline"
              onClick={() => {
                setScenarioFilter("all");
                setTesterFilter("all");
                setStatusFilter("all");
              }}
            >
              {t("common.clearFilters")}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label={t("dashboard.projectLabel")}>
              <Select
                value={selectedProjectId ?? ""}
                onChange={(event) => setSelectedProjectId(Number(event.target.value))}
              >
                {projects.length === 0 && <option value="">{t("dashboard.emptyProjects")}</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("dashboard.scenarioLabel")}>
              <Select
                value={scenarioFilter}
                onChange={(event) =>
                  setScenarioFilter(event.target.value === "all" ? "all" : Number(event.target.value))
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
            <Field label={t("dashboard.testerLabel")}>
              <Select
                value={testerFilter}
                onChange={(event) =>
                  setTesterFilter(event.target.value === "all" ? "all" : Number(event.target.value))
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
            <Field label={t("dashboard.statusLabel")}>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value === "all" ? "all" : Number(event.target.value) as ReportType)
                }
              >
                <option value="all">{t("common.all")}</option>
                <option value={ReportType.Approved}>{t("dashboard.statusApproved")}</option>
                <option value={ReportType.Rejected}>{t("dashboard.statusRejected")}</option>
              </Select>
            </Field>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.overviewTitle")}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>{t("dashboard.totalScenarios")}</span>
                <span className="font-semibold text-ink">{summary.scenarios}</span>
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

          <Card className="space-y-4 bg-paper/95 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("dashboard.failureRateTitle")}</p>
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
                    error={isInvalidCustomRange ? t("dashboard.invalidRange") : undefined}
                  >
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(event) => setCustomStartDate(event.target.value)}
                    />
                  </Field>
                  <Field
                    label={t("dashboard.endDateLabel")}
                    error={isInvalidCustomRange ? t("dashboard.invalidRange") : undefined}
                  >
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(event) => setCustomEndDate(event.target.value)}
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
                  <span>{t("dashboard.averagePerDay")}</span>
                  <span className="font-semibold text-ink">
                    {(filteredExecutions.length / chartDayCount).toFixed(1)}
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
