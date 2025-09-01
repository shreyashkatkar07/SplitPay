
// Mark this file as a Client Component (Next.js)
"use client";


// Import Convex API and custom hook for fetching user data
import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-convex-query'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';


// GroupMembers displays a list of group members with avatars and roles
const GroupMembers = ({members}) => {
  // Fetch current user info from backend
  const  {data: currentUser} = useConvexQuery(api.users.getCurrentUser);

  // If no members, show message
  if(!members || members.length === 0) {
    return (
      <div className='text-center  py-4 text-muted-foreground'>
        No members in this group.
      </div>
    );
  }

  // Render the list of members
  return (
    <div className='space-y-3'>
      {members.map((member)=>{
        // Check if this member is the current user
        const isCurrentUser = member.id === currentUser?._id;
        // Check if this member is an admin
        const isAdmin = member.role === 'admin';

        return (
          <div className='flex items-center justify-between' key={member.id}>
            <div className='flex items-center gap-2'>
              {/* Show member avatar */}
              <Avatar className={"h-8 w-8"}>
                <AvatarImage src={member.imageUrl} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className='flex items-center gap-2'>
                  {/* Show member name */}
                  <span className='text-sm font-medium'>
                    {member.name}
                  </span>
                  {/* Show 'You' badge if current user */}
                  {isCurrentUser && (
                    <Badge variant={"outline"} className={"text-xs py-0 h-5"}>
                      You
                    </Badge>
                  )}
                </div>
                {/* Show 'Admin' label if admin */}
                {isAdmin && (
                  <span className='text-xs text-muted-foreground'>Admin</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

// Export the GroupMembers component for use in other parts of the app
export default GroupMembers