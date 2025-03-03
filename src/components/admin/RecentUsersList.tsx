// src/components/admin/RecentUsersList.tsx
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "PROVIDER" | "ADMIN";
  createdAt: string;
}

interface RecentUsersListProps {
  users: User[];
}

export default function RecentUsersList({ users }: RecentUsersListProps) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No recent users found
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "PROVIDER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="divide-y overflow-x-scroll w-auto">
      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className={`${getRoleBadgeColor(user.role)} text-xs`}
            >
              {user.role}
            </Badge>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
