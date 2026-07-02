import { MapPin } from "lucide-react";

export default function ConflictTracker() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-misleading/10 border border-misleading/20 flex items-center justify-center mx-auto mb-5">
          <MapPin size={28} className="text-misleading" />
        </div>
        <h2 className="text-xl font-semibold text-white/90 mb-2">
          Conflict Tracker
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Coming soon — real-time conflict monitoring by state and LGA.
          Track incidents, security updates, and verified reports across Nigeria.
        </p>
      </div>
    </div>
  );
}
