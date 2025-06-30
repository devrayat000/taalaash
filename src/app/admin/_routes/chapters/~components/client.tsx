"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// import { ApiList } from "@/components/ui/api-list";

import { columns } from "./columns";
import Link from "next/link";
import { deleteManyChapters } from "@/server/chapter/action/chapter";
import { useServerTableStore } from "@/providers/server-table-provider";

interface ChaptersClientProps {}

export const ChaptersClient: React.FC<ChaptersClientProps> = () => {
  const { count } = useServerTableStore();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Chapters (${count})`}
          description="Manage chapters for your products"
        />
        <Button asChild>
          <Link href="/admin/chapters/new">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </Button>
      </div>
      <Separator />
      <DataTable
        searchKey="name"
        columns={columns}
        deleteAction={deleteManyChapters}
      />
      <Heading title="API" description="API Calls for Chapters" />
      <Separator />
      {/* <ApiList entityName="chapters" entityIdName="chapterId" /> */}
    </>
  );
};
