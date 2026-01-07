import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to handle protected actions that require authentication
 * Shows login prompt modal if user is not authenticated
 *
 * @example
 * const { checkAuth, LoginPrompt } = useProtectedAction('add to favorites');
 *
 * const handleAddToFavorites = async () => {
 *   if (!checkAuth()) return;
 *   // Proceed with the action
 * };
 *
 * return (
 *   <>
 *     <Button onPress={handleAddToFavorites} />
 *     <LoginPrompt />
 *   </>
 * );
 */
export const useProtectedAction = (actionName: string = 'perform this action') => {
    const { isAuthenticated } = useAuth();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    /**
     * Check if user is authenticated
     * If not, shows login prompt modal
     * @returns true if authenticated, false otherwise
     */
    const checkAuth = useCallback((): boolean => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return false;
        }
        return true;
    }, [isAuthenticated]);

    /**
     * Execute an action only if user is authenticated
     * @param action - Function to execute if authenticated
     */
    const executeProtectedAction = useCallback(
        async (action: () => void | Promise<void>) => {
            if (checkAuth()) {
                await action();
            }
        },
        [checkAuth]
    );

    const closeLoginPrompt = useCallback(() => {
        setShowLoginPrompt(false);
    }, []);

    return {
        checkAuth,
        executeProtectedAction,
        showLoginPrompt,
        setShowLoginPrompt,
        closeLoginPrompt,
        actionName,
    };
};

export default useProtectedAction;
