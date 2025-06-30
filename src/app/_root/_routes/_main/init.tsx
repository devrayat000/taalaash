import { createFileRoute } from '@tanstack/react-router';

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Asterisk } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormLabel,
  Form,
  FormControl,
  FormItem,
  FormField,
} from "@/components/ui/form";
import { saveInstitutionalInfo } from "@/server/institutionalInfo/action/institutionalInfos";
import { useRouter } from "next/navigation";

const schema = z.object({
  hscYear: z.string().length(4, "HSC year must be 4 digits"),
  college: z.string().min(1, "College name is required"),
});

function InitPage({
  searchParams,
}: {
  searchParams: { callbackUrl: string };
}) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      hscYear: "",
      college: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    await saveInstitutionalInfo(data);
    const url = new URL(searchParams.callbackUrl);
    router.replace(url.pathname);
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Additonal Info</CardTitle>
        <CardDescription>
          These informations are required to provide you with the best possible
          experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="grid gap-4" id="init-form">
            <FormField
              control={form.control}
              name="hscYear"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="hscYear" className="flex items-start">
                    HSC Year{" "}
                    <Asterisk className="stroke-red-500 w-3 h-3 ml-px" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="hscYear"
                      type="text"
                      placeholder="2024"
                      required
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="college"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <FormLabel htmlFor="college" className="flex items-start">
                    College{" "}
                    <Asterisk className="stroke-red-500 w-3 h-3 ml-px" />
                  </FormLabel>
                  <FormControl>
                    <Input id="college" type="text" required {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full font-bangla bg-card-result hover:bg-card-result/90"
          size="lg"
          // onClick={onSubmit}
          type="submit"
          form="init-form"
        >
          এগিয়ে যাও
        </Button>
      </CardFooter>
    </Card>
  );
}


export const Route = createFileRoute('/_root/_routes/_main/init')({
  component: InitPage
});
