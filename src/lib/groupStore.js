import { create } from 'zustand';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const useGroupStore = create((set, get) => ({
    groups: [],
    currentGroup: null,

    createGroup: async (groupName, adminId) => {
        try {
            const groupRef = doc(collection(db, "groups"));
            await setDoc(groupRef, {
                name: groupName,
                admin: [adminId],
                members: [adminId],
                avatar: '',
                info: '',
            });

            const groupData = {
                id: groupRef.id,
                name: groupName,
                admin: [adminId],
                members: [adminId]
            };

            const userGroupRef = doc(db, "userGroups", adminId);
            const userGroupSnap = await getDoc(userGroupRef);

            if (userGroupSnap.exists()) {
                await updateDoc(userGroupRef, {
                    groups: arrayUnion(groupRef.id)
                });
            } else {
                await setDoc(userGroupRef, {
                    groups: [groupRef.id]
                });
            }

            set((state) => ({
                groups: [...state.groups, groupData]
            }));

            return groupRef.id;
        } catch (error) {
            console.error("Error creating group: ", error);
            throw error;
        }
    },

    addMemberToGroup: async (groupId, memberId) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                members: arrayUnion(memberId),
            });

            const userGroupRef = doc(db, "userGroups", memberId);
            const userGroupSnap = await getDoc(userGroupRef);

            if (userGroupSnap.exists()) {
                await updateDoc(userGroupRef, {
                    groups: arrayUnion(groupId)
                });
            } else {
                await setDoc(userGroupRef, {
                    groups: [groupId]
                });
            }

            set((state) => ({
                groups: state.groups.map((group) =>
                    group.id === groupId ? { ...group, members: [...group.members, memberId] } : group
                )
            }));
        } catch (error) {
            console.error("Error adding member to group: ", error);
            throw error;
        }
    },

    removeMemberFromGroup: async (groupId, memberId) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                members: arrayRemove(memberId),
            });

            const userGroupRef = doc(db, "userGroups", memberId);
            const userGroupSnap = await getDoc(userGroupRef);

            if (userGroupSnap.exists()) {
                await updateDoc(userGroupRef, {
                    groups: arrayRemove(groupId)
                });
            }

            set((state) => ({
                groups: state.groups.map((group) =>
                    group.id === groupId ? { ...group, members: group.members.filter((id) => id !== memberId) } : group
                )
            }));
        } catch (error) {
            console.error("Error removing member from group: ", error);
            throw error;
        }
    },

    changeMemberRole: async (groupId, memberId, role) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);
            const groupData = groupSnap.data();

            if (role === "admin") {
                await updateDoc(groupRef, {
                    admin: arrayUnion(memberId),
                });
            } else if (role === "member") {
                await updateDoc(groupRef, {
                    admin: arrayRemove(memberId),
                });
            }

            set((state) => ({
                groups: state.groups.map((group) => {
                    if (group.id === groupId) {
                        const updatedAdmins = role === "admin" ?
                            [...group.admin, memberId] :
                            group.admin.filter((id) => id !== memberId);
                        return { ...group, admin: updatedAdmins };
                    }
                    return group;
                })
            }));
        } catch (error) {
            console.error("Error changing member role: ", error);
            throw error;
        }
    },

    fetchGroups: async (userId) => {
        try {
            const userGroupRef = doc(db, "userGroups", userId);
            const userGroupSnap = await getDoc(userGroupRef);
            if (userGroupSnap.exists()) {
                const groups = userGroupSnap.data().groups || [];
                const groupPromises = groups.map(async (groupId) => {
                    const groupRef = doc(db, "groups", groupId);
                    const groupSnap = await getDoc(groupRef);
                    return { id: groupId, ...groupSnap.data() };
                });
                const groupData = await Promise.all(groupPromises);
                set({ groups: groupData });
            }
        } catch (error) {
            console.error("Error fetching groups: ", error);
        }
    },

    selectGroup: (groupId) => {
        const group = get().groups.find((group) => group.id === groupId);
        set({ currentGroup: group });
    },

    addMessageToGroup: async (groupId, message) => {
        try {
            const groupMessagesRef = collection(db, "groupMessages", groupId, "messages");
            await addDoc(groupMessagesRef, message);

            set((state) => ({
                groups: state.groups.map((group) =>
                    group.id === groupId ? { ...group, messages: [...group.messages, message] } : group
                )
            }));
        } catch (error) {
            console.error("Error adding message to group: ", error);
            throw error;
        }
    },

    setCurrentGroup: (groupId) =>
        set((state) => ({
            currentGroup: groupId,
        })),
}));
