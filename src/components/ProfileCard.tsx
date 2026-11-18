import {
  Zap,
  Play,
  Edit3,
  Trash2,
  Plus,
  EyeOff,
  Minimize2,
  VolumeX,
  Rocket,
  FileImage,
} from "lucide-react";
import type { Profile } from "../types";

interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  onTrigger: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}

const ruleCountByAction = (profile: Profile, action: string) =>
  profile.app_rules.filter(r => r.action === action).length;

export default function ProfileCard({
  profile,
  isActive,
  onTrigger,
  onEdit,
  onDelete,
  onSetActive,
}: ProfileCardProps) {
  const hideCount = ruleCountByAction(profile, "hide");
  const minimizeCount = ruleCountByAction(profile, "minimize");
  const muteCount = ruleCountByAction(profile, "mute_audio");

  return (
    <div
      className={`brutal-card relative transition-all ${
        isActive ? "!border-brutalist-accent !border-4 bg-yellow-50" : ""
      }`}
    >
      {isActive && (
        <div className="absolute -top-3 -right-2">
          <span className="brutal-badge bg-brutalist-accent text-black">ACTIVE</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{profile.icon}</span>
          <h3 className="text-lg font-black">{profile.name}</h3>
        </div>
        <div className="flex gap-1">
          <button
            className="p-1.5 border-2 border-black hover:bg-brutalist-accent transition-colors"
            onClick={onEdit}
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1.5 border-2 border-black hover:bg-brutalist-danger hover:text-white transition-colors"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 mb-4">
        {hideCount > 0 && (
          <span className="brutal-badge bg-brutalist-danger text-white">
            <EyeOff className="w-3 h-3 mr-1" /> {hideCount} Hide
          </span>
        )}
        {minimizeCount > 0 && (
          <span className="brutal-badge bg-brutalist-accent text-black">
            <Minimize2 className="w-3 h-3 mr-1" /> {minimizeCount} Min
          </span>
        )}
        {muteCount > 0 && (
          <span className="brutal-badge bg-brutalist-purple text-white">
            <VolumeX className="w-3 h-3 mr-1" /> {muteCount} Mute
          </span>
        )}
        {profile.launch_items.length > 0 && (
          <span className="brutal-badge bg-brutalist-info text-white">
            <Rocket className="w-3 h-3 mr-1" /> {profile.launch_items.length} Launch
          </span>
        )}
        {profile.wallpaper_path && (
          <span className="brutal-badge bg-brutalist-success text-white">
            <FileImage className="w-3 h-3 mr-1" /> Wallpaper
          </span>
        )}
        {profile.app_rules.length === 0 && profile.launch_items.length === 0 && (
          <span className="text-sm text-brutalist-muted">No rules configured</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="brutal-btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          onClick={onTrigger}
        >
          <Zap className="w-4 h-4" /> Trigger
        </button>
        {!isActive && (
          <button
            className="brutal-btn bg-white flex items-center gap-1 text-xs"
            onClick={onSetActive}
          >
            <Play className="w-3 h-3" /> Set Active
          </button>
        )}
      </div>
    </div>
  );
}

interface NewProfileCardProps {
  onCreate: () => void;
}

export function NewProfileCard({ onCreate }: NewProfileCardProps) {
  return (
    <button
      className="brutal-card flex flex-col items-center justify-center gap-3 min-h-[200px] cursor-pointer hover:bg-brutalist-accent/10 transition-colors border-dashed"
      onClick={onCreate}
    >
      <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-brutalist-accent">
        <Plus className="w-6 h-6" />
      </div>
      <span className="font-black uppercase text-sm">New Profile</span>
    </button>
  );
}
