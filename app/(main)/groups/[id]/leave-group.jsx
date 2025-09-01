import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LeaveGroup({ groupId }) {
  const { mutate: leaveGroup, isLoading } = useConvexMutation(api.groups.leaveGroup);
  const router = useRouter();
  const [left, setLeft] = useState(false);

  useEffect(() => {
    if (left) {
      router.replace("/dashboard");
    }
  }, [left, router]);

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await leaveGroup({ groupId });
      toast.success("You left the group.");
      setLeft(true);
    } catch (err) {
      toast.error(err.message || "Failed to leave group");
      setLeft(false);
    }
  };
  if (left) return null;
  return (
    <Button variant="destructive" onClick={handleLeave} className="mt-2 w-full" disabled={isLoading}>
      {isLoading ? "Leaving..." : "Leave Group"}
    </Button>
  );
}
