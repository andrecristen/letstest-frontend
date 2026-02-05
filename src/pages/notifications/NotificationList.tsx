import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ListLayout from "../../components/ListLayout";
import { Button, Card } from "../../ui";
import {
  getNotifications,
  markAllRead,
  markNotificationRead,
  NotificationItem,
} from "../../services/notificationService";
import { usePageLoading } from "../../hooks/usePageLoading";

const NotificationList: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNotifications(1, 100);
      const data = response?.data?.data ?? [];
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.readAt);
    }
    return notifications;
  }, [notifications, filter]);

  usePageLoading(loading);

  return (
    <ListLayout
      title={t("notifications.listTitle")}
      extraActions={(
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            {t("notifications.filterAll")}
          </Button>
          <Button
            variant={filter === "unread" ? "primary" : "outline"}
            onClick={() => setFilter("unread")}
          >
            {t("notifications.filterUnread")}
          </Button>
        </div>
      )}
      actions={(
        <Button
          variant="outline"
          onClick={async () => {
            await markAllRead();
            setNotifications((prev) =>
              prev.map((item) => ({ ...item, readAt: new Date().toISOString() }))
            );
          }}
        >
          {t("nav.markAllRead")}
        </Button>
      )}
      loading={loading}
      loadingMessage={t("common.loading")}
      empty={filteredNotifications.length === 0}
      emptyMessage={t("notifications.emptyList")}
    >
      <div className="space-y-3">
        {filteredNotifications.map((item) => (
          <Card
            key={item.id}
            className={`space-y-2 ${item.readAt ? "bg-paper/60" : "bg-ocean/5"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">{item.notification.title}</span>
              <span className="text-xs text-ink/50">
                {new Date(item.notification.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-ink/70">{item.notification.message}</p>
            {!item.readAt && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await markNotificationRead(item.notificationId);
                    setNotifications((prev) =>
                      prev.map((notification) =>
                        notification.id === item.id
                          ? { ...notification, readAt: new Date().toISOString() }
                          : notification
                      )
                    );
                  }}
                >
                  {t("notifications.markRead")}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </ListLayout>
  );
};

export default NotificationList;
