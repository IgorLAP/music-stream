'use client'

import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import usePlayer from "@/hooks/usePlayer";
import PlayerContent from "./PlayerContent";

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const songUrl = useLoadSongUrl(song!);

  if (!song || !songUrl || !player.activeId) return;

  return (
    <div
      className="
        fixed
        bottom-0
        bg-black
        w-full
        md:py-2
        h-[90px]
        px-4
      "
    >
      <PlayerContent
        // whenever the key changes it completely destroys the component and re-renders it. 
        // nedded to skip songs properly
        key={songUrl}
        song={song}
        songUrl={songUrl}
      />
    </div>
  );
}

export default Player;