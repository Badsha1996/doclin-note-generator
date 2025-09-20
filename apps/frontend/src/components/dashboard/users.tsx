import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { FormSchema, type registerTypes } from "@/types/type";
import { useApi, useApiMutation } from "@/hook/useApi";
import {
  registerResponseSchema,
  type AllUserResponse,
  type ApiError,
  type RegisterResponse,
} from "@/types/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
type ApiResponse = RegisterResponse;
function Users() {
  // const [showActive, setShowActive] = useState("all");
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // track which row menu is open
  const menuRef = useRef<HTMLTableCellElement>(null);
  const form = useForm<registerTypes>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmpassword: "",
    },
  });
  const { data, isLoading, isError, refetch } = useApi<AllUserResponse>({
    endpoint: "/user/all", // replace with your endpoint
    method: "GET",
    queryParams: {
      skip: 0,
      limit: 100,
    },
  });
  const mutation = useApiMutation<
    ApiResponse,
    Omit<registerTypes, "confirmpassword">
  >(
    {
      endpoint: "/user/create",
      method: "POST",
      payloadSchema: FormSchema.omit({ confirmpassword: true }),
      responseSchema: registerResponseSchema,
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "Registration successful!");
        form.reset();
        handleCloseDialog();
        refetch();
      },
      onError: (error: ApiError) => {
        toast.error(error.message || "Registration failed. Please try again.");
      },
    }
  );

  function onSubmit(data: registerTypes) {
    const { confirmpassword, ...payload } = data;
    mutation.mutate(payload);
  }

  const handleCloseDialog = () => {
    setOpen(false);
  };
  function formatDate(dateString: string | Date) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  }
  const users = data?.data.users || [];

  return (
    <>
      <div className="flex py-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button
              variant="standOut"
              className="relative overflow-hidden group shadow-lg ml-auto"
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Add New User</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none">
            <DialogHeader>
              <DialogTitle className="text-slate-800 my-3">
                Create new user
              </DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your username"
                              variant="custom"
                              {...field}
                              className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              variant="custom"
                              {...field}
                              className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800">
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              variant="custom"
                              placeholder="••••••••"
                              {...field}
                              className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmpassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              variant="custom"
                              placeholder="••••••••"
                              {...field}
                              className="bg-slate-800/20 border-slate-800/30 text-slate-800/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex justify-center mt-2"
                    >
                      <Button
                        type="submit"
                        variant="standOut"
                        className="w-full max-w-xs py-2 rounded-md font-semibold"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full ">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg p-6">
          {/* <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Users</h2>
            <select
              value={showActive}
              onChange={(e) => setShowActive(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 outline-none backdrop-blur-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div> */}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white/80 border-b border-white/20">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Joined At</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-white/50 italic"
                    >
                      Loading users...
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-2 text-white">{user.username}</td>
                    <td className="px-4 py-2 text-white/80">{user.email}</td>
                    <td className="px-4 py-2 text-white/80">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          !user.blocked
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {!user.blocked ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2 text-center relative"
                      ref={menuRef}
                    >
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === user.id ? null : user.id)
                        }
                        className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30"
                      >
                        ⋮
                      </button>

                      {openMenu === user.id && (
                        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-sm text-white z-10">
                          <button className="block w-full text-left px-4 py-2 hover:bg-white/20">
                            {!user.blocked ? "Block" : "Unblock"}
                          </button>
                          <button className="block w-full text-left px-4 py-2 hover:bg-white/20">
                            Send Email
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20">
                            Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-white/50 italic"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Users;
