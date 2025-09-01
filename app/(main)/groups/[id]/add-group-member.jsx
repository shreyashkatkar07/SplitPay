import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { useConvexQuery } from "@/hooks/use-convex-query";


export default function AddGroupMember({ groupId, onMemberAdded }) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { mutate: addMember, isLoading: isMutating } = useConvexMutation(api.groups.addMember);
  const { data: groupData } = useConvexQuery(api.groups.getGroupExpenses, { groupId });
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  // Compute groupMemberIds safely (empty array if not loaded)
  const groupMemberIds = groupData && groupData.group ? groupData.group.members.map((m) => m.id) : [];
  // Always call searchUsers hook unconditionally
  const searchQuery = search.length >= 2 ? search : "";
  const { data: searchResults, isLoading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery, excludeIds: groupMemberIds }
  );



  // Wait for data to load
  if (!groupData || !groupData.group || !currentUser) return null;

  // Find if current user is admin
  const me = groupData.group.members.find((m) => m.id === currentUser._id);
  const isAdmin = !!(me && me.role === "admin");
  if (!isAdmin) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedUser) return toast.error("Select a user to add");
    setLoading(true);
    try {
      await addMember({ groupId, email: selectedUser.email });
      toast.success("Member added!");
      setSearch("");
      setSelectedUser(null);
      if (onMemberAdded) onMemberAdded();
    } catch (err) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-2 mt-2">
      <Command>
        <CommandInput
          placeholder="Type a name to add..."
          value={search}
          onValueChange={val => {
            setSearch(val);
            if (val.length < 2) setSelectedUser(null);
          }}
          className="flex-1"
        />
        <CommandList>
          {search.length < 2 ? null : isSearching ? (
            <CommandItem disabled>
              <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full align-middle" />
              Searching...
            </CommandItem>
          ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
            searchResults.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => {
                  setSelectedUser(user);
                  setSearch(user.name);
                }}
                className={selectedUser?.id === user.id ? "bg-muted" : ""}
              >
                {user.name} <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
              </CommandItem>
            ))
          ) : (
            <CommandEmpty>No users found matching "{search}"</CommandEmpty>
          )}
        </CommandList>
      </Command>
      <Button type="submit" disabled={loading || isMutating || !selectedUser}>
        {loading || isMutating ? "Adding..." : "Add Member"}
      </Button>
    </form>
  );
}
