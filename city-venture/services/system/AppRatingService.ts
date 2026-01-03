import { supabase } from '@/utils/supabase';

/**
 * App Rating Interface
 * Matches the app_rating table structure
 */
export interface AppRating {
    id?: number;
    rating: number;
    feedback?: string;
    created_at?: string;
    user_id: string;
}

/**
 * Bug Report Interface
 * Matches the bug_report table structure
 */
export interface BugReport {
    id?: number;
    title: string;
    description: string;
    screenshot_url?: string;
    user_id: string;
    created_at?: string;
}

/**
 * App Rating Service
 * Handles app ratings and bug reports using Supabase
 */
class AppRatingService {
    /**
     * Submit an app rating
     */
    async submitRating(rating: Omit<AppRating, 'id' | 'created_at'>): Promise<AppRating> {
        try {
            const { data, error } = await supabase
                .from('app_rating')
                .insert([rating])
                .select()
                .single();

            if (error) {
                console.error('[AppRatingService] Failed to submit rating:', error);
                throw error;
            }

            console.log('[AppRatingService] Rating submitted successfully:', data);
            return data;
        } catch (error) {
            console.error('[AppRatingService] Error submitting rating:', error);
            throw error;
        }
    }

    /**
     * Update an existing rating
     */
    async updateRating(
        ratingId: number,
        updates: Partial<Omit<AppRating, 'id' | 'user_id' | 'created_at'>>
    ): Promise<AppRating> {
        try {
            const { data, error } = await supabase
                .from('app_rating')
                .update(updates)
                .eq('id', ratingId)
                .select()
                .single();

            if (error) {
                console.error('[AppRatingService] Failed to update rating:', error);
                throw error;
            }

            console.log('[AppRatingService] Rating updated successfully:', data);
            return data;
        } catch (error) {
            console.error('[AppRatingService] Error updating rating:', error);
            throw error;
        }
    }

    /**
     * Get rating by user ID
     */
    async getRatingByUserId(userId: string): Promise<AppRating | null> {
        try {
            const { data, error } = await supabase
                .from('app_rating')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('[AppRatingService] Failed to get rating:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('[AppRatingService] Error getting rating:', error);
            throw error;
        }
    }

    /**
     * Get all ratings (admin use)
     */
    async getAllRatings(): Promise<AppRating[]> {
        try {
            const { data, error } = await supabase
                .from('app_rating')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[AppRatingService] Failed to get all ratings:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('[AppRatingService] Error getting all ratings:', error);
            throw error;
        }
    }

    /**
     * Get average rating
     */
    async getAverageRating(): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('app_rating')
                .select('rating');

            if (error) {
                console.error('[AppRatingService] Failed to get average rating:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                return 0;
            }

            const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
            return sum / data.length;
        } catch (error) {
            console.error('[AppRatingService] Error getting average rating:', error);
            return 0;
        }
    }

    /**
     * Delete a rating
     */
    async deleteRating(ratingId: number): Promise<void> {
        try {
            const { error } = await supabase
                .from('app_rating')
                .delete()
                .eq('id', ratingId);

            if (error) {
                console.error('[AppRatingService] Failed to delete rating:', error);
                throw error;
            }

            console.log('[AppRatingService] Rating deleted successfully');
        } catch (error) {
            console.error('[AppRatingService] Error deleting rating:', error);
            throw error;
        }
    }

    /**
     * Submit a bug report
     */
    async submitBugReport(
        report: Omit<BugReport, 'id' | 'created_at'>
    ): Promise<BugReport> {
        try {
            const { data, error } = await supabase
                .from('bug_report')
                .insert([report])
                .select()
                .single();

            if (error) {
                console.error('[AppRatingService] Failed to submit bug report:', error);
                throw error;
            }

            console.log('[AppRatingService] Bug report submitted successfully:', data);
            return data;
        } catch (error) {
            console.error('[AppRatingService] Error submitting bug report:', error);
            throw error;
        }
    }

    /**
     * Get bug reports by user ID
     */
    async getBugReportsByUserId(userId: string): Promise<BugReport[]> {
        try {
            const { data, error } = await supabase
                .from('bug_report')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[AppRatingService] Failed to get bug reports:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('[AppRatingService] Error getting bug reports:', error);
            throw error;
        }
    }

    /**
     * Get all bug reports (admin use)
     */
    async getAllBugReports(): Promise<BugReport[]> {
        try {
            const { data, error } = await supabase
                .from('bug_report')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[AppRatingService] Failed to get all bug reports:', error);
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('[AppRatingService] Error getting all bug reports:', error);
            throw error;
        }
    }

    /**
     * Upload screenshot for bug report
     */
    async uploadScreenshot(
        userId: string,
        fileUri: string,
        fileName: string
    ): Promise<string> {
        try {
            // Read the file as blob
            const response = await fetch(fileUri);
            const blob = await response.blob();

            const timestamp = Date.now();
            const finalPath = `bug-reports/${userId}/${timestamp}-${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('reports')
                .upload(finalPath, blob, {
                    contentType: blob.type || 'image/jpeg',
                    upsert: false,
                });

            if (uploadError) {
                console.error('[AppRatingService] Screenshot upload failed:', uploadError);
                throw uploadError;
            }

            const { data: publicData } = supabase.storage
                .from('reports')
                .getPublicUrl(finalPath);

            console.log('[AppRatingService] Screenshot uploaded:', publicData.publicUrl);
            return publicData.publicUrl;
        } catch (error) {
            console.error('[AppRatingService] Error uploading screenshot:', error);
            throw error;
        }
    }
}

export default new AppRatingService();
