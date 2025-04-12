import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema, loginSchema } from "@shared/schema";

type AuthView = "login" | "register";

export default function AuthPage() {
  const [authView, setAuthView] = useState<AuthView>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect for navigation to avoid React errors
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form schema
  const loginFormSchema = loginSchema.extend({
    username: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
  
  // Registration form schema
  const registerFormSchema = insertUserSchema.extend({
    username: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    passwordConfirm: z.string().min(6, "Password confirmation must be at least 6 characters"),
  }).refine(data => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });
  
  type LoginFormValues = z.infer<typeof loginFormSchema>;
  type RegisterFormValues = z.infer<typeof registerFormSchema>;
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
  });
  
  // Handle login form submission
  const handleLogin = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  // Handle registration form submission
  const handleRegister = async (data: RegisterFormValues) => {
    try {
      const { passwordConfirm, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Auth form */}
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <div className="flex justify-center">
                <span className="text-5xl text-primary">🌱</span>
              </div>
              <h1 className="text-3xl font-semibold mt-2 text-primary">FreshTrack</h1>
              <p className="text-gray-500 mt-1">
                {authView === "login" ? "Track your food, reduce waste" : "Join to track your food"}
              </p>
            </div>
            
            {/* Login View */}
            {authView === "login" && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    {...loginForm.register("username")}
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Log In"}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account? 
                    <Button variant="link" className="pl-1.5" onClick={() => setAuthView("register")}>
                      Register here
                    </Button>
                  </p>
                </div>
              </form>
            )}
            
            {/* Register View */}
            {authView === "register" && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    {...registerForm.register("name")}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    {...registerForm.register("username")}
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...registerForm.register("password")}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...registerForm.register("passwordConfirm")}
                  />
                  {registerForm.formState.errors.passwordConfirm && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.passwordConfirm.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Register"}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account? 
                    <Button variant="link" className="pl-1.5" onClick={() => setAuthView("login")}>
                      Log in here
                    </Button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        {/* Hero section */}
        <div className="hidden md:block text-center md:text-left md:pr-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Track Your Food, <span className="text-primary">Reduce Waste</span>
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            FreshTrack helps you monitor your food items with expiration alerts, category organization, and recipe suggestions based on your inventory.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full">
                <span className="text-2xl">🕒</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-800">Expiration Notifications</h3>
                <p className="text-gray-600">Get alerts before your food expires</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full">
                <span className="text-2xl">🥗</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-800">Recipe Suggestions</h3>
                <p className="text-gray-600">Discover recipes based on available ingredients</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-800">Organized Categories</h3>
                <p className="text-gray-600">Keep your food items well-organized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
