import React from 'react';
import { AlertTriangleIcon } from '../constants';

interface MalpracticeReportPanelProps {
  report: string | null;
}

const MalpracticeReportPanel: React.FC<MalpracticeReportPanelProps> = ({ report }) => {
  if (!report) {
    return (
      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
        <h3 className="text-lg font-semibold text-green-300">Malpractice Report</h3>
        <p className="text-green-300/80 mt-2 text-sm">No malpractice activities were detected during the interview.</p>
      </div>
    );
  }

  const reportEntries = report.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-red-400"><AlertTriangleIcon /></div>
        <h3 className="text-lg font-semibold text-red-300">Malpractice Report</h3>
      </div>
      <div className="space-y-3 text-sm">
        {reportEntries.map((entry, index) => (
          <div key={index} className="p-3 bg-slate-950/50 rounded-md border border-slate-700/50">
            <p className="text-slate-300">{entry}</p>
          </div>
        ))}
      </div>
       <p className="text-xs text-red-400/70 mt-4 italic">
          Note: This report is generated based on automated detection and should be considered alongside the full interview context.
       </p>
    </div>
  );
};

export default MalpracticeReportPanel;