import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import type { DayOffStatus } from "@/lib/types";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const maxDemands = 9;

const users = [
  {
    id: 1,
    name: "John Doe",
  },
  {
    id: 2,
    name: "Jane Doe",
  },
];

// Mock function to simulate fetching demands for a user
const fetchDemandsForUser = async (userId: number) => {
  // Replace this with your actual API call
  return [
    { id: 1, status: "pending", date: new Date("2024-04-15") },
    { id: 2, status: "accepted", date: new Date("2024-04-16") },
  ];
};

export function Dashboard() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [demands, setDemands] = useState([]);
  const [remainingDemands, setRemainingDemands] = useState(0);
  const [acceptLoading, setAcceptLoading] = useState<string | null>(null);
  const [refuseLoading, setRefuseLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const isLoading =
    Boolean(acceptLoading) || Boolean(refuseLoading) || Boolean(deleteLoading);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find((user) => user.name === selectedUser);
      if (user) {
        fetchDemandsForUser(user.id).then(setDemands);
      }
    } else {
      setDemands([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    setRemainingDemands(
      maxDemands -
        demands.filter(
          (demand) =>
            demand.status === "pending" || demand.status === "accepted"
        ).length
    );
  }, [demands]);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-900",
    accepted: "bg-green-100 text-green-900",
    refused: "bg-red-100 text-red-900",
  };

  const statusTranslations: Record<DayOffStatus, string> = {
    pending: "À traiter",
    accepted: "Acceptée",
    refused: "Refusée",
  };

  const handleAccept = async (demandId: string) => {
    setAcceptLoading(demandId);
    await api.acceptDayOff(demandId);
    setDemands(
      demands.map((d) => (d.id === demandId ? { ...d, status: "accepted" } : d))
    );
    toast({
      title: "Success",
      description: "Demande de jours de TT acceptée",
    });
    setAcceptLoading(null);
  };

  const handleRefuse = async (demandId: string) => {
    setRefuseLoading(demandId);
    await api.refuseDayOff(demandId);
    setDemands(
      demands.map((d) => (d.id === demandId ? { ...d, status: "refused" } : d))
    );
    toast({
      title: "Success",
      description: "Demande de jours de TT refusée",
    });
    setRefuseLoading(null);
  };

  const handleDelete = async (demandId: string) => {
    setDeleteLoading(demandId);
    await api.cancelDayOff(demandId);
    setDemands(demands.filter((d) => d.id !== demandId));
    toast({
      title: "Success",
      description: "Demande de jours de TT annulée",
    });
    setDeleteLoading(null);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUser
              ? users.find((user) => user.name === selectedUser)?.name
              : "Sélectionner un utilisateur..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher un utilisateur..." />
            <CommandList>
              <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={(currentValue) => {
                      setSelectedUser(
                        currentValue === selectedUser ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {user.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedUser === user.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {demands.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Il reste {remainingDemands} jours de TT exceptionnels à{" "}
            {selectedUser}.
          </h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demands.map((demand) => (
                <tr key={demand.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Badge
                      variant="secondary"
                      className={cn(statusColors[demand.status])}
                    >
                      {statusTranslations[demand.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(demand.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {demand.status === "pending" && (
                      <span className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleAccept(demand.id)}
                          disabled={isLoading}
                        >
                          {acceptLoading === demand.id && (
                            <Loader2 className="animate-spin" />
                          )}
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRefuse(demand.id)}
                          disabled={isLoading}
                        >
                          {refuseLoading === demand.id && (
                            <Loader2 className="animate-spin" />
                          )}
                          Refuser
                        </Button>
                      </span>
                    )}
                    {demand.status === "accepted" && (
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(demand.id)}
                        disabled={isLoading}
                      >
                        {deleteLoading === demand.id && (
                          <Loader2 className="animate-spin" />
                        )}
                        Supprimer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
