/**
 * Booking Payment Result Modal
 * Wrapper component that shows the appropriate modal based on payment result.
 * Use this component in screens that need to display payment results.
 */

import React from 'react';
import BookingPaymentSuccessModal from './BookingPaymentSuccessModal';
import BookingPaymentFailedModal from './BookingPaymentFailedModal';

export type PaymentResultStatus = 'success' | 'failed' | 'cancelled' | 'expired' | 'error' | null;

interface BookingDetails {
  bookingId?: string;
  roomName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalAmount?: number;
}

interface BookingPaymentResultModalProps {
  /** Current payment result status */
  status: PaymentResultStatus;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback to navigate to booking details */
  onViewBooking: () => void;
  /** Callback to navigate back to home */
  onBackToHome: () => void;
  /** Callback to retry payment (for failed/cancelled) */
  onRetryPayment: () => void;
  /** Booking details to display */
  bookingDetails?: BookingDetails;
  /** Error message for failed payments */
  errorMessage?: string;
}

/**
 * BookingPaymentResultModal
 * 
 * A unified component to handle displaying the result of a booking payment.
 * Automatically shows the success or failure modal based on the status prop.
 * 
 * @example
 * ```tsx
 * const [paymentStatus, setPaymentStatus] = useState<PaymentResultStatus>(null);
 * 
 * <BookingPaymentResultModal
 *   status={paymentStatus}
 *   onClose={() => setPaymentStatus(null)}
 *   onViewBooking={() => router.push(Routes.profile.bookings.detail(bookingId))}
 *   onBackToHome={() => router.replace(Routes.tabs.home)}
 *   onRetryPayment={() => { setPaymentStatus(null); processPayment(); }}
 *   bookingDetails={{
 *     bookingId: 'abc123',
 *     roomName: 'Deluxe Room',
 *     checkInDate: '2025-12-25',
 *     checkOutDate: '2025-12-26',
 *     totalAmount: 4170,
 *   }}
 * />
 * ```
 */
const BookingPaymentResultModal: React.FC<BookingPaymentResultModalProps> = ({
  status,
  onClose,
  onViewBooking,
  onBackToHome,
  onRetryPayment,
  bookingDetails,
  errorMessage,
}) => {
  const isVisible = status !== null;
  const isSuccess = status === 'success';

  if (isSuccess) {
    return (
      <BookingPaymentSuccessModal
        visible={isVisible}
        onClose={onClose}
        onViewBooking={onViewBooking}
        onBackToHome={onBackToHome}
        bookingId={bookingDetails?.bookingId}
        roomName={bookingDetails?.roomName}
        checkInDate={bookingDetails?.checkInDate}
        checkOutDate={bookingDetails?.checkOutDate}
        totalAmount={bookingDetails?.totalAmount}
      />
    );
  }

  if (status && ['failed', 'cancelled', 'expired', 'error'].includes(status)) {
    return (
      <BookingPaymentFailedModal
        visible={isVisible}
        onClose={onClose}
        onRetryPayment={onRetryPayment}
        onViewBooking={onViewBooking}
        onBackToHome={onBackToHome}
        bookingId={bookingDetails?.bookingId}
        errorMessage={errorMessage}
        failureType={status as 'failed' | 'cancelled' | 'expired' | 'error'}
      />
    );
  }

  return null;
};

export default BookingPaymentResultModal;
export { BookingPaymentSuccessModal, BookingPaymentFailedModal };
