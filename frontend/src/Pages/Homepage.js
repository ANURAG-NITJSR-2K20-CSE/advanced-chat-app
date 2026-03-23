import React, { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Components/Auth/Login";
import Signup from "../Components/Auth/Signup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { WebGLHeroErrorBoundary } from "../Components/three/WebGLHeroErrorBoundary";

const HeroBackdrop = lazy(() => import("../Components/three/HeroBackdrop"));

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try {
        JSON.parse(raw);
        navigate("/chats");
      } catch {
        localStorage.removeItem("userInfo");
      }
    }
  }, [navigate]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-1 flex-col items-center px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:p-10">
      <WebGLHeroErrorBoundary>
        <Suspense fallback={null}>
          <HeroBackdrop />
        </Suspense>
      </WebGLHeroErrorBoundary>

      <div className="relative z-10 mb-4 flex w-full max-w-lg justify-end sm:max-w-xl">
        <ModeToggle />
      </div>
      <div className="relative z-10 flex w-full max-w-lg flex-col gap-4 sm:max-w-xl">
        <Card className="border-border/60 bg-card/75 shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-card/65">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="font-display text-4xl tracking-[0.14em] md:text-5xl">BaatCheet</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60 bg-card/75 shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-card/65">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <Login />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <Signup />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
