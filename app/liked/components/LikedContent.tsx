'use client'

import { useEffect } from "react";

import LikeButton from "@/components/LikeButton";
import MediaItem from "@/components/MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import { useUser } from "@/hooks/useUser";
import { Song } from "@/types";
import useAuthModal from "@/hooks/useAuthModal";

interface LikedContentProps {
  songs: Song[];
}

const LikedContent: React.FC<LikedContentProps> = ({ songs }) => {
  const { isLoading, user } = useUser();
  const authModal = useAuthModal();
  const onPlay = useOnPlay(songs);

  useEffect(() => {
    if (!isLoading && !user) {
      authModal.onOpen();
    }
  }, [isLoading, user, authModal.onOpen]);

  if (!songs.length) {
    return (
      <div
        className="
          flex
          flex-col
          gap-y-2
          w-full
          px-6
          text-neutral-400
        "
      >
        No liked songs.
      </div>
    )
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-y-2
        w-full
        p-6
      "
    >
      {songs.map(song => (
        <div
          key={song.id}
          className="
            flex
            items-center
            gap-x-4
            w-full
          "
        >
          <div
            className="flex-1"
          >
            <MediaItem data={song} onClick={(id: string) => onPlay(id)} />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))}
    </div>
  );
}

export default LikedContent;