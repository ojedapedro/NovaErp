import apiClient from "./index";

export interface AlertData {
  id: string;
  companyId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const alertsApi = {
  getUnread: async (): Promise<AlertData[]> => {
    const { data } = await apiClient.get("/alerts/unread");
    return data;
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/alerts/${id}/read`);
  },
};
