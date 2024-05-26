// electron.d.ts
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
    echarts: any;
  }

  interface TableItem {
    id: number;
    location: string;
    nickname: string;
    rtmp_push_url: string;
    staff: null;
    staff_name: string;
    status: string;
    status_cn: string;
    cookies: string;
    created_at: string;
    expire_time: string;
    live_status: string;
    live_status_cn: string;
    start_time: string;
    all_cookies: string;
  }

  interface TableComponentProps {
    tableListData: TableItem[];
  }

  interface HomeComponentProps {
    onLoginOut: () => void;
  }

  // 文件：typings.d.ts
  declare module "*";

  interface LoginRegisterProps {
    onLoginSuccess: (username: string) => void;
  }
  interface ContainerProps {
    onLoginOut: () => void;
    userName: string;
  }

  interface LoginParams {
    username: string;
    password: string;
  }

  interface RegisterParams {
    password: string;
    phone: string;
    verify_code: string;
  }

  interface VerifyCodeParams {
    phone: string;
  }

  interface LoginResponse {
    token: string;
  }
}

export {};
