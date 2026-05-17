import React, { useState } from 'react';
import { formatCurrency } from '../../utils/salaryUtils';

const AttendanceEntryTable = ({ entries, onUpdate, onDelete }) => {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditStart = (entry) => {
    setEditId(entry.id);
    setEditData({
      days_present: entry.days_present,
      rate_per_day: entry.rate_per_day,
      ot_amount: entry.ot_amount || 0,
      advance: entry.advance || 0,
    });
  };

  const handleEditSave = (id) => {
    onUpdate(id, editData);
    setEditId(null);
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border border-gray-300 p-2 text-left">CLMS ID</th>
            <th className="border border-gray-300 p-2 text-left">Employee Name</th>
            <th className="border border-gray-300 p-2 text-right">Days Present</th>
            <th className="border border-gray-300 p-2 text-right">Rate/Day</th>
            <th className="border border-gray-300 p-2 text-right">OT Amount</th>
            <th className="border border-gray-300 p-2 text-right">Advance</th>
            <th className="border border-gray-300 p-2 text-right">Payable</th>
            <th className="border border-gray-300 p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.id}
              className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="border border-gray-300 p-2">{entry.clms_id}</td>
              <td className="border border-gray-300 p-2">
                {entry.employee_details?.name || 'N/A'}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {editId === entry.id ? (
                  <input
                    type="number"
                    value={editData.days_present}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        days_present: parseFloat(e.target.value),
                      })
                    }
                    step="0.5"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  entry.days_present
                )}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {editId === entry.id ? (
                  <input
                    type="number"
                    value={editData.rate_per_day}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        rate_per_day: parseFloat(e.target.value),
                      })
                    }
                    step="0.01"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  formatCurrency(entry.rate_per_day)
                )}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {editId === entry.id ? (
                  <input
                    type="number"
                    value={editData.ot_amount || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        ot_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  formatCurrency(entry.ot_amount || 0)
                )}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {editId === entry.id ? (
                  <input
                    type="number"
                    value={editData.advance || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        advance: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                ) : (
                  formatCurrency(entry.advance || 0)
                )}
              </td>
              <td className="border border-gray-300 p-2 text-right font-semibold">
                {formatCurrency(
                  (entry.days_present || 0) * (entry.rate_per_day || 0) +
                  (entry.ot_amount || 0) -
                  (entry.advance || 0)
                )}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {editId === entry.id ? (
                  <>
                    <button
                      onClick={() => handleEditSave(entry.id)}
                      className="text-green-600 hover:text-green-800 mx-1"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="text-red-600 hover:text-red-800 mx-1"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditStart(entry)}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="text-red-600 hover:text-red-800 mx-1"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceEntryTable;
