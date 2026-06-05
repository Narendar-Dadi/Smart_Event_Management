import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileView() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8">Profile</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
        <div>
          <label className="text-sm text-slate-500">Name</label>
          <p className="font-semibold text-lg">{user?.name}</p>
        </div>
        <div>
          <label className="text-sm text-slate-500">Email</label>
          <p className="font-semibold text-lg">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm text-slate-500">Role</label>
          <p className="font-semibold text-lg capitalize">{user?.role}</p>
        </div>
        <div>
          <label className="text-sm text-slate-500">User ID</label>
          <p className="font-mono text-sm text-slate-600 dark:text-slate-400">{user?._id}</p>
        </div>
      </div>
    </div>
  );
}
