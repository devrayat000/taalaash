import { createFileRoute } from "@tanstack/react-router";

import { SubjectForm } from "./~components/subject-form";
import { getSubjectByIdFn } from "@/server/subject/function";

const SizePage = async ({ params }: { params: { subjectId: string } }) => {
	let initialData = null;

	if (params.subjectId !== "new") {
		// initialData = await getSubjectById(params.subjectId);
	}

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				{/* <SubjectForm initialData={initialData} /> */}
			</div>
		</div>
	);
};

export const Route = createFileRoute("/admin/_routes/subjects/$subjectId")({
	component: SizePage,
});
