// LoginRegister.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, register, postVerifyCode } from "@/api";
import { Loader2 } from "lucide-react";
import LoginBg from "@/assets/login_video.mp4";

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    if (isLogin) {
      try {
        const data = await login({ username, password });
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", username);
        console.log("登录成功");
        onLoginSuccess(username); // 调用登录成功后的回调函数
      } catch (error) {
        console.error("登录失败:", error);
        setLoginError("登录失败，请确认用户名和密码");
        // 登录失败的错误处理
      } finally {
        setSubmitLoading(false);
      }
    } else {
      if (password !== confirmPassword) {
        console.error("两次输入的密码不一致");
        setLoginError("两次输入的密码不一致");
        // 两次输入的密码不一致的错误处理
        return;
      }

      try {
        await register({ phone, password, verify_code: verifyCode });
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setVerifyCode("");
        setUsername("");
        setIsLogin(true);
        // 注册成功后的逻辑处理
      } catch (error) {
        console.error("注册失败:", error);
        setLoginError(JSON.stringify(error));
        // 注册失败的错误处理
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  // 每秒更新倒计时
  React.useEffect(() => {
    if (countdown > 0) {
      const id = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [countdown]);

  const handleSendVerifyCode = async () => {
    try {
      setLoginError("");
      setPostLoading(true);
      await postVerifyCode({ phone });
      setCountdown(60);
    } catch (error) {
      setLoginError(JSON.stringify(error));
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-start items-center">
      <video
        src={LoginBg}
        autoPlay
        controls={false}
        loop={true}
        className="max-h-[642px]"
      ></video>
      <div className="max-h-96 z-10 flex-grow">
        <div className="w-64 mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            {isLogin ? "登录" : "注册"}
          </h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <Input
                  className=""
                  type="phone"
                  placeholder="手机号"
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                />
                <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
                  <Input
                    placeholder="验证码"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleSendVerifyCode();
                    }}
                    disabled={postLoading}
                  >
                    {postLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {countdown === 0 ? "发送验证码" : `等待${countdown}s`}
                  </Button>
                </div>
              </div>
            )}
            {isLogin && (
              <div className="mb-4">
                <Input
                  className=""
                  placeholder="用户名/手机号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <Input
                className=""
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div className="mb-4">
                <Input
                  type="password"
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button
              // variant="outline"
              type="submit"
              className="w-full mb-4"
              disabled={submitLoading}
            >
              {submitLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLogin ? "登录" : "注册"}
            </Button>
            <div className="text-red-500 text-sm text-center">{loginError}</div>
          </form>
          <div className="text-center">
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setPassword("");
                  setConfirmPassword("");
                  setPhone("");
                  setVerifyCode("");
                  setUsername("");
                  setLoginError("");
                  setIsLogin(!isLogin);
                }}
              >
                {isLogin ? "去注册" : "去登录"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
