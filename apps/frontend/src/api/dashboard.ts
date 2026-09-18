import apiClient from "./index";

export const dashboardApi = {
  getStats: async () => {
    const { data } = await apiClient.get("/dashboard/stats");
    return data;
  },
};
