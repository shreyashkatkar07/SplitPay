import { useConvex } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export function useConvexAction(action) {
  const convex = useConvex();
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const run = async (args) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await convex.action(action, args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { run, data, isLoading, error };
}
