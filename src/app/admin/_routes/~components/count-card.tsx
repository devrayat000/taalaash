import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CountCardProps {
	name: string;
	count: number;
	icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export default function CountCard({ count, name, icon: Icon }: CountCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 flex-nowrap">
				<CardTitle className="text-xs md:text-sm font-medium flex-1">
					Total {name} Count
				</CardTitle>
				{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{count}</div>
			</CardContent>
		</Card>
	);
}
