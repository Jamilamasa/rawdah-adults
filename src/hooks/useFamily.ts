'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { familyApi } from '@/lib/api';
import { showApiErrorToast, showSuccessToast } from '@/lib/toast';

export function useFamily() {
  return useQuery({
    queryKey: ['family'],
    queryFn: familyApi.get,
  });
}

export function useFamilyMembers() {
  return useQuery({
    queryKey: ['family', 'members'],
    queryFn: familyApi.members,
    select: (data) => data.members,
  });
}

export function useChildren() {
  const query = useFamilyMembers();
  const children = useMemo(
    () => query.data?.filter((member) => member.role === 'child' && member.is_active) ?? [],
    [query.data]
  );

  return { ...query, children };
}

export function useAdults() {
  const query = useFamilyMembers();
  const adults = useMemo(
    () =>
      query.data?.filter(
        (member) =>
          ['parent', 'adult_relative'].includes(member.role) && member.is_active
      ) ?? [],
    [query.data]
  );

  return { ...query, adults };
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyApi.createMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
      showSuccessToast('Member added', 'The account is ready to use.');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not add this member.');
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof familyApi.updateMember>[1] }) =>
      familyApi.updateMember(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
      showSuccessToast('Member updated');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not update this member.');
    },
  });
}

export function useDeactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyApi.deactivateMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family', 'members'] });
      showSuccessToast('Member deactivated');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not deactivate this member.');
    },
  });
}

export function useRantCount(childId?: string) {
  return useQuery({
    queryKey: ['family', 'rants', childId],
    queryFn: () => familyApi.rantCount(childId as string),
    enabled: Boolean(childId),
  });
}

export function useAccessControl() {
  return useQuery({
    queryKey: ['family', 'access-control'],
    queryFn: familyApi.listAccessControl,
    select: (data) => data.access_control,
  });
}

export function useSetAccessControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ granteeId, permissions }: { granteeId: string; permissions: string[] }) =>
      familyApi.setAccessControl(granteeId, permissions),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family', 'access-control'] });
      showSuccessToast('Permissions saved');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not save access permissions.');
    },
  });
}

export function useRevokeAccessControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyApi.revokeAccessControl,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family', 'access-control'] });
      showSuccessToast('Permissions revoked');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not revoke access permissions.');
    },
  });
}

export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: familyApi.update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['family'] });
      showSuccessToast('Family profile updated');
    },
    onError: (error) => {
      showApiErrorToast(error, 'Could not update family profile.');
    },
  });
}
