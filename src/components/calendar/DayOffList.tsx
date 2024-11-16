import type { DayOff, DayOffStatus } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { fr } from "date-fns/locale";

interface DayOffListProps {
  dayOffs: DayOff[];
  onCancel: (id: string) => void;
  cancelingId: string | null;
  isLoadingDayOffs: boolean;
}

export function DayOffList({
  dayOffs,
  onCancel,
  cancelingId,
  isLoadingDayOffs,
}: DayOffListProps) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-900",
    approved: "bg-green-100 text-green-900",
    refused: "bg-red-100 text-red-900",
  };

  const statusTranslations: Record<DayOffStatus, string> = {
    pending: "demande en cours",
    approved: "demande acceptée",
    refused: "demande refusée",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes de jours de TT</CardTitle>
        <CardDescription>Gérer vos demandes de jours de TT</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isLoadingDayOffs &&
            dayOffs.map((dayOff) => (
              <div
                key={dayOff.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {format(new Date(dayOff.date), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <Badge
                    variant="secondary"
                    className={statusColors[dayOff.status]}
                  >
                    {statusTranslations[dayOff.status]}
                  </Badge>
                </div>
                {dayOff.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(dayOff.id)}
                    disabled={cancelingId !== null}
                  >
                    <span className="flex items-center gap-4">
                      {cancelingId === dayOff.id && (
                        <Loader2 className="animate-spin" />
                      )}
                      Annuler
                    </span>
                  </Button>
                )}
              </div>
            ))}
          {!isLoadingDayOffs && dayOffs.length === 0 && (
            <p className="text-center text-muted-foreground">
              Aucune demande de jours de TT pour le moment
            </p>
          )}
          {isLoadingDayOffs && (
            <div className="flex justify-center align-middle">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
