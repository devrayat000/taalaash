import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import bgBlack from "@/assets/bg_black.jpeg?url";
import logoSingle from "@/assets/logo_single.png?url";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client";
import { Label } from "@/components/ui/label";

function SigninPage() {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			return authClient.admin.createUser({
				name: "TeamTaalaash",
				email: value.email,
				password: value.email,
				role: "admin", // this can also be an array for multiple roles (e.g. ["user", "sale"])
			});
			// await authClient.signIn.email({
			// 	email: value.email,
			// 	password: value.password,
			// 	rememberMe: true,
			// 	fetchOptions: {
			// 		onError(context) {
			// 			console.log(context);
			// 		},
			// 	},
			// });
		},
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
					<form className="grid gap-4" onSubmit={form.handleSubmit}>
						<form.Field name="email">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>E-mail</Label>
									<Input
										id={field.name}
										name={field.name}
										type="email"
										placeholder="john@doe.com"
										required
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
								</div>
							)}
						</form.Field>
						<form.Field name="password">
							{(field) => (
								<div className="grid gap-2">
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										name={field.name}
										type="password"
										placeholder="johndoe"
										required
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
								</div>
							)}
						</form.Field>

						<Button type="submit" className="w-full">
							Login
						</Button>
					</form>
				</div>
			</div>
			<div className="hidden bg-muted lg:block">
				<img
					src={bgBlack}
					alt="Background"
					className="object-cover w-full lg:max-h-screen"
				/>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/admin/_auth/signin")({
	component: SigninPage,
});
