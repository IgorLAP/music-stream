'use client';

import { useEffect, useState } from "react";

import { Song } from "@/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import useSound from 'use-sound';

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [currentPlayingSongId, setCurrentPlayingSongId] = useState<number>();

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = !volume ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = () => {
    if (!player.ids.length) return;

    const currentIndex = player.ids.findIndex(id => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (!player.ids.length) return;

    const currentIndex = player.ids.findIndex(id => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids.at(-1)!);
    }

    player.setId(previousSong);
  };

  const [play, {
    pause,
    sound,
    duration
  }] = useSound(
    //when songUrl changes, the hook doesnt changes dynamically
    //is important to pass key to component because of that
    songUrl,
    {
      volume,
      onplay: (id: number) => {
        setIsPlaying(true);
        setCurrentPlayingSongId(id);
      },
      onend: () => {
        setIsPlaying(false);
        onPlayNext();
      },
      onpause: () => setIsPlaying(false),
      format: ['mp3'],
      // howler.js to stream audio or large files
      html5: true,
    }
  );

  // handle timer change
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer((prevValue) => prevValue + 1)
      }, 1000);
    }

    if (!isPlaying) {
      if (interval!) clearInterval(interval);
    }

    return () => {
      clearInterval(interval)
    }
  }, [isPlaying])

  useEffect(() => {
    sound?.play();

    return () => {
      sound?.unload();
    };
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (!volume) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  }

  const getSongMinute = (valueInSeconds: number, isMaxTimer?: boolean) => {
    let seconds = 0;
    if (valueInSeconds % 60 !== 0) {
      seconds = valueInSeconds % 60;
    }
    return `${(isMaxTimer ? MAX_VALUE_TIMER / 60 : VALUE_TIMER / 60).toFixed(2).split('.')[0]}:${String(seconds).padStart(2, '0')}`;
  }

  const VALUE_TIMER = timer ? +(timer.toFixed(2).split('.')[0]) : 0;
  const MAX_VALUE_TIMER = duration ? +(duration / 1000).toFixed() : 0;

  return (
    <div>
      <div
        className="
        grid grid-cols-2 md:grid-cols-3 h-full
      "
      >
        <div
          className="
          flex
          w-full
          justify-start
        "
        >
          <div
            className="
            flex
            items-center
            gap-x-4
            max-w-[260px]
            sm:max-w-full
          "
          >
            <MediaItem data={song} />
            <LikeButton songId={song.id} />
          </div>
        </div>

        <div
          className="
          flex
          md:hidden
          col-auto
          w-full
          justify-end
          items-center
        "
        >
          <div
            onClick={handlePlay}
            className="
            h-10
            w-10
            flex
            items-center
            justify-center
            rounded-full
            bg-white
            p-1
            cursor-pointer
          "
          >
            <Icon size={30} className="text-black" />
          </div>
        </div>

        <div
          className="
          hidden
          md:block
        "
        >
          <div
            className="flex"
          >
            <p className="pr-1 text-xs text-neutral-400">{getSongMinute(VALUE_TIMER)}</p>
            <Slider
              value={VALUE_TIMER}
              maxValue={MAX_VALUE_TIMER}
              onChange={(value) => {
                sound?.seek(value, currentPlayingSongId);
                setTimer(value);
              }}
            />
            <p className="pl-1 text-xs text-neutral-400">{getSongMinute(MAX_VALUE_TIMER, true)}</p>
          </div>
          <div
            className="
          hidden
          h-full
          md:flex
          justify-center
          items-center
          w-full
          max-w-[722px]
          gap-x-6
        "
          >
            <AiFillStepBackward
              onClick={onPlayPrevious}
              size={30}
              className="
            text-neutral-400 
            cursor-pointer 
            hover:text-white 
            transition
          "
            />
            <div
              onClick={handlePlay}
              className="
            flex
            items-center
            justify-center
            h-10
            w-10
            rounded-full
            bg-white
            p-1
            cursor-pointer
          "
            >
              <Icon size={30} className="text-black" />
            </div>
            <AiFillStepForward
              onClick={onPlayNext}
              size={30}
              className="
            text-neutral-400 
            cursor-pointer 
            hover:text-white 
            transition
          "
            />
          </div>
        </div>

        <div
          className="
          hidden
          md:flex
          w-full
          justify-end
          pr-2
        "
        >
          <div
            className="
            flex
            items-center
            gap-x-2
            w-[120px]
          "
          >
            <VolumeIcon
              onClick={toggleMute}
              size={34}
              className="cursor-pointer"
            />
            <Slider
              value={volume}
              onChange={(value) => setVolume(value)}
            />
          </div>
        </div>


      </div>
      <div className="flex md:hidden mt-1">
        <p className="pr-1 text-xs text-neutral-400">{getSongMinute(VALUE_TIMER)}</p>

        <Slider
          value={VALUE_TIMER}
          maxValue={MAX_VALUE_TIMER}
          onChange={(value) => {
            sound?.seek(value, currentPlayingSongId);
            setTimer(value);
          }}
        />
        <p className="pl-1 text-xs text-neutral-400">{getSongMinute(MAX_VALUE_TIMER, true)}</p>

      </div>
    </div>
  );
}

export default PlayerContent;