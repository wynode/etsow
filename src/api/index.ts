// const BASE_URL = "http://livetool.etsow.com"; // 替换为你的实际 API 域名
const BASE_URL = "http://154.22.111.74:8502"; // 替换为你的实际 API 域名

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token"); // 从本地存储中获取 token

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `JWT ${token}`); // 设置 Authorization 请求头
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.setItem("token", "");
      throw new Error("Token过期，请重新登录");
    }
    const error = await response.json();
    return new Promise((res, rej) => {
      rej(error);
    });
  }

  return response.json();
}

export async function LoginTunnel(
  id: number,
  item: {
    nickname?: string;
    cookies?: string;
    location?: string;
    all_cookies?: string;
  }
) {
  return request(`/tunnel/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function getStreamCode(id: number) {
  return request(`/tunnel/${id}/get_tiktok_rtmp/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function postCookies(
  id: number,
  item: {
    nickname: string;
    cookies: string;
    location: string;
  }
) {
  return request(`/tunnel/${id}/get_tiktok_rtmp/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function getTunnelList() {
  return request("/tunnel/?vs=qd-1.1.0", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function patchCookie(payload: { id: string; cookie: string }) {
  return request("/api/get_tui_liu", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function offlineUser(id: number) {
  return request(`/tunnel/${id}/offline/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getDouyinTunnelList() {
  return request("/tunnel/get_douyin_tunnel/?vs=qd-1.1.0", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function LoginDouyinTunnel(
  id: number,
  item: {
    nickname?: string;
    cookies?: string;
    all_cookies?: string;
  }
) {
  return request(`/tunnel/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function getDouyinStreamCode(
  id: number,
  item: {
    device_id: string;
  }
) {
  return request(`/tunnel/${id}/get_douyin_rtmp/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function offlineDouyin(id: number) {
  return request(`/tunnel/${id}/offline/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function login(params: LoginParams): Promise<LoginResponse> {
  return await request("/api-token-auth/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}

export async function register(params: RegisterParams): Promise<void> {
  return await request("/user_register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}

export async function postVerifyCode(params: VerifyCodeParams): Promise<void> {
  return await request("/user_register/send_verify_sms/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}

