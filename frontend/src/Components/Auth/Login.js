import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e?.preventDefault?.();
    if (!email || !password) {
      toast.warning("Please fill all the fields");
      return;
    }
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post("api/user/login", { email, password }, config);
      toast.success("Signed in");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      toast.error("Sign-in failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={submitHandler} noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="flex gap-2">
          <Input
            id="login-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </Button>
        </div>
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Login"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={loading}
        onClick={() => {
          setEmail("test@test.com");
          setPassword("123123");
        }}
      >
        Use guest credentials
      </Button>
    </form>
  );
};

export default Login;
