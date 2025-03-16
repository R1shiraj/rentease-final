// src/app/provider/appliances/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getProviderAppliances } from "@/app/actions/appliance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, MoreVertical, Pencil } from "lucide-react";
import DeleteApplianceButton from "@/components/provider/DeleteApplianceButton";

export default async function AppliancesPage() {
  const {
    success,
    data: appliances = [],
    error,
  } = await getProviderAppliances();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appliances</h1>
        <Link href="/provider/appliances/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Appliance
          </Button>
        </Link>
      </div>

      {!success && <div className="text-red-500">{error}</div>}

      {success && appliances.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/50">
          <Package className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">No appliances added yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by adding your first appliance to rent out to customers.
          </p>
          <Link href="/provider/appliances/new">
            <Button className="mt-4">Add New Appliance</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appliances.map((appliance: any) => (
            <Card key={appliance._id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                {appliance.images && appliance.images.length > 0 ? (
                  <Image
                    src={appliance.images[0]}
                    alt={appliance.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    className={`${
                      appliance.status === "AVAILABLE"
                        ? "bg-green-500"
                        : appliance.status === "RENTED"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {appliance.status}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-1 text-lg">
                    {appliance.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/provider/appliances/${appliance._id}`}>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DeleteApplianceButton id={appliance._id} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {appliance.description}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm font-medium">
                  ₹{appliance.pricing.daily}/day
                </div>
                <Link href={`/provider/appliances/${appliance._id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
