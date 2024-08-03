// authMachine.js
import { createMachine, assign } from 'xstate';
import { auth, db } from '@/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QBsCGAXO7UFd0AsA6ASwmTAGIAZAeQHEBJAOQG0AGAXUVAAcB7WMXTE+AO24gAHogCMANhkzCAThkAmAKwAOACwzlbZco1yANCACeiAOwBma4Q0a2i21uuadWjQF8f5tExYbDwiUnIKAGUGOiYAVQAFdi4kEH5BYTEJaQR5F0I1NiKtNg0ZHWNS8ytc2yNHZ0UTWzkPa19-EECsXAJCAGN8MH6Aa2JRKAAlPgiIMTASUQA3PhGF7uDeokHhsYnp8gRxlf6MEVFk5Il0oXPsxFs2HUcjI2tXtlbrasQK5UI3LY6jprDo1N4Wn4AhgeqEBkNRuMpjNKHNRAtjqt1jDNnCdoj9iijss+KdMhdOCwZCleAJbllUjlHs8NK9lO8jJ9rN9LLIZHVCCUXI8NKCgfYoV0cSE+vi9siImAAE5KvhKwg8QIAMzVAFtCBsZdsEfKDmBiSczmJLpxrnTyfcEMyXq8OQYvj8EFolM4imxHoYNGo5LpJYatoRBFBRDgeFEYvEEgB9SJxADCaYAopFIldUjcHYyHk8XW8Ph7ebk1F4AUV+fp3u01NYw9KI1GY3HorFEknM5NJjRJnnaRk7kWnSXWa7y9zPTIg2xay4ZCV2TptGpW0EjYRUBBdeMACKoWD4ABGfFQSogFAAgkej0mAEI0GgAaRHaXt49AOXU1haIQXjtK07j6OUGienUtjAb61ZaHUrKaNusJ9Puh6iCeZ6Xtet6TJmACyNAAGqZi+b6fra+Y-gyf6yMGaiEGK3pyMUtjVlBlZqOyhAyH65RfF4bBbp04Zwhhx6nheV43hQaYABKZmm75JqR-ZHnE5Gvh+ubUaO9LiBO6jVnx7iim4cjsoUWieoUS7tH6G4Li03qidCO4RpJWHSbhcm0HQNBxAAKl+Ba-lIsiss8ciaGwJQLoUIK2ZWGhAgCjnWKUWhyDokJiW2cI4LAyrYTJeEUK+A40AA6mFtFGfRVbeIKyhuPIgELhoG7zvISgBpBOVJaCqG4n0xWlb5sn4ZmD71WOdGRVW9Qcc41irhxyiFFxNSKPxgp1johhHdocijbuE1KmVfm3gAYneJFDgwwWZvNhmOuoiHMeoJjvDoR1aNW86fEuA0tC4qjVi2BWeUVJVXVNFUEUwmZ1fp34LY1S3qFtjhxVZQZsfxOjA4YB3Cvx7JyHIQLnRGl3XdNFAEcFcSTKw6PhYt-7gv8AafMoOg0xxoKesYfN1sGMjWLFIl03Dk04UzkSzZMilvYWTWfUBdj1iG1PHWoYvxeT6g-SCR1nTDaFEAziNyZEQ7BS+ACaSZpneL2BZMLsaxFPN6ACbXeoL-K6HUnreEBA3yOKzZbfL43w4zFUBUFoWcw1H3RYQsXOAli7JfOaiaBlZQ8bY0XNrYfidKIfAQHAEjiQQdqY46AC0ZiVl3hB+v3A8uDoidhGQYBt+9xmgko8iaN4nz-Rxxf6A0wrKDT5Srh0Hk2-CuxImaE+a0tTi5+oXgVGogLKKxvUrwuLjgmBfo19bY1EB2sZH-7vxG5W5Qy1XgBewOMZAjz3AeKSSs8Lf25nyESud8bNkvrHT0FRnhCn9L6aWTwtDgLttAm8sCsb-n4kxPOnxkFbVQf-NQ8hTZrUQvnPBtcgA */
    context: {
      user: null,
      books: [],
      isAdmin: false,
      borrowLogs: [],
      successMessage: "",
      showSuccessModal: false,
    },
    id: "latestauth",
    initial: "idle",
    states: {
      idle: {
        description: "Initial state before any action is taken.",
        on: {
          LOGIN: [
            {
              target: "checkingRole",
              actions: [],
            },
          ],
          SIGNUP: [
            {
              target: "signup",
              actions: [],
            },
          ],
        },
      },
      checkingRole: {
        invoke: {
          input: {},
          src: "checkUserRole",
          onDone: [
            {
              target: "adminDashboard",
              guard:
                "inline:latestauth.checkingRole#done.invoke.latestauth.checkingRole:invocation[0][-1]#guard",
              actions: [
                {
                  type: "inline:latestauth.checkingRole#done.invoke.latestauth.checkingRole:invocation[0][-1]#transition[0]",
                },
              ],
            },
            {
              target: "userDashboard",
              actions: [
                {
                  type: "inline:latestauth.checkingRole#done.invoke.latestauth.checkingRole:invocation[0][-1]#transition[0]",
                },
              ],
            },
          ],
          onError: [
            {
              target: "idle",
              actions: [],
            },
          ],
        },
      },
      signup: {
        description: "State for signing up a new user.",
        on: {
          SIGNUP_SUCCESS: [
            {
              target: "userDashboard",
              actions: [],
            },
          ],
          SIGNUP_ERROR: [
            {
              target: "idle",
              actions: [],
            },
          ],
        },
      },
      adminDashboard: {
        description:
          "State for admin dashboard where admin can add, remove books, and see borrow logs.",
        entry: [
          {
            type: "fetchBooks",
          },
          {
            type: "fetchBorrowLogs",
          },
        ],
        on: {
          ADD_BOOK: [
            {
              actions: [
                {
                  type: "addBook",
                },
              ],
            },
          ],
          REMOVE_BOOK: [
            {
              actions: [
                {
                  type: "removeBook",
                },
              ],
            },
          ],
          CHECK_OVERDUE_BOOKS: [
            {
              actions: [
                {
                  type: "checkOverdueBooks",
                },
              ],
            },
          ],
          LOGOUT: [
            {
              target: "idle",
              actions: [
                {
                  type: "logout",
                },
              ],
            },
          ],
        },
      },
      userDashboard: {
        description:
          "State for user dashboard where user can see books, borrow, read, and put them to favorites.",
        on: {
          BORROW: [
            {
              actions: [],
            },
          ],
          READ: [
            {
              actions: [],
            },
          ],
          FAVORITE: [
            {
              actions: [],
            },
          ],
          RENEW: [
            {
              actions: [],
            },
          ],
          RETURN: [
            {
              actions: [],
            },
          ],
          SEARCH: [
            {
              actions: [],
            },
          ],
          SORT_BY_CATEGORY: [
            {
              actions: [],
            },
          ],
          LOGOUT: [
            {
              target: "idle",
              actions: [
                {
                  type: "logout",
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    actions: {
      fetchBooks: ({ context, event }) => {},
      fetchBorrowLogs: ({ context, event }) => {},
      "inline:latestauth.checkingRole#done.invoke.latestauth.checkingRole:invocation[0][-1]#transition[0]":
        assign({
          user: (_, event) => event.data.user,
          isAdmin: (_, event) => event.data.isAdmin,
        }),
      logout: ({ context, event }) => {},
      addBook: ({ context, event }) => {},
      removeBook: ({ context, event }) => {},
      checkOverdueBooks: ({ context, event }) => {},
      login: assign((context, event) => {
        return signInWithEmailAndPassword(auth, event.email, event.password)
          .then((userCredential) => {
            return { user: userCredential.user };
          });
      }),
      checkUserRole: fromPromise(({ input }) => {
        return new Promise((resolve, reject) => {
          const user = auth.currentUser;
          if (user) {
            getDoc(doc(db, 'users', user.uid)).then((userDoc) => {
              const userData = userDoc.data();
              resolve({
                user,
                isAdmin: userData && userData.role === 'admin'
              });
            }).catch(reject);
          } else {
            reject(new Error('No user logged in'));
          }
        });
      }),
    },
    actors: {
      checkUserRole: fromPromise({
      }),
    },
    guards: {
      "inline:latestauth.checkingRole#done.invoke.latestauth.checkingRole:invocation[0][-1]#guard":
        (context, event) => event.data.isAdmin,
    },
    delays: {},
  },
);