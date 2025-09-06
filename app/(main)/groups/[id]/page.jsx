"use client";

import ExpenseList from "@/components/expense-list";
import { GroupBalances } from "@/components/group-balances";
import GroupMembers from "@/components/group-members";
import { ParticipantSelector } from "@/app/(main)/expenses/new/components/participant-selector";
import LeaveGroup from "./leave-group";
import AddGroupMember from "./add-group-member";
import DeleteGroup from "./delete-group";
import SettlementsList from "@/components/settlements-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { ArrowLeft, ArrowLeftRight, PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { BarLoader } from "react-spinners";

const GroupPage = () => {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  const { data, isLoading, error } = useConvexQuery(
    api.groups.getGroupExpenses,
    { groupId: params.id }
  );
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);

  // Defensive: redirect if not a member or error
  React.useEffect(() => {
    if (error && error.message) {
      if (
        error.message.includes("not a member") ||
        error.message.includes("Group not found")
      ) {
        router.replace("/dashboard");
      }
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }
  if (
    error &&
    error.message &&
    (error.message.includes("Group not found") ||
      error.message.includes("not a member"))
  ) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Group not accessible</h2>
        <p className="mb-4">
          The group you are looking for does not exist, has been deleted, or you
          are no longer a member.
        </p>
        <Button onClick={() => router.replace("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const group = data?.group;
  const members = group?.members || [];
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balances = data?.balances || [];
  const userLookupMap = data?.userLookupMap || {};
  const isAdmin = (() => {
    if (!group || !currentUser) return false;
    const me = group.members.find((m) => m.id === currentUser._id);
    return me && me.role === "admin";
  })();

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant={"outline"}
          className={"mb-4"}
          size={"sm"}
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-md p-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl gradient-title">{group?.name}</h1>
              <p className="text-muted-foreground">{group?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} members
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant={"outline"}>
              <Link href={`/settlements/group/${params.id}`}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Settle Up
              </Link>
            </Button>
            <Button
              variant={"default"}
              onClick={() => router.push("/expenses/new?tab=group")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className={"pb-2"}>
              <CardTitle className={"text-xl"}>Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupBalances balances={balances} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className={"pb-2"}>
              <CardTitle className={"text-xl"}>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupMembers members={members} />
              {/* {isAdmin ? (
                  <>
                    <AddGroupMember groupId={params.id} />
                    <DeleteGroup groupId={params.id} onDeleted={() => router.replace('/dashboard')} />
                  </>
                ) : (
                  <LeaveGroup groupId={params.id} onLeft={() => router.replace('/dashboard')} />
                )} */}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className={"grid w-full grid-cols-2"}>
          <TabsTrigger value="expenses">
            Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="settlements">
            Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className={"space-y-4"}>
          <ExpenseList
            expenses={expenses}
            showOtherPerson={true}
            isGroupExpense={true}
            userLookupMap={userLookupMap}
          />
        </TabsContent>
        <TabsContent value="settlements" className={"space-y-4"}>
          <SettlementsList
            settlements={settlements}
            isGroupSettlement={true}
            userLookupMap={userLookupMap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupPage;
