// src/app/admin/providers/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

// Define provider type
interface Provider {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define pagination type
interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ProviderVerification() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const { toast } = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch providers
  const fetchProviders = async (
    page = 1,
    search = searchQuery,
    verified = verificationFilter
  ) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");

      if (search) queryParams.append("search", search);
      // Only add 'verified' param if it's 'true' or 'false'
      if (verified && verified !== "all") {
        queryParams.append("verified", verified);
      }

      const response = await fetch(
        `/api/admin/providers?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch providers");
      }

      const data = await response.json();
      setProviders(data.providers);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast({
        title: "Error",
        description: "Failed to load providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchProviders();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Modify useEffect to watch debounced search
  useEffect(() => {
    fetchProviders(1, debouncedSearchQuery, verificationFilter);
  }, [debouncedSearchQuery, verificationFilter]);

  // // Handle search
  // const handleSearch = () => {
  //   fetchProviders(1, searchQuery, verificationFilter);
  // };

  // Handle verification filter change
  const handleVerificationFilterChange = (value: string) => {
    setVerificationFilter(value);
    fetchProviders(1, searchQuery, value);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    fetchProviders(page, searchQuery, verificationFilter);
  };

  // Open provider details modal
  const openDetailsModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setDetailsModalOpen(true);
  };

  // Open verification action modal
  const openVerificationModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setVerificationModalOpen(true);
  };

  // Handle provider verification
  const handleVerifyProvider = async (isVerified: boolean) => {
    if (!selectedProvider) return;

    try {
      const response = await fetch("/api/admin/providers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId: selectedProvider._id,
          isVerified,
        }),
      });

      // Continuing from src/app/admin/providers/page.tsx

      if (!response.ok) {
        throw new Error("Failed to update provider verification status");
      }

      const data = await response.json();

      // Update provider in list
      setProviders(
        providers.map((provider) =>
          provider._id === selectedProvider._id ? data.provider : provider
        )
      );

      toast({
        title: "Success",
        description: `Provider ${
          isVerified ? "verified" : "unverified"
        } successfully`,
      });

      setVerificationModalOpen(false);
    } catch (error) {
      console.error("Error updating provider verification:", error);
      toast({
        title: "Error",
        description:
          "Failed to update provider verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Provider Verification</h1>

        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex items-center">
            <Select
              value={verificationFilter}
              onValueChange={handleVerificationFilterChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="true">Verified Only</SelectItem>
                <SelectItem value="false">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Updated search input with icon */}
          <div className="relative flex-1 md:w-64">
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="h-4 w-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-gray-500"
                    >
                      No providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  providers.map((provider) => (
                    <TableRow key={provider._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(provider.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-xs text-gray-500">
                              {provider.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{provider.businessName || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            provider.isVerified
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }
                        >
                          {provider.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(provider.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsModal(provider)}
                          >
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Details</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openVerificationModal(provider)}
                          >
                            {provider.isVerified ? (
                              <XCircle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="sr-only">Verify</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} providers
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: pagination.pages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={
                      pagination.page === index + 1 ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => goToPage(index + 1)}
                    className="hidden sm:inline-flex"
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Provider Details Dialog */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedProvider.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedProvider.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedProvider.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">
                    {selectedProvider.businessName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedProvider.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedProvider.isVerified
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }
                  >
                    {selectedProvider.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedProvider.createdAt),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProvider?.isVerified
                ? "Unverify Provider"
                : "Verify Provider"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {selectedProvider?.isVerified ? "unverify" : "verify"} this
              provider?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerificationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedProvider?.isVerified ? "destructive" : "default"}
              onClick={() =>
                handleVerifyProvider(!selectedProvider?.isVerified)
              }
            >
              {selectedProvider?.isVerified ? "Unverify" : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
