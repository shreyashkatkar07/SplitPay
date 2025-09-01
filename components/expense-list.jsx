
// ExpenseList displays a list of expenses with details, split info, and delete functionality.
// Uses custom hooks for Convex backend and UI components for consistent design.
import { api } from '@/convex/_generated/api'
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query'
import React from 'react'
import { Card, CardContent,} from './ui/card';
import { getCategoryById, getCategoryIcon } from '@/lib/expense-categories';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


// ExpenseList component props:
// - expenses: array of expense objects to display
// - showOtherPerson: whether to show who paid
// - isGroupExpense: whether this is a group expense
// - otherPersonId: id of the other person (for 1:1 expenses)
// - userLookupMap: map of userId to user details
const ExpenseList = ({
    expenses,
    showOtherPerson = true,
    isGroupExpense = false,
    otherPersonId = null,
    userLookupMap = {},
}) => {
    // Fetch current user info from backend
    const {data: currentUser} = useConvexQuery(api.users.getCurrentUser);
    // Mutation hook to delete an expense
    const deleteExpense = useConvexMutation(api.expenses.deleteExpense);

    // Show message if no expenses
    if (!expenses || expenses.length === 0) {
        return(
            <Card>
                <CardContent className={"py-8 text-center text-muted-foreground"}>
                    No expenses found.
                </CardContent>
            </Card>
        );
    }

    // Helper to get user details for display
    const getUserDetails = (userId) => {
        return {
            name:
             userId === currentUser?._id 
               ? "You" 
               : userLookupMap[userId]?.name || "Other User",
            imageUrl: null, // Placeholder for avatar
            id: userId,
        };
    };

    // Check if current user can delete the expense
    const canDeleteExpense = (expense) =>{
        if(!currentUser) return false;
        return(
            expense.createdBy === currentUser._id ||
            expense.paidByUserId === currentUser._id
        );
    };

    // Handle deleting an expense with confirmation and toast feedback
    const handleDeleteExpense = async (expense) => {
        const confirmed = confirm("Are you sure you want to delete this expense? This action cannot be undone.");
        if (!confirmed) return;
        try{
            await deleteExpense.mutate({expenseId: expense._id});
            toast.success("Expense deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete expense." + error.message);
        }
    };


  // Render the list of expenses
  return (
    <div className='flex flex-col gap-4'>
        {expenses.map((expense) =>{
            // Get payer details and category info
            const payer = getUserDetails(expense.paidByUserId);
            const isCurrentUserPayer = expense.paidByUserId === currentUser?._id;
            const category = getCategoryById(expense.category);
            const CategoryIcon = getCategoryIcon(category.id);
            const showDeleteOption = canDeleteExpense(expense);

            return(
                <Card key={expense._id} >
                    <CardContent className={"py-4"}>
                        <div className='flex items-center justify-between'>
                            {/* Expense icon and description */}
                            <div className='flex items-center gap-3'>
                                <div className='bg-primary/10 p-2 rounded-full'>
                                    <CategoryIcon className="h-5 w-5 text-primary" />
                                </div>

                                <div>
                                    <h3 className='font-medium'>{expense.description}</h3>
                                    <div className='text-sm text-muted-foreground gap-2 flex items-center'>
                                        <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                                        {showOtherPerson && (
                                            <>
                                              <span>•</span>
                                              <span>{isCurrentUserPayer ? "You" : payer.name} paid</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Amount, group badge, and delete button */}
                            <div className='flex items-center gap-2'>
                                <div className='text-right'>
                                    <div className='font-medium'>₹{expense.amount.toFixed(2)}</div>
                                    
                                    {isGroupExpense ? (
                                        <Badge className={"mt-1"} variant={"outline"}>Group expense</Badge>
                                    ) : (
                                        <div className='text-sm text-muted-foreground'>
                                            {isCurrentUserPayer ? (
                                                <span className='text-green-600'>You paid</span>
                                            ) : (
                                                <span className='text-red-600'>{payer.name} paid</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Show delete button if user can delete */}
                                {showDeleteOption && (
                                    <Button 
                                        variant={"ghost"}
                                        size={"icon"}
                                        className={"h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"}
                                        onClick={()=> handleDeleteExpense(expense)}>
                                        <Trash2 className='h-4 w-4' />
                                        <span className='sr-only'>Delete expense</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Render splits for each user involved in the expense */}
                        <div className='mt-3 text-sm flex gap-2 flex-wrap '>
                            {expense.splits.map((split, idx)=>{
                                const splitUser = getUserDetails(split.userId, expense);
                                const isCurrentUser = split.userId === currentUser?._id;
                                
                                return(
                                    <Badge key={idx} variant={split.paid ? "outline" : "secondary"} className={"flex items-center gap-1"}>
                                        <Avatar className={"h-4 w-4"}>
                                            <AvatarFallback>{splitUser.name?.charAt(0) || "?"}</AvatarFallback>
                                        </Avatar>
                                        <span>
                                            {isCurrentUser ? "You" : splitUser.name}: ₹
                                            {split.amount.toFixed(2)}
                                        </span>
                                    </Badge>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )
        })}
    </div>
  )
}


// Export the ExpenseList component for use in other parts of the app
export default ExpenseList