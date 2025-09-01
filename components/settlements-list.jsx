
// Import Convex API, custom hooks, and UI components
import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-convex-query'
import React from 'react'
import { Card, CardContent } from './ui/card';
import { ArrowLeftRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';


// SettlementsList displays a list of settlements (payments) between users
const SettlementsList = ({
  settlements,
  isGroupSettlement = false,
  userLookupMap,
}) => {
  // Fetch current user info from backend
  const {data: currentUser}  = useConvexQuery(api.users.getCurrentUser);

  // If no settlements, show message
  if(!settlements || settlements.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No settlements found.
        </CardContent>
      </Card>
    );
  }

  // Helper to get user details for display
  const getUserDetails = (userId) => {
    return {
      name: userId === currentUser?._id ? "You" : userLookupMap[userId]?.name || "Other User",
      imageUrl: null, // Placeholder for avatar
      id: userId,
    };
  };

  // Render the list of settlements
  return (
    <div className='flex flex-col gap-4'>
        {settlements.map((settlement) =>{
            // Get payer and receiver details
            const payer = getUserDetails(settlement.paidByUserId);
            const reciever = getUserDetails(settlement.receivedByUserId);
            // Check if current user is payer or receiver
            const isCurrentUserPayer = settlement.paidByUserId === currentUser?._id;
            const isCurrentUserReceiver = settlement.receivedByUserId === currentUser?._id;

            return(
                <Card key={settlement._id} className={"hover:bg-muted/30 transition-colors"} >
                    <CardContent className={"py-4"}>
                        <div className='flex items-center justify-between'>
                            {/* Settlement icon and description */}
                            <div className='flex items-center gap-3'>
                                <div className='bg-primary/10 p-2 rounded-full'>
                                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                                </div>

                                <div>
                                    <h3 className='font-medium'>
                                      {/* Show who paid whom */}
                                      {isCurrentUserPayer 
                                        ? `You paid ${reciever.name}` 
                                        : isCurrentUserReceiver 
                                        ? `${payer.name} paid you` 
                                        : `${payer.name} paid ${reciever.name}` }
                                    </h3>
                                    <div className='text-sm text-muted-foreground gap-2 flex items-center'>
                                        <span>{format(new Date(settlement.date), "MMM d, yyyy")}</span>
                                        {/* Show note if present */}
                                        {settlement.note && (
                                            <>
                                              <span>•</span>
                                              <span>{settlement.note}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Amount and status */}
                            <div className='text-right'>
                              <div className='font-medium'>₹{settlement.amount.toFixed(2)}</div>
                              {isGroupSettlement ? (
                                <Badge className={"mt-1"} variant={"outline"}>Group settlement</Badge>
                              ) : (
                                  <div className='text-sm text-muted-foreground'>
                                    {isCurrentUserPayer ? (
                                      <span className='text-amber-600'>You paid</span>
                                    ) : isCurrentUserReceiver ? (
                                      <span className='text-green-600'>You received</span>
                                    ) : (
                                      <span>Payment</span>
                                    )}
                                  </div>
                              )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        })}
    </div>
  );
}


// Export the SettlementsList component for use in other parts of the app
export default SettlementsList