import { Song } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getLikedSongs = async (): Promise<Song[]> => {
  const supabase = createServerComponentClient({
    cookies,
  });

  const {
    data: userData,
  } = await supabase.auth.getUser();

  const {
    data, error
  } = await supabase
    .from('liked_songs')
    // get all songs from the relation the field song_id has with songs table in songs.id
    .select('*, songs(*)')
    .eq('user_id', userData.user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.log(error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map(item => ({
    ...item.songs,
  }))
};

export default getLikedSongs;