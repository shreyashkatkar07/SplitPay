import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-mutation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DeleteGroup({ groupId }) {
  const { mutate: deleteGroup, isLoading } = useConvexMutation(api.groups.deleteGroup);
  const router = useRouter();
  const [deleted, setDeleted] = useState(false);
  useEffect(() => {
    if (deleted) {
      router.replace("/dashboard");
    }
  }, [deleted, router]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this group? This cannot be undone.")) return;
    try {
      await deleteGroup({ groupId });
      toast.success("Group deleted.");
      setDeleted(true);
    } catch (err) {
      toast.error(err.message || "Failed to delete group");
      setDeleted(false);
    }
  };
  if (deleted) return null;
  return (
    <Button variant="destructive" onClick={handleDelete} className="mt-2 w-full" disabled={isLoading}>
      {isLoading ? "Deleting..." : "Delete Group"}
    </Button>
  );
}
