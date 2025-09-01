import { Bell, CreditCard, PieChart, Receipt, Users } from "lucide-react";

export const FEATURES = [
  {
    title: "1:1 Expenses",
    Icon: Receipt,
    bg: "bg-blue-100",
    color: "text-blue-600",
    description:
      "Easily split and settle expenses directly with a single friend—perfect for lunches, rides, or any one-on-one activity.",
  },
  {
    title: "Group Expenses",
    Icon: Users,
    bg: "bg-green-100",
    color: "text-green-600",
    description:
      "Create groups for roommates, trips, or events to keep expenses organized.",
  },
  {
    title: "Multiple Split Types",
    Icon: Receipt,
    bg: "bg-green-100",
    color: "text-green-600",
    description:
    "Split equally, by percentage, or by exact amounts to fit any scenario.",
  },
  {
    title: "Controlled Settlements",
    Icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v8m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    bg: "bg-purple-100",
    color: "text-purple-600",
  description: "Only the person who is owed can settle up—adding a layer of control and security not found in Splitwise.",
    unique: true,
  },
  {
    title: "Real-time Updates",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 14v8M15 14v8M9 2v6M15 2v6" />
      </svg>
    ),
    bg: "bg-teal-100",
    color: "text-teal-600",
    description:
      "See new expenses and repayments the moment your friends add them.",
  },
  {
    title: "Payment Reminders",
    Icon: Bell,
    bg: "bg-amber-100",
    color: "text-amber-600",
    description:
      "Automated reminders for pending debts and insights on spending patterns.",
    upcoming: true,
  },
  {
    title: "Expense Analytics",
    Icon: PieChart,
    bg: "bg-green-100",
    color: "text-green-600",
    description:
      "Track spending patterns and discover insights about your shared costs.",
    upcoming: true,
  },
  {
    title: "Recurring Expenses",
    Icon: CreditCard,
    bg: "bg-blue-100",
    color: "text-blue-600",
    description:
      "Automatically add repeating expenses for subscriptions, rent, and more.",
    upcoming: true,
  },
];

export const STEPS = [
  {
    label: "1",
    title: "Start or Select a Group/Person",
    description:
      "Create a group for shared expenses or pick a friend for 1:1 splits.",
  },
  {
    label: "2",
    title: "Add an Expense",
    description:
      "Enter the amount, choose who paid, and split the bill your way.",
  },
  {
    label: "3",
    title: "Settle Up Securely",
    description: "See balances and let the person who is owed record the payment.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "SplitPay has made managing shared expenses effortless and transparent. I always know exactly who owes what, and settling up is a breeze.",
    name: "Arjun Mehra",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Product Manager",
  },
  {
    quote:
      "The accuracy and clarity of SplitPay's calculations have saved me countless hours. It's the best tool for group and personal expense tracking.",
    name: "Rohan Singh",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    role: "Finance Consultant",
  },
  {
    quote:
      "With SplitPay, I never have to worry about missed payments or confusion over shared costs. Highly recommended for anyone sharing expenses.",
    name: "Vikram Desai",
    image: "https://randomuser.me/api/portraits/men/65.jpg",
    role: "Software Engineer",
  },
];