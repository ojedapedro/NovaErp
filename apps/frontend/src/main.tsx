import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider 
        locale={esES}
        theme={{
          token: {
            colorPrimary: '#3B82F6',
            colorInfo: '#3B82F6',
            colorSuccess: '#16A34A',
            colorWarning: '#D97706',
            colorError: '#DC2626',
            colorTextBase: '#111827',
            fontFamily: "\'Open Sans\', sans-serif",
            borderRadius: 4,
            controlHeight: 40,
            colorBgContainer: '#FFFFFF',
          },
          components: {
            Layout: {
              headerBg: '#FFFFFF',
              siderBg: '#0f172a',
            },
            Menu: {
              darkItemBg: '#0f172a',
              darkItemSelectedBg: '#3B82F6',
            },
            Table: {
              headerBg: '#F9FAFB',
              headerColor: '#4B5563',
            },
            Card: {
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }
          }
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
