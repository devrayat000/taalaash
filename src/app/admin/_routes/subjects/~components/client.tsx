"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// import { ApiList } from "@/components/ui/api-list";

import { columns } from "./columns";
import { deleteManySubjects } from "@/server/subject/action/subject";
import { useServerTableStore } from "@/providers/server-table-provider";

interface SubjectsClientProps {}

export const SubjectsClient: React.FC<SubjectsClientProps> = () => {
  const { count } = useServerTableStore();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Subjects (${count})`}
          description="Manage subjects for your products"
        />
        <Button asChild>
          <Link href="/admin/subjects/new">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        deleteAction={deleteManySubjects}
      />
      <Heading title="API" description="API Calls for Subjects" />
      <Separator />
      {/* <ApiList entityName="subjects" entityIdName="subjectId" /> */}
    </>
  );
};
