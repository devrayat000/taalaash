import { createFileRoute } from "@tanstack/react-router";

("use client");

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import bgBlack from "@/assets/bg_black.jpeg?url";
import logoSingle from "@/assets/logo_single.png?url";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

function SigninPage({
  searchParams,
}: {
  searchParams?: { callbackUrl: string };
}) {
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLogin = form.handleSubmit((data) => {
    return signIn("admin", {
      callbackUrl: searchParams?.callbackUrl || "/admin",
      redirect: true,
      ...data,
    });
  });

  return (
    <div className="w-full lg:grid lg:grid-cols-2">
      <div className="relative flex items-center justify-center py-12 h-screen lg:h-auto isolate">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="flex justify-center">
            <img
              src={logoSingle}
              alt="logo"
              className="w-44 md:w-60 lg:w-auto"
            />
          </div>
          <Form {...form}>
            <form className="grid gap-4" onSubmit={onLogin}>
              <FormField
                name="username"
                control={form.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <FormControl>
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        required
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                rules={{ required: true }}
                control={form.control}
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        required
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <img
          src={bgBlack}
          alt="Image"
          className="object-cover w-full lg:max-h-screen"
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin/_auth/signin")({
  component: SigninPage,
});
