"use client";
// Reset organization chart to initial state
export function ResetButton() {
  const handleReset = async () => {
    if (confirm('Reset all changes and restore the original organization chart?')) {
      try {
        const response = await fetch('/api/employees/reset', {
          method: 'POST'
        });
        
        if (response.ok) {
          window.location.reload();
        } else {
          alert('Failed to reset the organization chart');
        }
      } catch (error) {
        console.error('Reset error:', error);
        alert('An error occurred while resetting');
      }
    }
  };

  return (
    <button
      onClick={handleReset}
      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      title="Reset organization chart to initial state"
    >
      Reset Chart
    </button>
  );
}
