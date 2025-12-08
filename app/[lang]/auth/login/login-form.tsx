"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/schemas/login-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteLogo } from "@/components/svg";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLoginMutation } from "@/hooks/api/use-auth-api";

const LogInForm = () => {
  const [passwordType, setPasswordType] = React.useState<"password" | "text">(
    "password"
  );
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  const {
    mutate: login,
    isPending,
  } = useLoginMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <div className="w-full py-5 lg:py-10">
      <Link href="/dashboard" className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:w-14 2xl:h-14 text-primary" />
      </Link>

      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
      Welcome Back 👋
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
      Please enter your login credentials to continue.
      </div>


      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 xl:mt-7">
        {/* Email Field */}
        <div className="relative">
          <Label htmlFor="email" className="mb-2 font-medium text-default-600">
            Email
          </Label>
          <Input
            disabled={isPending}
            {...register("email")}
            type="email"
            id="email"
            className={cn("peer", { "border-destructive": errors.email })}
            size={!isDesktop2xl ? "xl" : "lg"}
            placeholder="Enter your email"
          />
        </div>
        {errors.email && (
          <p className="text-destructive mt-2">{errors.email.message}</p>
        )}

        {/* Password Field */}
        <div className="mt-3.5">
          <Label
            htmlFor="password"
            className="mb-2 font-medium text-default-600"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              disabled={isPending}
              {...register("password")}
              type={passwordType}
              id="password"
              className={cn("peer", { "border-destructive": errors.password })}
              placeholder="Enter your password"
              size={!isDesktop2xl ? "xl" : "lg"}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
              onClick={togglePasswordType}
            >
              {passwordType === "password" ? (
                <Eye className="w-5 h-5 text-default-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-default-400" />
              )}
            </div>
          </div>
        </div>
        {errors.password && (
          <p className="text-destructive mt-2">{errors.password.message}</p>
        )}

        {/* Remember Me + Forgot Password */}
        <div className="mt-5 mb-8 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="remember_me"
              {...register("remember_me")}
              onCheckedChange={(checked) =>
                setValue("remember_me", checked === true, {
                  shouldValidate: true,
                })
              }
            />
            <Label
              htmlFor="remember_me"
              className="text-sm text-default-600 cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Link href="/auth/forgot" className="text-sm text-primary">
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full flex items-center justify-center gap-2"
          disabled={isPending}
          size={!isDesktop2xl ? "lg" : "md"}
          type="submit"
        >
          {isPending && (
            <Loader className="h-5 w-5 animate-spin text-primary-foreground" />
          )}
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default LogInForm;
