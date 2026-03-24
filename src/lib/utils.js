import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getStatusStyles(status) {
  const s = (status || "").toLowerCase();
  switch (true) {
    case s === "urgent":
      return "bg-red-50 text-red-700 border-red-200";
    case s === "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case s === "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case ["review", "draft"].includes(s):
      return "bg-purple-50 text-purple-700 border-purple-200";
    case ["serve", "attend court"].includes(s):
      return "bg-blue-50 text-blue-700 border-blue-200";
    case ["approve framework"].includes(s):
      return "bg-teal-50 text-teal-700 border-teal-200";
    case ["file", "sign"].includes(s):
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
