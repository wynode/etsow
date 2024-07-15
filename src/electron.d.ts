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
    agent_name: string;
    all_cookies: string;
    cookies: string;
    created_at: string;
    expire_time: string;
    id: number;
    live_status: string;
    live_status_cn: string;
    location: string;
    location_selection: { label: string; value: string }[];
    location_type: string;
    location_type_cn: string;
    nickname: string;
    rtmp_push_url: string;
    staff: number;
    staff_name: string;
    start_time: string;
    status: string;
    status_cn: string;
    tunnel_type: string;
    remain_valid_days: string;
    tunnel_perms: string[];
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
    game_username?: string;
    game_platform_password?: string;
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
    game_username: string;
    game_platform_password: string;
  }

  interface UserGatherInfo {
    created_at: string;
    id: number;
    remaining_count: number;
    remark: string;
    staff: number;
    staff_name: string;
    status: string;
    status_cn: string;
    updated_at: string;
  }

  interface GatherRecord {
    id: number;
    staff: number;
    staff_name: string;
    gather: number;
    gather_count: number;
    file: string;
    remark: string;
    created_at: string;
    updated_at: string;
  }

  interface UserGatherRecord {
    count: number;
    next: string | null;
    page_size: number;
    previous: string | null;
    results: GatherRecord[];
    total_page: number;
  }
}

export {};
