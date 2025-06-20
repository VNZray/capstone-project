export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    // Basic validation for ISO-like string, can be enhanced
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/.test(dateString)) {
      // console.warn('Invalid date string format:', dateString);
      // return 'Invalid Date Format'; // Or handle as per requirement
    }
    const date = new Date(dateString);
    // Check if date is valid after parsing
    if (isNaN(date.getTime())) {
      // console.warn('Parsed invalid date:', dateString);
      return 'Invalid Date';
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // console.error('Error formatting date:', dateString, e);
    return 'Invalid Date';
  }
};

// Add other formatter functions here as needed
