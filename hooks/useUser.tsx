import { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@supabase/auth-helpers-nextjs';
import { useSessionContext, useUser as UseSupaUser } from '@supabase/auth-helpers-react';

import { Subscription, UserDetails } from '@/types';

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();

  const user = UseSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const getUserDetails = () =>
    supabase
      .from('users')
      .select('*')
      .single();
  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();

  useEffect(() => {
    const isAlreadyLoggedButWithNoData = user && !isLoadingData && !userDetails && !subscription
    if (isAlreadyLoggedButWithNoData) {
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then((results) => {
        const userDetailsPromise = results[0];
        const subscriptionPromise = results[1];

        if (userDetailsPromise.status === 'fulfilled') {
          setUserDetails(userDetailsPromise.value.data as UserDetails);
        }

        if (subscriptionPromise.status === 'fulfilled') {
          setSubscription(subscriptionPromise.value.data as Subscription);
        }

        setIsLoadingData(false);
      })
    }

    const isNoUser = !user && !isLoadingData && !isLoadingUser
    if (isNoUser) {
      setUserDetails(null);
      setSubscription(null)
    }

  }, [user, isLoadingUser]);


  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingData || isLoadingUser,
    subscription,
  };

  return <UserContext.Provider value={value} {...props} />
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a MyUserContextProvider')
  }

  return context;
}
