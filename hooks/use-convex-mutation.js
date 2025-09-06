import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

// Custom hook to run Convex mutations with loading and error state
export const useConvexMutation = (mutation) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mutationFn(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
