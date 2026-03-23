import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState();

  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const navigate = useNavigate();

  const postDetails = (pics) => {
    if (pics === undefined) {
      toast.warning("Please select an image");
      return;
    }
    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      toast.warning("Please use JPEG or PNG");
      return;
    }
    setAvatarUploading(true);
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "BaatCheet");
    data.append("cloud_name", "drkergesl");
    fetch("https://api.cloudinary.com/v1_1/drkergesl/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((d) => {
        if (d.url) setAvatar(d.url.toString());
        else toast.error("Upload failed", { description: "No image URL returned." });
      })
      .catch(() => {
        toast.error("Upload failed", { description: "Could not reach image service." });
      })
      .finally(() => {
        setAvatarUploading(false);
      });
  };

  const submitHandler = async (e) => {
    e?.preventDefault?.();
    if (!name || !email || !password || !confirmPass) {
      toast.warning("Please fill all the fields");
      return;
    }
    if (password !== confirmPass) {
      toast.warning("Password confirmation does not match");
      return;
    }
    if (avatarUploading) {
      toast.warning("Wait for the avatar upload to finish");
      return;
    }
    setSubmitting(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post("api/user", { name, email, password, avatar }, config);
      toast.success("Account created");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      toast.error("Sign-up failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const formBusy = submitting || avatarUploading;

  return (
    <form className="flex flex-col gap-4" onSubmit={submitHandler} noValidate>
      <div className="space-y-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={formBusy}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formBusy}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="flex gap-2">
          <Input
            id="signup-password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1"
            disabled={formBusy}
          />
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <div className="flex gap-2">
          <Input
            id="signup-confirm"
            type={show ? "text" : "password"}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="flex-1"
            disabled={formBusy}
          />
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-avatar">Avatar</Label>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          {avatar ? (
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={avatar} alt="" />
              <AvatarFallback className="text-sm">{name?.slice(0, 2).toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-xs text-muted-foreground">No photo</AvatarFallback>
            </Avatar>
          )}
          <Input
            id="signup-avatar"
            type="file"
            accept="image/*"
            className="w-full min-w-0 cursor-pointer sm:flex-1"
            disabled={formBusy}
            onChange={(e) => postDetails(e.target.files?.[0])}
          />
        </div>
        {avatarUploading && (
          <p className="text-muted-foreground text-xs" role="status">
            Uploading image…
          </p>
        )}
      </div>
      <Button className="w-full" type="submit" disabled={formBusy}>
        {submitting ? "Creating account…" : avatarUploading ? "Wait for upload…" : "Sign up"}
      </Button>
    </form>
  );
};

export default Signup;
