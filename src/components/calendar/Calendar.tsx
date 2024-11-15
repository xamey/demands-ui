import { DayOffList } from "./DayOffList";
import { DayOffCalendar } from "./DayOffCalendar";
import { useState, useEffect } from "react";
import type { DayOff, User } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function Calendar({ user }: { user: User }) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [isLoadingDayOffs, setIsLoadingDayOffs] = useState(false);
  const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
  const { toast } = useToast();

  const maxDayOffs = 9;

  const getDayOff = (date: Date): DayOff | undefined => {
    return dayOffs.find(
      (d) =>
        d.date.toISOString().split("T")[0] === date.toISOString().split("T")[0]
    );
  };
  const loadDayOffs = async () => {
    try {
      setIsLoadingDayOffs(true);

      const data = await api.getDayOffs();
      setDayOffs(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Erreur lors du chargement des jours de TT",
      });
    } finally {
      setIsLoadingDayOffs(false);
    }
  };

  const handleDateSelect = async (date: Date) => {
    const dayOff = getDayOff(date);
    if (dayOff) {
      return;
    }

    const totalDayOffs = dayOffs.filter(
      (d) => d.status === "pending" || d.status === "accepted"
    ).length;

    if (totalDayOffs >= maxDayOffs) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Vous avez atteint le nombre maximum de jours de TT",
      });
      return;
    }

    try {
      const newDayOff = await api.createDayOff(date);
      setDayOffs([...dayOffs, newDayOff]);

      toast({
        title: "Success",
        description: "Demande de jours de TT créée",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Erreur lors de la création de la demande de jours de TT",
      });
    }
  };

  const handleCancelDayOff = async (id: string) => {
    setCancelingId(id);
    try {
      await api.cancelDayOff(id);
      setDayOffs(dayOffs.filter((d) => d.id !== id));
      toast({
        title: "Success",
        description: "Demande de jours de TT annulée",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Erreur lors de l'annulation de la demande de jours de TT",
      });
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    loadDayOffs();

    return () => {
      setDayOffs([]);
    };
  }, []);

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-lg">
          Bonjour {user?.name}, Jours de TT exceptionnels restants:{" "}
          {maxDayOffs -
            dayOffs.filter(
              (d) => d.status === "pending" || d.status === "accepted"
            ).length}{" "}
          jours
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <DayOffCalendar
          dayOffs={dayOffs}
          onSelectDate={handleDateSelect}
          className="bg-white p-4"
        />
        <DayOffList
          dayOffs={dayOffs}
          onCancel={handleCancelDayOff}
          cancelingId={cancelingId}
          isLoadingDayOffs={isLoadingDayOffs}
        />
      </div>
    </>
  );
}
