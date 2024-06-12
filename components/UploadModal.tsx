"use client"

import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import uniqid from 'uniqid';
import { useRouter } from "next/navigation";

import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const uploadModal = useUploadModal();
  const supabaseClient = useSupabaseClient();
  const form = useForm<FieldValues>({
    defaultValues: {
      author: '',
      title: '',
      song: null,
      image: null,
    }
  });
  const router = useRouter();

  const onChange = (open: boolean) => {
    if (!open) {
      form.reset();
      uploadModal.onClose();
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = values.image?.[0];
      const songFile = values.song?.[0];

      if (!imageFile || !songFile || !user) {
        toast.error('Missing fields');
        return;
      }

      const uniqID = uniqid();

      // Upload song
      const {
        data: songData,
        error: songError,
      } = await supabaseClient
        .storage
        .from('images')
        .upload(`image-${values.title}-${uniqID}`, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        return toast.error('Failed song upload');
      }


      // Upload image
      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient
        .storage
        .from('songs')
        .upload(`song-${values.title}-${uniqID}`, songFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (imageError) {
        setIsLoading(false);
        return toast.error('Failed image upload');
      }

      const {
        error: supabaseError,
      } = await supabaseClient
        .from('songs')
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path,
        });

      if (supabaseError) {
        setIsLoading(false)
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success('Song created');
      form.reset();
      uploadModal.onClose();
    } catch {

      toast.error('Something went wrong')
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title='Add a song'
      description="Upload an mp3 file"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="
          flex
          flex-col
          gap-y-4
        "
      >
        <Input
          id="title"
          placeholder='Song title'
          disabled={isLoading}
          {...form.register('title', { required: true })}
        />
        <Input
          id="author"
          placeholder='Song author'
          disabled={isLoading}
          {...form.register('author', { required: true })}
        />
        <div>
          <div className="pb-1">
            Select a song file
          </div>
          <Input
            id="song"
            type="file"
            accept=".mp3"
            disabled={isLoading}
            {...form.register('song', { required: true })}
          />
        </div>
        <div>
          <div className="pb-1">
            Select an image
          </div>
          <Input
            id="image"
            type="file"
            accept="image/*"
            disabled={isLoading}
            {...form.register('image', { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
}

export default UploadModal;