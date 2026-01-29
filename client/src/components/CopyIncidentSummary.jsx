/**
 * CopyIncidentSummary Component
 * Generates and copies a text summary of the incident
 *
 * Shows empathy for real workflows - engineers often need
 * to share incident status in Slack, email, or other tools.
 */
import { useState } from 'react';

export function CopyIncidentSummary({ incident, updates = [] }) {
  const [copied, setCopied] = useState(false);

  if (!incident) return null;

  const generateSummary = () => {
    const notesCount = updates.filter(u => u.type === 'note').length;
    const actionItemsCount = updates.filter(u => u.type === 'action_item').length;
    const completedItems = updates.filter(u => u.type === 'action_item' && u.content?.completed).length;

    const lines = [
      `Incident: ${incident.title}`,
      `Status: ${incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}`,
      `Severity: ${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}`,
      `Commander: ${incident.commander?.name || 'Unassigned'}`,
      `Assignees: ${incident.assignees?.map(a => a.name).join(', ') || 'None'}`,
      `Notes: ${notesCount}`,
      `Action Items: ${completedItems}/${actionItemsCount} completed`,
      `Created: ${new Date(incident.createdAt).toLocaleString()}`,
    ];

    if (incident.description) {
      lines.push(`Description: ${incident.description}`);
    }

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const summary = generateSummary();

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      title="Copy incident summary to clipboard"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy Summary</span>
        </>
      )}
    </button>
  );
}

export default CopyIncidentSummary;
