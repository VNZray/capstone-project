import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';

/**
 * Hook to require authentication for protected actions
 * Returns a function that checks if user is authenticated before executing an action
 *
 * Usage:
 * ```
 * const requireAuth = useRequireAuth();
 *
 * const handleBookRoom = () => {
 *   requireAuth(() => {
 *     // Execute booking logic only if authenticated
 *     router.push('/checkout');
 *   }, 'book a room');
 * };
 * ```
 */
export function useRequireAuth() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const requireAuth = useCallback(
        (action: () => void, actionName?: string) => {
            if (!isAuthenticated || !user) {
                // Show alert prompting user to log in
                Alert.alert(
                    'Login Required',
                    `You need to be logged in to ${actionName || 'perform this action'}. Would you like to log in now?`,
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                        {
                            text: 'Log In',
                            onPress: () => {
                                router.push('/(auth)/login');
                            },
                        },
                    ]
                );
                return false;
            }

            // User is authenticated, execute the action
            action();
            return true;
        },
        [isAuthenticated, user, router]
    );

    return requireAuth;
}

/**
 * Hook to require authentication with modal-based prompt
 * Use this for better UX with LoginPromptModal component
 *
 * Usage:
 * ```
 * const { checkAuth, showLoginPrompt, setShowLoginPrompt } = useRequireAuthWithModal();
 *
 * const handleBookRoom = () => {
 *   if (!checkAuth('book a room')) return;
 *   // Execute booking logic
 * };
 *
 * return (
 *   <>
 *     <Button onPress={handleBookRoom} />
 *     <LoginPromptModal
 *       visible={showLoginPrompt}
 *       onClose={() => setShowLoginPrompt(false)}
 *       actionName={actionName}
 *     />
 *   </>
 * );
 * ```
 */
export function useRequireAuthWithModal() {
    const { isAuthenticated } = useAuth();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [actionName, setActionName] = useState('perform this action');

    const checkAuth = useCallback(
        (action?: string): boolean => {
            if (!isAuthenticated) {
                setActionName(action || 'perform this action');
                setShowLoginPrompt(true);
                return false;
            }
            return true;
        },
        [isAuthenticated]
    );

    return {
        checkAuth,
        showLoginPrompt,
        setShowLoginPrompt,
        actionName,
    };
}

/**
 * Hook variant that returns a promise-based requireAuth function
 * Useful for async operations
 */
export function useRequireAuthAsync() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const requireAuth = useCallback(
        <T,>(
            action: () => Promise<T>,
            actionName?: string
        ): Promise<T | null> => {
            return new Promise((resolve) => {
                if (!isAuthenticated || !user) {
                    Alert.alert(
                        'Login Required',
                        `You need to be logged in to ${actionName || 'perform this action'}. Would you like to log in now?`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => resolve(null),
                            },
                            {
                                text: 'Log In',
                                onPress: () => {
                                    router.push('/(auth)/login');
                                    resolve(null);
                                },
                            },
                        ]
                    );
                    return;
                }

                // User is authenticated, execute the action
                action().then(resolve).catch(() => resolve(null));
            });
        },
        [isAuthenticated, user, router]
    );

    return requireAuth;
}
